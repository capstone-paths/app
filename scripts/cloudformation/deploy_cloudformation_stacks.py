"""
Program allows deploying of lernt cloudformation stack
"""

import boto3
import time
import os

# function to get required input parameters from user for neo4j ec2 instance
def neo4j_ec2_param_object():
    param_list = []

    print("Please make sure you have")
    print("1. name of existing EC2 Keypair you have access to handy before proceeding")
    print("2. Your IP address to open up SSH access to that particular IP [example : 87.246.142.83/32]")
    input("Press any key to continue.")
    ec2_key = input("Input name of an existing EC2 KeyPair (Region : US-EAST-1 only) to enable SSH access to the AWS Elastic Beanstalk instance : ")
    param_dict1 = dict()
    param_dict1['ParameterKey'] = 'KeyName'
    param_dict1['ParameterValue'] = ec2_key

    param_list.append(param_dict1)

    param_dict2 = dict()
    ip = input("Input your IP address to allow for SSH access [example : 87.246.142.83/32] : ")
    param_dict2['ParameterKey'] = 'SSHLocation'
    param_dict2['ParameterValue'] = ip
    param_list.append(param_dict2)

    return param_list


# function to get required input parameters from user for EBS Node Server
def node_ec2_param_object():
    param_list = []

    print("Please make sure you have")
    print("1. name of existing EC2 Keypair you have access to handy before proceeding")
    input("Press any key to continue.")
    ec2_key = input("Input name of an existing EC2 KeyPair(Region : US-EAST-1 only) to enable SSH access to the AWS Elastic Beanstalk instance : ")
    param_dict1 = dict()
    param_dict1['ParameterKey'] = 'KeyName'
    param_dict1['ParameterValue'] = ec2_key

    param_list.append(param_dict1)

    return param_list

# function to create neo4j EC2 instance from cloud formation script
def create_stack(client_cf, stack_name, cf_template_url, stack_params):
        print("Creating the Stack.....")
        response_create_stack = client_cf.create_stack(
        StackName=stack_name,
        TemplateURL=cf_template_url,
        Parameters=stack_params,
        OnFailure='DELETE',
        Capabilities=['CAPABILITY_NAMED_IAM']
        )

        return response_create_stack

# function updates ec2 system parameter to keep track of user data script execution
def reset_param_store_variable(ssm_client):
    print("Updating parameter store variable CF_PS_EC2_USERDATA_STATUS to RUNNING to keep track of execution")

    # delete parameter if exists
    try:
        ssm_client.delete_parameter(Name='CF_PS_EC2_USERDATA_STATUS')
    except:
        print('No parameter to delete')

    # set parameter to running
    ssm_client.put_parameter(
    Name='CF_PS_EC2_USERDATA_STATUS',
    Description='User data exection status',
    Value='RUNNING',
    Type='String',
    Overwrite=True
    )



# function updates ec2 parameter store to save the required cognito user p
def set_cognito_param_store_variable(ssm_client):
    print("Setting up Cognito User Access & Secret Keys")

    # delete parameter if exists
    print('Deleting existing parameters in AWS EC2 Parameter Store(ff any)')
    par_list = ['COG_ACCESS_KEY_ID','COG_SECRET_ACCESS_KEY','COG_ALGORITHM','COG_CLIENT_ID','COG_IV_FILL','COG_KEY_LENGTH','COG_IV_SIZE','COG_KEY_SALT','COG_MAX_VALID_TIME','COG_REGION','COG_KEY_PASSWORD','COG_TEMP_PASSWORD','COG_USER_POOL_ID']

    for param in par_list:
        try:
            print("delete system parameter : ", param)
            ssm_client.delete_parameter(Name=param)
        except:
            print('No parameter : {0} to delete'.format(param))

    for i, param in enumerate(par_list):
        if (i<2):
            param_value = input("Enter Cognito User Parameter for {0} : ".format(param))

            # setting parameter
            ssm_client.put_parameter(
            Name=param,
            Description='Cognito User Parameter : ' + param,
            Value=param_value,
            Type='String',
            Overwrite=True
            )
        else:
            # setting parameter
            ssm_client.put_parameter(
            Name=param,
            Description='Cognito User Parameter : ' + param,
            Value='Not_Set',
            Type='String',
            Overwrite=True
            )


    return



def check_status_ec2_user_script(ssm_client):

    print("User Data Script Execution",end="")
    while True:
        status = ssm_client.get_parameter(Name='CF_PS_EC2_USERDATA_STATUS')
        if status['Parameter']['Value']=="RUNNING":
            print("....",end="")
            time.sleep(30)   #sleep for 30s
        else:
            print("\n User Data Script Execution completed and Neo4j instance available")
            break


# main Function
def main():

    # get AWS access credentials
    ACCESS_KEY = input("Enter AWS Admin User ACCESS_KEY : ")
    SECRET_KEY = input("Enter AWS Admin User SECRET_KEY : ")

    # initiating access
    session = boto3.Session(
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY, region_name='us-east-1')

    # get required parameters from user
    stack_params = neo4j_ec2_param_object()

    # parameter store client
    ssm_client = boto3.client('ssm', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET_KEY, region_name='us-east-1')

    # save credentials to cognito user to allow accessing the user Pool
    set_cognito_param_store_variable(ssm_client)

    # setting cognito user variable
    reset_param_store_variable(ssm_client)

    #get neo4j CF template of github
    print("Using https://s3.amazonaws.com/lernt-cloud-formation-scripts/cf_spawn_neo4j_instance.json as the cloudformation template for setting up Neo4j instance")
    neo4j_cf_template_url = 'https://s3.amazonaws.com/lernt-cloud-formation-scripts/cf_spawn_neo4j_instance.json'

    # cloud formation
    client_cf = session.resource('cloudformation')

    #get neo4j stack name
    neo4j_stack_name = input("Enter name of Neo4j CloudFormation Stack [Example : CFNeo4jFulltest] : ")

    # create neo4j stack using cloud formation
    response_create_stack_neo4j = create_stack(client_cf, neo4j_stack_name, neo4j_cf_template_url, stack_params)

    #check status of script
    check_status_ec2_user_script(ssm_client)

    # printing response
    print(response_create_stack_neo4j)


    # get required parameters from user
    stack_params = node_ec2_param_object()




    #get EBS template from S3
    print("Using https://s3.amazonaws.com/lernt-cloud-formation-scripts/cf_spawn_ebs.json as the cloudformation template for setting up Node instance")
    ebs_cf_template_url = 'https://s3.amazonaws.com/lernt-cloud-formation-scripts/cf_spawn_ebs.json'

    #get neo4j stack name
    ebs_stack_name = input("Enter name of Node EBS CloudFormation Stack [Example : EBSNodeFulltest] : ")


    # create neo4j stack using cloud formation
    response_create_stack_ebs = create_stack(client_cf, ebs_stack_name, ebs_cf_template_url, stack_params)


    # printing response
    print(response_create_stack_ebs)




if __name__ == "__main__":
    main()
