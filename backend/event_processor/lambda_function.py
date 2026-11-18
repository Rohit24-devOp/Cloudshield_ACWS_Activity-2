import json
import os
import boto3
import uuid
import datetime
from botocore.exceptions import ClientError

AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
DYNAMODB_FINDINGS_TABLE = os.environ.get("DYNAMODB_FINDINGS_TABLE", "cloudshield-findings")
S3_DATA_LAKE_BUCKET = os.environ.get("S3_DATA_LAKE_BUCKET", "")
SNS_ALERTS_TOPIC_ARN = os.environ.get("SNS_ALERTS_TOPIC_ARN", "")

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
s3 = boto3.client("s3", region_name=AWS_REGION)
sns = boto3.client("sns", region_name=AWS_REGION)
cloudwatch = boto3.client("cloudwatch", region_name=AWS_REGION)


def lambda_handler(event, context):
    """
    EventBridge event processor for AWS Config, CloudTrail, GuardDuty, and Security Hub.
    """
    print("Received Security Event from EventBridge:", json.dumps(event))
    
    source = event.get("source", "unknown")
    detail = event.get("detail", {})
    detail_type = event.get("detail-type", "")
    event_time = event.get("time", datetime.datetime.utcnow().isoformat() + "Z")
    
    normalized_finding = None

    try:
        # 1. Security Hub Finding
        if source == "aws.securityhub":
            findings_list = detail.get("findings", [])
            for sh_f in findings_list:
                sev = sh_f.get("Severity", {}).get("Label", "MEDIUM").upper()
                res = sh_f.get("Resources", [{}])[0].get("Id", "Unknown")
                normalized_finding = {
                    "finding_id": sh_f.get("Id", f"sh-{uuid.uuid4()}"),
                    "service": "SecurityHub",
                    "title": sh_f.get("Title", "Security Hub Finding"),
                    "description": sh_f.get("Description", "")[:600],
                    "severity": sev,
                    "resource_id": res,
                    "status": "OPEN",
                    "remediation": sh_f.get("Remediation", {}).get("Recommendation", {}).get("Text", "Review Security Hub console for remediation steps."),
                    "raw_event": sh_f,
                    "created_at": sh_f.get("CreatedAt", event_time),
                    "updated_at": event_time
                }
                process_single_finding(normalized_finding)

        # 2. GuardDuty Finding
        elif source == "aws.guardduty":
            gd_sev_val = float(detail.get("severity", 0))
            if gd_sev_val >= 7.0:
                sev = "HIGH" if gd_sev_val < 9.0 else "CRITICAL"
            elif gd_sev_val >= 4.0:
                sev = "MEDIUM"
            else:
                sev = "LOW"
                
            normalized_finding = {
                "finding_id": detail.get("id", f"gd-{uuid.uuid4()}"),
                "service": "GuardDuty",
                "title": detail.get("title", detail.get("type", "GuardDuty Threat Finding")),
                "description": detail.get("description", "")[:600],
                "severity": sev,
                "resource_id": detail.get("resource", {}).get("resourceType", "AWS Resource"),
                "status": "OPEN",
                "remediation": "Isolate affected resource and rotate compromised credentials immediately.",
                "raw_event": detail,
                "created_at": detail.get("createdAt", event_time),
                "updated_at": event_time
            }
            process_single_finding(normalized_finding)

        # 3. AWS Config Compliance Change
        elif source == "aws.config":
            compliance_type = detail.get("newEvaluationResult", {}).get("complianceType", "NON_COMPLIANT")
            rule_name = detail.get("configRuleName", "AWS Config Rule")
            resource_type = detail.get("resourceType", "AWS Resource")
            resource_id = detail.get("resourceId", "Unknown")
            
            if compliance_type == "NON_COMPLIANT":
                normalized_finding = {
                    "finding_id": f"config-{detail.get('evaluationResultIdentifier', {}).get('evaluationResultQualifier', {}).get('resourceId', uuid.uuid4())}",
                    "service": "Config",
                    "title": f"Config Rule Non-Compliance: {rule_name}",
                    "description": f"Resource {resource_id} of type {resource_type} violated compliance rule {rule_name}.",
                    "severity": "HIGH",
                    "resource_id": f"{resource_type}/{resource_id}",
                    "status": "OPEN",
                    "remediation": f"Remediate resource configuration to comply with rule {rule_name}.",
                    "raw_event": detail,
                    "created_at": event_time,
                    "updated_at": event_time
                }
                process_single_finding(normalized_finding)

        # 4. CloudTrail Security Events (e.g., ConsoleLogin without MFA, SecurityGroup rules opened to 0.0.0.0/0)
        elif source == "aws.cloudtrail":
            event_name = detail.get("eventName", "SecurityEvent")
            user_identity = detail.get("userIdentity", {}).get("arn", "Unknown")
            
            normalized_finding = {
                "finding_id": f"trail-{detail.get('eventID', uuid.uuid4())}",
                "service": "CloudTrail",
                "title": f"Suspicious API Activity: {event_name}",
                "description": f"User/Role {user_identity} invoked {event_name} from IP {detail.get('sourceIPAddress', 'unknown')}.",
                "severity": "HIGH" if "Login" in event_name or "AuthorizeSecurityGroup" in event_name else "MEDIUM",
                "resource_id": user_identity,
                "status": "OPEN",
                "remediation": "Audit user permissions and verify if this action was authorized.",
                "raw_event": detail,
                "created_at": event_time,
                "updated_at": event_time
            }
            process_single_finding(normalized_finding)

        else:
            print(f"Generic event received from {source}. Raw details stored.")
            # Still process if detail contains finding information
            normalized_finding = {
                "finding_id": f"gen-{uuid.uuid4()}",
                "service": source,
                "title": f"Event: {detail_type or source}",
                "description": json.dumps(detail)[:500],
                "severity": "LOW",
                "resource_id": "System",
                "status": "OPEN",
                "remediation": "Review event payload for details.",
                "raw_event": detail,
                "created_at": event_time,
                "updated_at": event_time
            }
            process_single_finding(normalized_finding)

        return {"statusCode": 200, "message": "Event processed successfully"}

    except Exception as e:
        print(f"Error processing security event: {str(e)}")
        return {"statusCode": 500, "error": str(e)}


def process_single_finding(finding):
    """Save to DynamoDB, upload raw to S3 data lake, and trigger SNS / CloudWatch metric."""
    findings_table = dynamodb.Table(DYNAMODB_FINDINGS_TABLE)
    
    # 1. Save to DynamoDB
    db_item = {
        "finding_id": finding["finding_id"],
        "service": finding["service"],
        "title": finding["title"],
        "description": finding["description"],
        "severity": finding["severity"],
        "resource_id": finding["resource_id"],
        "status": finding["status"],
        "remediation": finding["remediation"],
        "created_at": finding["created_at"],
        "updated_at": finding["updated_at"]
    }
    findings_table.put_item(Item=db_item)
    print(f"Saved finding {finding['finding_id']} to DynamoDB.")

    # 2. Archive raw finding into S3 Data Lake for Glue & Athena
    if S3_DATA_LAKE_BUCKET:
        now = datetime.datetime.utcnow()
        partition_path = f"findings/year={now.year}/month={now.month:02d}/day={now.day:02d}/{finding['finding_id']}.json"
        try:
            s3.put_object(
                Bucket=S3_DATA_LAKE_BUCKET,
                Key=partition_path,
                Body=json.dumps(finding),
                ContentType="application/json"
            )
            print(f"Archived finding to s3://{S3_DATA_LAKE_BUCKET}/{partition_path}")
        except Exception as s3_err:
            print(f"Failed to archive to S3: {s3_err}")

    # 3. Publish high/critical alerts to SNS Topic
    if SNS_ALERTS_TOPIC_ARN and finding["severity"] in ["CRITICAL", "HIGH"]:
        try:
            subject = f"[CloudShield ALERT] {finding['severity']} Misconfiguration Detected: {finding['title']}"
            message = (
                f"=== CloudShield Security Alert ===\n\n"
                f"Severity:    {finding['severity']}\n"
                f"Service:     {finding['service']}\n"
                f"Finding ID:  {finding['finding_id']}\n"
                f"Resource:    {finding['resource_id']}\n"
                f"Title:       {finding['title']}\n"
                f"Description: {finding['description']}\n"
                f"Remediation: {finding['remediation']}\n\n"
                f"Timestamp:   {finding['updated_at']}\n"
            )
            sns.publish(
                TopicArn=SNS_ALERTS_TOPIC_ARN,
                Subject=subject[:100],
                Message=message
            )
            print(f"Sent SNS notification for {finding['finding_id']}.")
        except Exception as sns_err:
            print(f"Failed to publish SNS alert: {sns_err}")

    # 4. Emit CloudWatch Metric
    try:
        cloudwatch.put_metric_data(
            Namespace="CloudShield/SecurityMetrics",
            MetricData=[
                {
                    "MetricName": "FindingsDiscovered",
                    "Dimensions": [
                        {"Name": "Service", "Value": finding["service"]},
                        {"Name": "Severity", "Value": finding["severity"]}
                    ],
                    "Value": 1,
                    "Unit": "Count"
                }
            ]
        )
    except Exception as cw_err:
        print(f"Metric emission notice: {cw_err}")

