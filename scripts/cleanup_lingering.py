import boto3
import os

AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
SECRET_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

session = boto3.Session(
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name=AWS_REGION
)

# 1. Disable Security Hub
sh = session.client("securityhub")
try:
    sh.disable_security_hub()
    print("Security Hub disabled successfully.")
except Exception as e:
    print(f"Security Hub status: {e}")

# 2. Delete any lingering Config Rules
cfg = session.client("config")
rules = cfg.describe_config_rules().get("ConfigRules", [])
for r in rules:
    rule_name = r["ConfigRuleName"]
    try:
        cfg.delete_config_rule(ConfigRuleName=rule_name)
        print(f"Deleted lingering Config rule: {rule_name}")
    except Exception as e:
        print(f"Could not delete {rule_name}: {e}")

print("Cleanup completed.")

