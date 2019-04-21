const crypto = require('crypto');
const jwtDecode = require('jwt-decode')
const AWS = require('aws-sdk')

const algorithm = 'aes-128-cbc';
const password = 'lernt.io secret key';
const key = crypto.scryptSync(password, 'salt', 16);
const iv = Buffer.alloc(16, 0);

AWS.config.region = 'us-east-1'
AWS.config.credentials = new AWS.Credentials('AKIAZIUGCNIWX4TG5C7P', 'J/wSMBV+CGGZGAl+NOh+3izkC4VAsNHizlV0aCL3')

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

var oauth = module.exports = {}
oauth.user_pool_id = 'us-east-1_Aw4rQyygr'
oauth.client_id = '6u5bpn6m4p59l3st62creu01h4'


oauth.signUp = function (name, email, password){
  var user = {}
  user.username = email

  var params = {
  UserPoolId: this.user_pool_id,
  Username: email,
  ForceAliasCreation: false,
  MessageAction: "SUPPRESS",
  TemporaryPassword: '11111111',
  UserAttributes: [
    { Name: 'email_verified', Value: 'true' },
    { Name: 'name', Value: name },
    { Name: 'email', Value: email }
  ]
}
  return cognitoidentityserviceprovider.adminCreateUser(params).promise()
    .then((user)=>{
      var params = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: this.client_id,
      UserPoolId: this.user_pool_id,
      AuthParameters: {'USERNAME': email,'PASSWORD': '11111111'}
    }
      return cognitoidentityserviceprovider.adminInitiateAuth(params).promise()
    })
    .then((challenge)=>{
      var params = {
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        ClientId: this.client_id,
        UserPoolId: this.user_pool_id,
        ChallengeResponses: {
          'USERNAME': challenge.ChallengeParameters.USER_ID_FOR_SRP,
          'NEW_PASSWORD': password
        },
        Session: challenge.Session
      }
      return cognitoidentityserviceprovider.adminRespondToAuthChallenge(params).promise()
    })
    .then((token_data)=>{
      let user_data = jwtDecode(token_data.AuthenticationResult.IdToken)
      user.id = this.GenAPIKey(user_data.sub)
      user.status = 'new user'
      user.access_token = token_data.AuthenticationResult.AccessToken
      return user
    })
}


oauth.signIn = function (username, password){
  var user = {}
  user.username = username

  var params = {
  AuthFlow: 'ADMIN_NO_SRP_AUTH',
  ClientId: this.client_id,
  UserPoolId: this.user_pool_id,
  AuthParameters: {
    'USERNAME': username,
    'PASSWORD': password
  }}

  return cognitoidentityserviceprovider.adminInitiateAuth(params).promise()
    .then((token_data)=>{
      let user_data = jwtDecode(token_data.AuthenticationResult.IdToken)
      user.id = this.GenAPIKey(user_data.sub)
      user.status = 'returning user'
      user.access_token = token_data.AuthenticationResult.AccessToken
      return user
    })
}


oauth.deleteUser = function (username, password){
  var user = {}
  return oauth.signIn(username, password)
    .then((user_data)=>{
      user = user_data
      var params = {
        UserPoolId: this.user_pool_id,
        Username: user_data.username
      }
      return cognitoidentityserviceprovider.adminDeleteUser(params).promise()
    })
    .then((empty)=>{
      user.status = 'deleted'
      return user
    })
}


oauth.changePassword = function (username, prev_password, new_password){

  return oauth.signIn(username, prev_password)
    .then((user)=>{
      var params = {
        AccessToken: user.access_token,
        PreviousPassword: prev_password,
        ProposedPassword: new_password
      }
      return cognitoidentityserviceprovider.changePassword(params).promise()
    })
}


oauth.forgotPassword = function (username){
  var params = {
    ClientId: this.client_id,
    Username: username
  }
  return cognitoidentityserviceprovider.forgotPassword(params).promise()
}

oauth.confirmForgotPassword = function (username, new_password, code){
  var params = {
    ClientId: this.client_id,
    ConfirmationCode: code,
    Password: new_password,
    Username: username
  }
  return cognitoidentityserviceprovider.confirmForgotPassword(params).promise()
}


oauth.GenAPIKey = function (id){
  let date_created = (new Date()).toJSON()
  let dated_id = date_created + "%" + id

  const cipher = crypto.createCipheriv(algorithm, key, iv)
  var encrypted = cipher.update(dated_id, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}


oauth.VerifyAPIKey = function(encrypted){
  var verify = {}

  if (encrypted.length != 96 || typeof(encrypted) != 'string'){
    verify.error = 'Invalid Cipher'
    return verify
  }

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  let elements = decrypted.split('%')
  var date_created = new Date(elements[0])
  var date_now = new Date()

  if (date_created == 'Invalid Date' || (date_now - date_created) > 86400000){
    verify.error = 'Key Expired'
    return verify
  }
  else{
    verify.id = elements[1]
    return verify
  }
}
