# CloudShield — AWS Security & Misconfiguration Detection Platform

A cloud-native, serverless Cloud Security Posture Management (CSPM) platform on AWS that continuously monitors cloud infrastructure, detects vulnerabilities and misconfigurations in real time, automates threat alerting, and provides actionable remediation runbooks.

---

## 🏛️ System Architecture

```
+----------------------------------------------------------------------------------------------------+
| 1. Presentation Layer (Frontend & CDN)                                                             |
|    Security Engineers / DevOps ---> Amazon CloudFront (CDN + OAC) ---> Amazon S3 (React SPA)       |
+----------------------------------------------------------------------------------------------------+
                                      | (HTTPS API Requests)
                                      v
+----------------------------------------------------------------------------------------------------+
| 2. API & Serverless Compute Layer                                                                  |
|    Amazon API Gateway (HTTP API v2) ---> AWS Lambda (API Handler)                                  |
|                                         |                                                          |
|                                         v                                                          |
|    Amazon EventBridge (Rules) --------> AWS Lambda (Event Processor)                               |
+----------------------------------------------------------------------------------------------------+
       ^                                       |                                    |
       | (Findings & Events)                   v                                    v
+-------------------------------+  +-------------------------------------+  +------------------------+
| 3. AWS Security & Sensors     |  | 5. Dual-Tier Storage Layer          |  | 6. Alert Notification  |
|    - AWS Config               |  |    - Amazon DynamoDB (Hot Metadata) |  |    - Amazon SNS        |
|    - Amazon GuardDuty         |  |    - Amazon S3 (Security Data Lake) |  |      (Email / SMS)     |
|    - AWS Security Hub         |  |    - Amazon Athena (SQL Queries)    |  +------------------------+
|    - AWS CloudTrail           |  +-------------------------------------+
+-------------------------------+                     |
                                                      v
                                   +-------------------------------------+
                                   | 7. Big Data Analytics & BI          |
                                   |    - AWS Glue (Data Catalog & ETL)  |
                                   |    - Amazon QuickSight (Dashboards) |
                                   +-------------------------------------+
```

---

## 🧩 Architectural Components Explained

### 1. Presentation Layer (Frontend & CDN)
* **React Single Page Application (SPA)**: Modern cybersecurity operations dashboard built with React and Vite. It provides compliance score gauges, attack surface distribution, sensor health monitors, and a remediation triage inspector.
* **Amazon S3 (Frontend Bucket)**: Hosts static production assets (`index.html`, JavaScript, CSS). The bucket blocks all direct public internet access.
* **Amazon CloudFront**: Global Content Delivery Network (CDN) delivering the dashboard over HTTPS with low latency and edge DDoS mitigation.
* **Origin Access Control (OAC)**: Enforces that only CloudFront edge distributions can fetch assets from the private S3 bucket.

### 2. API & Serverless Compute Layer
* **Amazon API Gateway (HTTP API v2)**: Low-latency REST gateway with configured CORS handling routes such as `/api/stats`, `/api/findings`, and `/api/scan`.
* **AWS Lambda (API Handler)**: Python 3.12 function that queries security services via the AWS SDK (Boto3), computes compliance aggregations, and returns structured JSON responses to the frontend.
* **AWS Lambda (Event Processor)**: Triggered asynchronously by EventBridge when new security events arrive. It parses finding payloads, assigns severity classifications, extracts affected resource ARNs, and stores records in DynamoDB and S3.

### 3. AWS Security & Threat Detection Sensors
* **AWS Config**: Continuously records resource configuration changes and audits compliance against predefined rules (e.g., S3 public read blocks, restricted SSH port 22, root account MFA, EBS volume encryption).
* **Amazon GuardDuty**: Intelligent threat detection engine utilizing machine learning and threat intelligence feeds to identify suspicious activities like credential exfiltration, anomalous API calls, and unauthorized recon.
* **AWS Security Hub**: Central security posture management aggregator that standardizes findings into the AWS Security Finding Format (ASFF) and benchmarks posture against CIS AWS Foundations.
* **AWS CloudTrail**: Captures immutable multi-region audit logs of every API invocation made within the AWS account.

### 4. Event-Driven Routing & Alerting
* **Amazon EventBridge**: Central event bus capturing incoming security events emitted by AWS Config, GuardDuty, and Security Hub. It decouples detection from processing without requiring continuous polling.
* **Amazon SNS (Simple Notification Service)**: Multi-channel alerting topic connected to EventBridge rules. Automatically pushes real-time email and SMS alerts to security engineers when Critical or High severity findings occur.

### 5. Dual-Tier Storage Layer
* **Amazon DynamoDB (Hot Storage)**: Low-latency NoSQL database storing active findings, severity counts, and scan timestamps for fast sub-millisecond retrieval by the web dashboard.
* **Amazon S3 Security Data Lake (Cold/Warm Storage)**: Long-term audit lake storing raw JSON finding payloads, partitioned hierarchically by date (`/year=YYYY/month=MM/day=DD/`) for cost-effective historical retention.
* **Amazon Athena**: Serverless interactive query engine allowing security analysts to run SQL queries directly on partitioned S3 log files without spinning up database servers.

### 6. Analytics & Operational Monitoring
* **AWS Glue**: Maintains the metadata schema and Data Catalog over S3 security data, enabling automated ETL pipelines.
* **Amazon QuickSight**: Connects to Athena and Glue to visualize long-term compliance trends and threat patterns.
* **Amazon CloudWatch**: Gathers Lambda execution metrics, error rates, log streams, and triggers alarms if error thresholds are exceeded.

---

## 🔄 End-to-End Workflow Procedure

The platform operates across six clear execution stages:

```
[1. User Action]  ──> [CloudFront CDN] ──> [API Gateway] ──> [Lambda API Handler] ──> [DynamoDB Stats]
                                                                                            │
[2. Detection]    ──> [Config / GuardDuty / Security Hub]                                   │
                               │                                                            │
[3. Event Bus]    ──> [Amazon EventBridge]                                                  │
                               ├────────────────────────────────┐                           │
[4. Processing]   ──> [Lambda Event Processor]           [Amazon SNS Alerts]                │
                               │                                                            │
[5. Storage]      ──> [DynamoDB (Metadata)] + [S3 Data Lake (Raw Evidence)]                 │
                               │                                                            │
[6. Analytics]    ──> [AWS Glue Data Catalog] ──> [Amazon Athena SQL] ──> [QuickSight BI] ──┘
```

1. **User Request & Edge Ingestion**:
   The user opens the dashboard URL. CloudFront fetches assets securely from S3 via OAC. The frontend initiates HTTPS calls through API Gateway to fetch security scores and findings.
2. **Continuous Anomaly & Compliance Auditing**:
   AWS Config monitors resource states, GuardDuty inspects network/IAM activities, and CloudTrail logs API calls. If an unencrypted resource or anomalous activity occurs, a security finding is generated.
3. **Event-Driven EventBridge Triggering**:
   Detection services emit event payloads into Amazon EventBridge. EventBridge matches rule filters (e.g., severity = CRITICAL or HIGH).
4. **Serverless Normalization & Risk Scoring**:
   EventBridge invokes the Event Processor Lambda function. The function parses the finding details, extracts resource identifiers, calculates severity weights, and creates standardized records.
5. **Instant Alert Notification**:
   In parallel, EventBridge publishes high-priority incident notifications to Amazon SNS, dispatching alerts immediately to subscribed engineers.
6. **Persistence & Data Lake Ingestion**:
   - Normalized metadata is written to Amazon DynamoDB for real-time UI queries.
   - The full raw JSON evidence payload is archived in the S3 Security Data Lake under structured date partitions.
7. **Ad-Hoc Querying & Executive Analytics**:
   Security teams query historical findings using Amazon Athena SQL syntax. AWS Glue maintains data cataloging, feeding intelligence into QuickSight dashboards.

---

## 🖥️ Dashboard Features & Operational Guide

The dashboard is accessible locally at `http://localhost:3000/` and provides five core functional views:

### 1. Executive Security Overview
* **CIS Security Posture Score**: Circular visual metric (e.g., 82.5%) measuring compliance across foundational rules (IAM MFA, S3 public block, security group rules).
* **Attack Surface Severity Distribution**: Real-time counter and progress bar categorizing findings by severity (`Critical`, `High`, `Medium`, `Low`, and `Total`).
* **Sensors & Data Lake Status**: Live operational status indicators for GuardDuty threat streams, DynamoDB synchronization, S3 audit lake connectivity, and SNS alerts.
* **On-Demand Scan Trigger**: An executive button allowing engineers to invoke an immediate infrastructure security audit.

### 2. Connected AWS Telemetry Hub
Displays unified real-time connectivity cards for native AWS security sensors:
* **AWS Config**: Shows recorder status and active compliance rules.
* **Amazon GuardDuty**: Displays detector ID and active anomaly detection status.
* **AWS Security Hub**: Shows standard compliance benchmarks (CIS AWS Foundations).
* **AWS CloudTrail**: Shows multi-region immutable audit logging status.

### 3. Security Findings Explorer & Triage Hub
* **Service-Based Filtering**: Filter findings specifically by `SecurityHub`, `GuardDuty`, `Config`, or `All Services`.
* **Finding Details**:
  * Title, severity badge, affected resource ARN, source service, and discovery timestamp.
* **Deep Remediation Inspector**:
  * **Prescribed AWS Fix**: Clear, human-readable guidance on root-cause remediation.
  * **Affected Resource ARN**: Copyable AWS resource identifier.
  * **Remediation Runbook CLI**: Pre-generated, exact AWS CLI commands to audit and remediate the issue immediately.
  * **Evidence Tabs**: Includes tabs for *Remediation Plan*, *Asset & Context*, and *Payload JSON*.

### 4. Architecture Pipeline View
Provides a live, visual 1-to-1 operational component verification map reflecting the deployed Terraform infrastructure across 5 stages:
1. *Presentation Layer (CDN & Web App)*
2. *API & Serverless Ingestion (Compute Engine)*
3. *AWS Security & Threat Detection (Sensors & CSPM)*
4. *Event Routing & Alerting (Pub/Sub Bus)*
5. *Storage & Analytics Lake (NoSQL & SQL Data Lake)*

---

## ⚙️ Step-by-Step Setup & Execution Guide

### Prerequisites
* **Node.js** (v18 or higher) and **npm**
* **Python** (v3.10 or higher)
* **Terraform** (v1.5 or higher, for cloud deployment)
* **AWS CLI** configured with an active AWS account (optional for local preview)

---

### Method A: Running the Frontend Locally (Dev Mode)

The frontend includes an integrated mock security engine that runs out-of-the-box without requiring live AWS credentials:

1. **Navigate to the Project Root**:
   ```powershell
   cd D:\acws_architecture
   ```

2. **Start the Development Server**:
   ```powershell
   npm run dev
   ```
   *(Or navigate into frontend: `cd frontend` followed by `npm run dev`)*

3. **Open the Dashboard**:
   Open your browser to: **[http://localhost:3000/](http://localhost:3000/)**

---

### Method B: Deploying Full Cloud Architecture to AWS

To deploy all serverless infrastructure, S3 buckets, CloudFront CDN, DynamoDB tables, Lambda functions, and security services to your AWS account:

1. **Configure AWS Credentials**:
   Run the interactive configuration script:
   ```powershell
   .\scripts\setup_aws_credentials.ps1
   ```
   Or set environment variables manually in PowerShell:
   ```powershell
   $env:AWS_ACCESS_KEY_ID="your_access_key"
   $env:AWS_SECRET_ACCESS_KEY="your_secret_key"
   $env:AWS_DEFAULT_REGION="us-east-1"
   ```

2. **Execute Automated Deployment**:
   Run the deployment automation script:
   ```powershell
   .\scripts\deploy.ps1 -AwsRegion "us-east-1" -AlertEmail "security-team@example.com"
   ```
   This script performs the following actions:
   - Packages Lambda functions (`backend/api_handler` and `backend/event_processor`) into deployment `.zip` archives.
   - Initializes and applies Terraform configurations under `terraform/`.
   - Provisions S3 buckets, CloudFront distribution with OAC, API Gateway, DynamoDB tables, EventBridge rules, and SNS topics.
   - Builds the production React application and synchronizes assets to the frontend S3 bucket.
   - Outputs the live CloudFront Dashboard URL and API Gateway endpoint.

3. **Verify the Deployment**:
   Run the end-to-end automated test suite:
   ```powershell
   python scripts\test_architecture.py <API_GATEWAY_URL> <CLOUDFRONT_URL>
   ```

---

### Method C: Infrastructure Teardown (Clean Destroy)

To avoid incurring ongoing AWS charges after evaluation or testing:

1. **Run Terraform Destroy**:
   ```powershell
   cd D:\acws_architecture\terraform
   terraform destroy -auto-approve
   ```

2. **Verify Teardown Completion**:
   Run the audit script to ensure 100% of resources have been cleanly removed:
   ```powershell
   python ..\scripts\verify_teardown.py
   ```

---

## 🔒 Security Best Practices Implemented

* **Principle of Least Privilege (PoLP)**: IAM roles for Lambda execution grant scoped permissions strictly to designated DynamoDB tables and specific S3 bucket prefixes.
* **Origin Access Control (OAC)**: Direct S3 public website hosting is disabled; content is accessible strictly through CloudFront with modern OAC signing.
* **Encrypted at Rest & in Transit**: TLS 1.3 enforced on CloudFront and API Gateway; server-side encryption (SSE-S3 / SSE-KMS) enabled on storage buckets and DynamoDB.
* **Optimized Data Lake Partitioning**: S3 security lake paths follow `/year=YYYY/month=MM/day=DD/` hierarchy, minimizing Athena query scan costs.
