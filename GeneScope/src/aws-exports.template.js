/* eslint-disable */
// WARNING: This is a template. Replace placeholders with actual values.

const awsmobile = {
    "aws_project_region": "YOUR_REGION",
    "aws_cognito_identity_pool_id": "YOUR_IDENTITY_POOL_ID",
    "aws_cognito_region": "YOUR_COGNITO_REGION",
    "aws_user_pools_id": "YOUR_USER_POOL_ID",
    "aws_user_pools_web_client_id": "YOUR_WEB_CLIENT_ID",
    "oauth": {},
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_user_files_s3_bucket": "genescopefilesec991-dev",
    "aws_user_files_s3_bucket_region": "us-east-1"
};

export default awsmobile;
