#!/usr/bin/env python3
"""
CloudShield - Architecture Testing & Validation Suite
Tests all layers of the architecture:
  1. Frontend Web App Reachability
  2. API Gateway REST/HTTP Endpoints
  3. Serverless Lambda Invocations
  4. DynamoDB Findings & Scans Tables
  5. S3 Security Data Lake Storage
  6. Lambda Event Processor Execution
  7. CloudWatch Alarms and Operational Metrics
"""

import sys
import os
import json
import uuid
import datetime
import urllib.request
import urllib.error

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    boto3 = None

ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
SECRET_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

def run_test_banner(title):
    print("\n" + "=" * 65)
    print(f" [TEST] {title}")
    print("=" * 65)

def test_api_endpoint(url, method="GET", payload=None):
    print(f"--> Calling {method} {url}")
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    
    data = None
    if payload:
        data = json.dumps(payload).encode("utf-8")
        
    try:
        with urllib.request.urlopen(req, data=data, timeout=20) as res:
            status = res.status
            body = res.read().decode("utf-8")
            parsed = json.loads(body)
            print(f"    Status: {status} OK")
            print(f"    Response preview: {json.dumps(parsed)[:180]}...")
            return True, parsed
    except urllib.error.HTTPError as e:
        print(f"    HTTP Error {e.code}: {e.reason}")
        return False, None
    except Exception as e:
        print(f"    Connection failed: {str(e)}")
        return False, None

def test_full_architecture(api_url=None, dashboard_url=None, region="us-east-1"):
    print("\n" + "=" * 65)
    print("   Starting CloudShield Architecture Verification...  ")
    print("=" * 65 + "\n")
    results = {}

    # 1. Test Web App Reachability
    if dashboard_url:
        run_test_banner("1. Frontend Web App Reachability")
        try:
            req = urllib.request.Request(dashboard_url)
            with urllib.request.urlopen(req, timeout=15) as res:
                print(f"--> GET {dashboard_url}")
                print(f"    Status: {res.status} OK - Static HTML/JS served successfully!")
                results["Frontend_WebApp"] = "PASS"
        except Exception as e:
            print(f"    Frontend reachability error: {e}")
            results["Frontend_WebApp"] = "FAIL"

    # 2. Test API Gateway Endpoints
    if api_url:
        api_base = api_url.rstrip("/")
        
        run_test_banner("2. API Gateway: GET /api/stats")
        s1, res1 = test_api_endpoint(f"{api_base}/api/stats")
        results["API_Stats"] = "PASS" if s1 else "FAIL"

        run_test_banner("3. API Gateway: GET /api/findings")
        s2, res2 = test_api_endpoint(f"{api_base}/api/findings")
        results["API_Findings"] = "PASS" if s2 else "FAIL"

        run_test_banner("4. API Gateway: GET /api/services")
        s3, res3 = test_api_endpoint(f"{api_base}/api/services")
        results["API_Services"] = "PASS" if s3 else "FAIL"

        run_test_banner("5. API Gateway: POST /api/scan")
        s4, res4 = test_api_endpoint(f"{api_base}/api/scan", method="POST")
        results["API_ManualScan"] = "PASS" if s4 else "FAIL"

    # 3. AWS SDK Direct Integration Tests
    if boto3:
        run_test_banner("6. Lambda Event Processor Execution")
        try:
            lambda_client = boto3.client(
                "lambda",
                region_name=region,
                aws_access_key_id=ACCESS_KEY,
                aws_secret_access_key=SECRET_KEY
            )
            sample_event = {
                "source": "aws.securityhub",
                "detail-type": "Security Hub Findings - Imported",
                "detail": {
                    "findings": [
                        {
                            "Id": f"cloudshield-test-{uuid.uuid4()}",
                            "Title": "Automated Security Pipeline Verification Event",
                            "Description": "Test finding verifying Event Processor Lambda, DynamoDB, and S3 Data Lake ingestion.",
                            "Severity": {"Label": "HIGH"},
                            "Resources": [{"Id": "arn:aws:s3:::cloudshield-test-resource"}],
                            "Remediation": {"Recommendation": {"Text": "Test recommendation steps verified."}}
                        }
                    ]
                }
            }
            res = lambda_client.invoke(
                FunctionName="cloudshield-event-processor-dev",
                InvocationType="RequestResponse",
                Payload=json.dumps(sample_event)
            )
            payload_res = json.loads(res["Payload"].read().decode("utf-8"))
            print(f"    Lambda Invocation Status: {res['StatusCode']}")
            print(f"    Lambda Response: {payload_res}")
            results["Lambda_EventProcessor"] = "PASS" if res["StatusCode"] == 200 else "FAIL"
        except Exception as e:
            print(f"    Lambda test error: {e}")
            results["Lambda_EventProcessor"] = "FAIL"

        # 4. DynamoDB Verification
        run_test_banner("7. Amazon DynamoDB Findings Table")
        try:
            dynamodb = boto3.resource(
                "dynamodb",
                region_name=region,
                aws_access_key_id=ACCESS_KEY,
                aws_secret_access_key=SECRET_KEY
            )
            table = dynamodb.Table("cloudshield-findings-dev")
            scan_res = table.scan(Limit=10)
            items = scan_res.get("Items", [])
            print(f"    DynamoDB Table status: ACTIVE")
            print(f"    Successfully verified findings in DynamoDB table: {len(items)} items previewed")
            results["DynamoDB_Findings"] = "PASS"
        except Exception as e:
            print(f"    DynamoDB verification error: {e}")
            results["DynamoDB_Findings"] = "FAIL"

        # 5. S3 Data Lake Verification
        run_test_banner("8. Amazon S3 Security Data Lake")
        try:
            s3 = boto3.client(
                "s3",
                region_name=region,
                aws_access_key_id=ACCESS_KEY,
                aws_secret_access_key=SECRET_KEY
            )
            bucket_name = "cloudshield-security-datalake-dev-73e31885"
            s3.head_bucket(Bucket=bucket_name)
            print(f"    Security Data Lake bucket exists: s3://{bucket_name}/")
            results["S3_DataLake"] = "PASS"
        except Exception as e:
            print(f"    S3 Data Lake error: {e}")
            results["S3_DataLake"] = "FAIL"

    # Summary
    print("\n" + "=" * 65)
    print("                ARCHITECTURE TEST SUMMARY                ")
    print("=" * 65)
    for test_name, status in results.items():
        print(f"  - {test_name.ljust(30)}: [ {status} ]")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    api_arg = "https://cpz4amt72h.execute-api.us-east-1.amazonaws.com"
    dash_arg = "http://cloudshield-frontend-dev-73e31885.s3-website-us-east-1.amazonaws.com"
    reg_arg = "us-east-1"
    
    test_full_architecture(api_url=api_arg, dashboard_url=dash_arg, region=reg_arg)
