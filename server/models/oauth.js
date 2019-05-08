//require('dotenv').config();
const AWS = require('aws-sdk');
const crypto = require('crypto');
const jwtDecode = require('jwt-decode');


//Define the AWS Cognito Service region, credentials, target User Pool and target client ID
// Visit https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/ for the AWS SDK APi documentation
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.Credentials(process.env.PS_COG_ACCESS_KEY_ID, process.env.PS_COG_SECRET_ACCESS_KEY);
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const user_pool_id = 'us-east-1_Aw4rQyygr';
const client_id = '6u5bpn6m4p59l3st62creu01h4';

//Define the algorithm, key & intialization vector used for the API key encryption
const algorithm = 'aes-128-cbc';
const key = crypto.scryptSync('lernt.io_secret_key', 'salt', 16);
const iv = Buffer.alloc(16, 0);

//This is the exported object
const oauth = module.exports = {};



/*
signUp()
This function creates a new user account using the name, email(aka username) and password parameters.
A successful signup occurs across 3 AWS service calls
 - adminCreateUser(): creates a new user with temporary password
 - adminInitiateAuth(): signs in the user to change the temporary password
 - adminRespondToAuthChallenge(): instantly responds to the session challenge  returned by challenge adminInitiateAuth() call
it returns an object comprising email, api_key, access_token and status attributes on success or throws an error
*/
oauth.signUp = function (name, email, password){
  let user = {}; // the "user" object to return upon successful signUp
  user.username = email;
  user.name = name;

  let params = {
    UserPoolId: user_pool_id,
    Username: email,
    ForceAliasCreation: false,
    MessageAction: "SUPPRESS",
    TemporaryPassword: '11111111',
    UserAttributes: [
      { Name: 'email_verified', Value: 'true' },
      { Name: 'name', Value: name },
      { Name: 'email', Value: email }
    ]
  };
  return cognitoidentityserviceprovider.adminCreateUser(params).promise().then((user)=>{
      let params = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        ClientId: client_id,
        UserPoolId: user_pool_id,
        AuthParameters: {'USERNAME': email,'PASSWORD': '11111111'}
      };
      return cognitoidentityserviceprovider.adminInitiateAuth(params).promise();
    })
    .then((challenge)=>{
      let params = {
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        ClientId: client_id,
        UserPoolId: user_pool_id,
        ChallengeResponses: {
          'USERNAME': challenge.ChallengeParameters.USER_ID_FOR_SRP,
          'NEW_PASSWORD': password // Sets the new user password
        },
        Session: challenge.Session
      };
      return cognitoidentityserviceprovider.adminRespondToAuthChallenge(params).promise();
    })
    .then((token_data)=>{
      let user_data = jwtDecode(token_data.AuthenticationResult.IdToken); // decodes the returned ID token
      user.apikey = GenAPIKey(user_data.sub); // encrypts and persists the user id as a dated API key
      user.status = 'new user'; // persists the status of the authenticated user
      user.access_token = token_data.AuthenticationResult.AccessToken;
      user.id = user_data.sub
      return user; //returns the user object
    })
}


/*
signIn()
This function authenticates a returning user based on username, password and users a "user" object.
A successful sigin occurs using the adminInitiateAuth service call.
it returns an object comprising email, api_key, access_token and status attributes on success or throws an error
*/
oauth.signIn = function (username, password){
  let user = {};
  user.username = username;

  let params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: client_id,
    UserPoolId: user_pool_id,
    AuthParameters: {
      'USERNAME': username,
      'PASSWORD': password
    }
  };
  return cognitoidentityserviceprovider.adminInitiateAuth(params).promise().then((token_data)=>{
      let user_data = jwtDecode(token_data.AuthenticationResult.IdToken);
      user.apikey = GenAPIKey(user_data.sub);// encrypts and persists the user id as a dated API key
      user.status = 'returning user'; //persists the status of the authenticated user
      user.access_token = token_data.AuthenticationResult.AccessToken;
      user.id = user_data.sub
      return user;//returns the user object
    })
}


/*
deleteUser()
This function deletes a returning user in two phases
  - Signin() : Verifies user initating the account deletion
  - adminDeleteUser() service call : deletes the user from the database
it returns an object comprising with a status attribute on success or throws an error
*/
oauth.deleteUser = function (username, password){
  let user = {};
  return oauth.signIn(username, password).then((user_data)=>{
      let params = {
        UserPoolId: user_pool_id,
        Username: user_data.username
      };
      return cognitoidentityserviceprovider.adminDeleteUser(params).promise();
    })
    .then((empty)=>{
      user.status = 'deleted';
      return user;
    })
}


/*
changePassword()
This function changes a returning user's password in two phases
  - Signin() service call: Verifies user initating the password change request
  - changePassword() service call: updates the user's password
it returns an empty object on success or throws an error
*/
oauth.changePassword = function (username, prev_password, new_password){
  return oauth.signIn(username, prev_password).then((user)=>{
      let params = {
        AccessToken: user.access_token,
        PreviousPassword: prev_password,
        ProposedPassword: new_password
      };
      return cognitoidentityserviceprovider.changePassword(params).promise();
    })
}


/*
forgotPassword()
This function sends a verification code to the user's email.
The old password remains valid until the a successful confirmForgotPassword() call
it returns an empty object on success or throws an error
*/
oauth.forgotPassword = function (username){
  let params = {
    ClientId: client_id,
    Username: username
  };
  return cognitoidentityserviceprovider.forgotPassword(params).promise();
}


/*
confirmForgotPassword()
This function resets the user's password based on the provided verififcation code.
it returns an empty object on success or throws an error
*/
oauth.confirmForgotPassword = function (username, new_password, code){
  let params = {
    ClientId: client_id,
    ConfirmationCode: code,
    Password: new_password,
    Username: username
  };
  return cognitoidentityserviceprovider.confirmForgotPassword(params).promise();
}


/*
guard()
This middleware identifies the "apikey" attribute from the incoming req.body object.
it translates the 'apikey' to the actual user id using VerifyAPIKey(). This user id
is saved back to the req.body object as "lernt_id" to be used by secure routes.
*/
oauth.guard = function(req, res, next){
  if (req.body.apikey){
    let temp = VerifyAPIKey(req.body.apikey);
    req.body.lernt_id = temp.id ? temp.id : null
  }
  next()
}

/*
GenAPIKey()
This function encrpts the string generated by concatenating the string representation
of the "time of request" and the 'id' parameter.
it returns an api_key
*/
function GenAPIKey(id){
  let date_created = (new Date()).toJSON();
  let dated_key = date_created + "%" + id; // concatenates the time and the id (date_created API key)

  let cipher = crypto.createCipheriv(algorithm, key, iv); // creates a Cipher object
  let apikey = cipher.update(dated_key, 'utf8', 'hex'); // encrypts the dated API Key
  apikey += cipher.final('hex');
  return apikey; // returns the encrypted data
}


/*
VerifyAPIKey()
This function decrypts the dated-API key and retrieves the user id and date of creation. After date validation,
 user id is returned.
*/
function VerifyAPIKey(apikey){
  let verify = {};

  //checks for the expected key length
  if (apikey.length != (16 * 8)){
    verify.error = 'Invalid API Key';
    return verify; // if the API Key length is wrong, returns with error
  }

  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(apikey, 'hex', 'utf8'); // decrypts the encrypted dated API key
  decrypted += decipher.final('utf8');

  let elements = decrypted.split('%'); // retrives the API Key time of creation and ID value
  let date_created = new Date(elements[0])
  let date_now = new Date();

  // checks to ensure that the API key is modified or expired
  if (date_created == 'Invalid Date' || (date_now - date_created) > 86400000){
    verify.error = 'Invalid API Key';
    return verify;// if the API key is modified or expired, returns with error
  }
  else{
    verify.id = elements[1]; // if all checks out, return user ID
    return verify;
  }
}
