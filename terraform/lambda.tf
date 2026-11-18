# Archive API Handler code
data "archive_file" "api_handler_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/api_handler"
  output_path = "${path.module}/dist/api_handler.zip"
}

# Archive Event Processor code
data "archive_file" "event_processor_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/event_processor"
  output_path = "${path.module}/dist/event_processor.zip"
}

# =========================================================================
# 1. LAMBDA: API HANDLER (Handle API Requests & Query Security Data)
# =========================================================================
resource "aws_lambda_function" "api_handler" {
  function_name    = "${var.project_name}-api-handler-${var.environment}"
  filename         = data.archive_file.api_handler_zip.output_path
  source_code_hash = data.archive_file.api_handler_zip.output_base64sha256
  role             = aws_iam_role.lambda_api_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DYNAMODB_FINDINGS_TABLE = aws_dynamodb_table.findings_table.name
      DYNAMODB_SCANS_TABLE    = aws_dynamodb_table.scans_table.name
      S3_DATA_LAKE_BUCKET     = aws_s3_bucket.security_datalake.bucket
      ATHENA_WORKGROUP        = aws_athena_workgroup.security_workgroup.name
      ATHENA_DATABASE         = aws_glue_catalog_database.security_db.name
    }
  }

  tags = {
    Name = "${var.project_name}-api-handler"
  }
}

# =========================================================================
# 2. LAMBDA: EVENT PROCESSOR (Process Findings & Apply Rules)
# =========================================================================
resource "aws_lambda_function" "event_processor" {
  function_name    = "${var.project_name}-event-processor-${var.environment}"
  filename         = data.archive_file.event_processor_zip.output_path
  source_code_hash = data.archive_file.event_processor_zip.output_base64sha256
  role             = aws_iam_role.lambda_event_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      DYNAMODB_FINDINGS_TABLE = aws_dynamodb_table.findings_table.name
      S3_DATA_LAKE_BUCKET     = aws_s3_bucket.security_datalake.bucket
      SNS_ALERTS_TOPIC_ARN    = aws_sns_topic.security_alerts.arn
    }
  }

  tags = {
    Name = "${var.project_name}-event-processor"
  }
}

