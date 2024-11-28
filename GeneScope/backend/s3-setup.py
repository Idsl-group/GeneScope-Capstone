# import boto3

# # Initialize S3 client
# s3 = boto3.client('s3')

# # Optionally, specify credentials explicitly
# # s3 = boto3.client(
# #     's3',
# #     aws_access_key_id='YOUR_ACCESS_KEY',
# #     aws_secret_access_key='YOUR_SECRET_KEY',
# #     region_name='YOUR_REGION'
# # )

# def upload_file_to_s3(file_path, bucket_name, object_key):
#     """
#     Upload a file to an S3 bucket.

#     :param file_path: Path to the local file to be uploaded.
#     :param bucket_name: Name of the S3 bucket.
#     :param object_key: Key (name) for the file in the S3 bucket.
#     """
#     try:
#         s3.upload_file(file_path, bucket_name, object_key)
#         print(f"File '{file_path}' uploaded to '{bucket_name}/{object_key}'")
#     except Exception as e:
#         print(f"Error uploading file: {e}")

# # Example usage
# upload_file_to_s3('local_file.txt', 'your-bucket-name', 'user123/local_file.txt')

# def generate_presigned_url(bucket_name, object_key, expiration=3600):
#     """
#     Generate a pre-signed URL for an S3 object.

#     :param bucket_name: Name of the S3 bucket.
#     :param object_key: Key (name) of the file in the S3 bucket.
#     :param expiration: Expiration time in seconds (default: 1 hour).
#     :return: Pre-signed URL as a string.
#     """
#     try:
#         url = s3.generate_presigned_url(
#             'get_object',  # Change to 'put_object' for uploads
#             Params={'Bucket': bucket_name, 'Key': object_key},
#             ExpiresIn=expiration
#         )
#         return url
#     except Exception as e:
#         print(f"Error generating pre-signed URL: {e}")
#         return None

# # Example usage
# url = generate_presigned_url('your-bucket-name', 'user123/local_file.txt')
# print(f"Pre-Signed URL: {url}")

# def list_files_in_bucket(bucket_name):
#     """
#     List all files in an S3 bucket.

#     :param bucket_name: Name of the S3 bucket.
#     """
#     try:
#         response = s3.list_objects_v2(Bucket=bucket_name)
#         if 'Contents' in response:
#             for obj in response['Contents']:
#                 print(f"File: {obj['Key']} (Size: {obj['Size']} bytes)")
#         else:
#             print("No files found.")
#     except Exception as e:
#         print(f"Error listing files: {e}")

# # Example usage
# list_files_in_bucket('your-bucket-name')

# def download_file_from_s3(bucket_name, object_key, download_path):
#     """
#     Download a file from an S3 bucket.

#     :param bucket_name: Name of the S3 bucket.
#     :param object_key: Key (name) of the file in the S3 bucket.
#     :param download_path: Local path to save the downloaded file.
#     """
#     try:
#         s3.download_file(bucket_name, object_key, download_path)
#         print(f"File '{object_key}' downloaded to '{download_path}'")
#     except Exception as e:
#         print(f"Error downloading file: {e}")

# # Example usage
# download_file_from_s3('your-bucket-name', 'user123/local_file.txt', 'downloaded_file.txt')

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import boto3
from botocore.exceptions import BotoCoreError, ClientError
import os

# Initialize FastAPI app
app = FastAPI()

# Initialize S3 client
s3 = boto3.client('s3')

@app.post("/upload/")
async def upload_file_to_s3(bucket_name: str, object_key: str, file: UploadFile = File(...)):
    """
    Upload a file to an S3 bucket.

    :param bucket_name: Name of the S3 bucket.
    :param object_key: Key (name) for the file in the S3 bucket.
    :param file: File object from FastAPI.
    """
    try:
        # Save the uploaded file temporarily
        temp_file_path = f"/tmp/{file.filename}"
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Upload the file to S3
        s3.upload_file(temp_file_path, bucket_name, object_key)
        os.remove(temp_file_path)  # Clean up the temporary file
        return {"message": f"File '{file.filename}' uploaded to '{bucket_name}/{object_key}'"}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate-presigned-url/")
def generate_presigned_url(bucket_name: str, object_key: str, expiration: int = 3600):
    """
    Generate a pre-signed URL for an S3 object.

    :param bucket_name: Name of the S3 bucket.
    :param object_key: Key (name) of the file in the S3 bucket.
    :param expiration: Expiration time in seconds (default: 1 hour).
    :return: Pre-signed URL as a JSON response.
    """
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': object_key},
            ExpiresIn=expiration
        )
        return {"presigned_url": url}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/list-files/")
def list_files_in_bucket(bucket_name: str):
    """
    List all files in an S3 bucket.

    :param bucket_name: Name of the S3 bucket.
    :return: List of files in the bucket.
    """
    try:
        response = s3.list_objects_v2(Bucket=bucket_name)
        if 'Contents' in response:
            files = [{"key": obj['Key'], "size": obj['Size']} for obj in response['Contents']]
            return {"files": files}
        else:
            return {"files": []}
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/")
def download_file_from_s3(bucket_name: str, object_key: str):
    """
    Download a file from an S3 bucket.

    :param bucket_name: Name of the S3 bucket.
    :param object_key: Key (name) of the file in the S3 bucket.
    :return: FileResponse to download the file.
    """
    try:
        download_path = f"/tmp/{object_key.split('/')[-1]}"
        s3.download_file(bucket_name, object_key, download_path)
        return FileResponse(download_path, media_type='application/octet-stream', filename=object_key)
    except (BotoCoreError, ClientError) as e:
        raise HTTPException(status_code=500, detail=str(e))
