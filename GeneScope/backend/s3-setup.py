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

#Base Framework
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import boto3

# FastAPI app instance
app = FastAPI()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Secret key for JWT (use a secure key in production)
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dummy user database
fake_users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "hashed_password": pwd_context.hash("password123"),
    }
}

# AWS S3 client
s3 = boto3.client('s3')

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db, username: str):
    return db.get(username)

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if user and verify_password(password, user["hashed_password"]):
        return user
    return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return get_user(fake_users_db, username)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/upload/")
async def upload_file_to_s3(
    bucket_name: str, object_key: str, file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a file to S3 bucket securely.
    """
    try:
        # Read file contents and upload to S3
        s3.upload_fileobj(file.file, bucket_name, object_key)
        return {"message": f"File '{file.filename}' uploaded successfully to '{bucket_name}/{object_key}'."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/")
async def generate_presigned_url(
    bucket_name: str, object_key: str, current_user: dict = Depends(get_current_user)
):
    """
    Generate a pre-signed URL for downloading an S3 object.
    """
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': object_key},
            ExpiresIn=3600
        )
        return {"presigned_url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/list-files/")
async def list_files_in_bucket(bucket_name: str, current_user: dict = Depends(get_current_user)):
    """
    List all files in an S3 bucket.
    """
    try:
        response = s3.list_objects_v2(Bucket=bucket_name)
        files = [
            {"Key": obj["Key"], "Size": obj["Size"]} for obj in response.get('Contents', [])
        ]
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download-file/")
async def download_file_from_s3(
    bucket_name: str, object_key: str, download_path: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download a file from S3 bucket to a local path.
    """
    try:
        s3.download_file(bucket_name, object_key, download_path)
        return {"message": f"File '{object_key}' downloaded to '{download_path}'."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))