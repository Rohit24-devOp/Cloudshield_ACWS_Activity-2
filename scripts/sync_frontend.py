import os
import mimetypes
import boto3

AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
BUCKET_NAME = "cloudshield-frontend-dev-73e31885"
API_URL = "https://cpz4amt72h.execute-api.us-east-1.amazonaws.com"
ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
SECRET_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY
)

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

# Inject live API URL into index.html
index_path = os.path.join(frontend_dist, "index.html")
if os.path.exists(index_path):
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
    updated = content.replace(
        'window.__CLOUDSHIELD_API_URL__ || ""',
        f'"{API_URL}"'
    ).replace(
        'const API_URL = (window.__CLOUDSHIELD_API_URL__) || "";',
        f'const API_URL = "{API_URL}";'
    )
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(updated)
    print("Injected live API Gateway URL into index.html")

# Upload all files to S3
print(f"Uploading files from {frontend_dist} to s3://{BUCKET_NAME}/...")
for root, _, files in os.walk(frontend_dist):
    for file in files:
        file_path = os.path.join(root, file)
        rel_path = os.path.relpath(file_path, frontend_dist).replace("\\", "/")
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = "application/octet-stream"
        
        extra_args = {"ContentType": content_type}
        s3.upload_file(file_path, BUCKET_NAME, rel_path, ExtraArgs=extra_args)
        print(f"  Uploaded: {rel_path} ({content_type})")

print(f"\nUpload complete! Dashboard is live at: http://{BUCKET_NAME}.s3-website-{AWS_REGION}.amazonaws.com")

