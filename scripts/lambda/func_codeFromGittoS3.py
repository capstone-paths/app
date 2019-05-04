#function is triggered by code pipeline and moves the incoming code zip to s3 to be picked up by cloud formation as
#and when required.
import json
import boto3

def lambda_handler(event, context):
    print(event["CodePipeline.job"]["data"]["inputArtifacts"][0]["location"]["s3Location"])

    s3_bucket = event["CodePipeline.job"]["data"]["inputArtifacts"][0]["location"]["s3Location"]["bucketName"]
    code_zip = event["CodePipeline.job"]["data"]["inputArtifacts"][0]["location"]["s3Location"]["objectKey"]



    print(s3_bucket, code_zip)

    dest_bucket_name = "cf-ebs-lernt.io-code"
    dest_file_name = "lernt.io.zip"

    code_zip_file = {
    'Bucket': s3_bucket,
    'Key': code_zip

    }

    s3 = boto3.resource('s3')

    codepipeline = boto3.client('codepipeline')
    job_id = event["CodePipeline.job"]["id"]

    if (s3.meta.client.copy(code_zip_file, dest_bucket_name, dest_file_name) ):
        codepipeline.put_job_success_result(jobId = job_id)
    else:
        codepipeline.put_job_failure_result(jobId = job_id, failureDetails = {'message': "zip move to s3 failed", 'type': 'JobFailed'})


    message = "File moved to S3 Bucket : " + dest_bucket_name + "/" + dest_file_name

    return {
        'statusCode': 200,
        'body': json.dumps(message)
    }
