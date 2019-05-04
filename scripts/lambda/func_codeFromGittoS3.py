#function is triggered by code pipeline and moves the incoming code zip to s3 to be picked up by cloud formation as
#and when required.
import json
import boto3
import zipfile

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
    s3_client = boto3.client('s3')

    codepipeline = boto3.client('codepipeline')
    job_id = event["CodePipeline.job"]["id"]


    temp_zip = '/tmp/file.zip' #temp zip file within lambda
    s3_client.download_file(s3_bucket, code_zip, temp_zip)

    cf_bucket_name = "lernt-cloud-formation-scripts"

    try:
        s3.meta.client.copy(code_zip_file, dest_bucket_name, dest_file_name)
        with zipfile.ZipFile(temp_zip) as z:
            z.extract('scripts/cloudformation/cf_spawn_ebs.json', '/tmp')
            z.extract('scripts/cloudformation/cf_spawn_neo4j_instance.json', '/tmp')
            s3_client.upload_file("/tmp/scripts/cloudformation/cf_spawn_ebs.json", cf_bucket_name, "cf_spawn_ebs.json")
            s3_client.upload_file("/tmp/scripts/cloudformation/cf_spawn_neo4j_instance.json", cf_bucket_name, "cf_spawn_neo4j_instance.json")

        codepipeline.put_job_success_result(jobId = job_id)
    except Exception as e:
        print(str(e))
        codepipeline.put_job_failure_result(jobId = job_id, failureDetails = {'message': str(e), 'type': 'JobFailed'})


    message = "File moved to S3 Bucket : " + dest_bucket_name + "/" + dest_file_name



    return {
        'statusCode': 200,
        'body': json.dumps(message)
    }
