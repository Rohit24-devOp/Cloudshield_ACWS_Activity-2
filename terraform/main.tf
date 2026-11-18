# ==============================================================================
# CloudShield - AWS Security and Misconfiguration Detection Platform
# Infrastructure as Code (Terraform)
# ==============================================================================
# This configuration provisions:
# 1. Frontend: Amazon S3 (Static Web App) + CloudFront CDN (HTTPS & OAC)
# 2. Backend: Amazon API Gateway + AWS Lambda (API Handler & Event Processor)
# 3. AWS Security & Monitoring Services:
#    - AWS Config (Compliance rules & Recorder)
#    - AWS CloudTrail (Multi-region API auditing)
#    - Amazon GuardDuty (Threat detection detector)
#    - AWS Security Hub (Centralized CIS & Foundational standards)
# 4. Event-Driven Triggers: Amazon EventBridge + Amazon SNS Alerts
# 5. Storage Layer: Amazon DynamoDB (NoSQL findings/scans) + Amazon S3 Data Lake
# 6. Analytics: AWS Glue Data Catalog + Amazon Athena Security Queries
# 7. Operational Monitoring: Amazon CloudWatch Logs, Alarms & Dashboard
# ==============================================================================

