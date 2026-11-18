import boto3
import os

AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
SECRET_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

print("=" * 65)
print("      AWS ACCOUNT RESOURCE AUDIT: CLOUDSHIELD TEARDOWN SCAN    ")
print("=" * 65)

session = boto3.Session(
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name=AWS_REGION
)

# 1. S3 Buckets
s3 = session.client("s3")
buckets = s3.list_buckets().get("Buckets", [])
cs_buckets = [b["Name"] for b in buckets if "cloudshield" in b["Name"]]
print(f"[S3] CloudShield Buckets: {len(cs_buckets)} found {cs_buckets}")

# 2. Lambda Functions
lam = session.client("lambda")
lambdas = lam.list_functions().get("Functions", [])
cs_lambdas = [f["FunctionName"] for f in lambdas if "cloudshield" in f["FunctionName"]]
print(f"[Lambda] CloudShield Functions: {len(cs_lambdas)} found {cs_lambdas}")

# 3. API Gateway
apigw = session.client("apigatewayv2")
apis = apigw.get_apis().get("Items", [])
cs_apis = [a["Name"] for a in apis if "cloudshield" in a.get("Name", "")]
print(f"[API Gateway] CloudShield APIs: {len(cs_apis)} found {cs_apis}")

# 4. DynamoDB Tables
ddb = session.client("dynamodb")
tables = ddb.list_tables().get("TableNames", [])
cs_tables = [t for t in tables if "cloudshield" in t]
print(f"[DynamoDB] CloudShield Tables: {len(cs_tables)} found {cs_tables}")

# 5. GuardDuty Detectors
gd = session.client("guardduty")
detectors = gd.list_detectors().get("DetectorIds", [])
print(f"[GuardDuty] Detectors: {len(detectors)} active {detectors}")

# 6. AWS Config
cfg = session.client("config")
recorders = cfg.describe_configuration_recorders().get("ConfigurationRecorders", [])
cs_recorders = [r["name"] for r in recorders if "cloudshield" in r["name"]]
rules = cfg.describe_config_rules().get("ConfigRules", [])
cs_rules = [r["ConfigRuleName"] for r in rules if any(x in r["ConfigRuleName"] for x in ["s3-bucket", "restricted-ssh", "root-account", "encrypted-volumes"])]
print(f"[AWS Config] CloudShield Recorders: {len(cs_recorders)} found {cs_recorders}")
print(f"[AWS Config] Deployed Config Rules: {len(cs_rules)} found {cs_rules}")

# 7. CloudTrail
trail = session.client("cloudtrail")
trails = trail.describe_trails().get("trailList", [])
cs_trails = [t["Name"] for t in trails if "cloudshield" in t["Name"]]
print(f"[CloudTrail] CloudShield Trails: {len(cs_trails)} found {cs_trails}")

# 8. EventBridge Rules
events = session.client("events")
erules = events.list_rules().get("Rules", [])
cs_erules = [r["Name"] for r in erules if "cloudshield" in r["Name"]]
print(f"[EventBridge] CloudShield Rules: {len(cs_erules)} found {cs_erules}")

# 9. SNS Topics
sns = session.client("sns")
topics = sns.list_topics().get("Topics", [])
cs_topics = [t["TopicArn"] for t in topics if "cloudshield" in t["TopicArn"]]
print(f"[SNS] CloudShield Alert Topics: {len(cs_topics)} found {cs_topics}")

# 10. CloudWatch Alarms
cw = session.client("cloudwatch")
alarms = cw.describe_alarms().get("MetricAlarms", [])
cs_alarms = [a["AlarmName"] for a in alarms if "cloudshield" in a["AlarmName"]]
print(f"[CloudWatch] CloudShield Alarms: {len(cs_alarms)} found {cs_alarms}")

total_active = (
    len(cs_buckets) + len(cs_lambdas) + len(cs_apis) + len(cs_tables) + 
    len(detectors) + len(cs_recorders) + len(cs_rules) + len(cs_trails) + 
    len(cs_erules) + len(cs_topics) + len(cs_alarms)
)

print("\n" + "=" * 65)
if total_active == 0:
    print(" >>> RESULT: ALL CLOUDSHIELD RESOURCES ARE 100% DESTROYED <<< ")
    print(" >>> TOTAL RUNNING CLOUDSHIELD RESOURCES: 0                  <<< ")
else:
    print(f" >>> WARNING: {total_active} RESOURCES STILL DETECTED <<< ")
print("=" * 65)

