output "dashboard_url" {
  description = "Public URL of CloudShield Security Dashboard"
  value       = "http://${aws_s3_bucket_website_configuration.frontend_website.website_endpoint}"
}

output "frontend_website_endpoint" {
  description = "S3 static website hosting endpoint"
  value       = "http://${aws_s3_bucket_website_configuration.frontend_website.website_endpoint}"
}

output "cloudfront_dashboard_url" {
  description = "CloudFront URL (if enabled)"
  value       = var.enable_cloudfront ? "https://${aws_cloudfront_distribution.frontend_distribution[0].domain_name}" : "Disabled (Account verification pending)"
}

output "frontend_s3_bucket" {
  description = "S3 bucket name hosting the React frontend web app"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "security_datalake_s3_bucket" {
  description = "S3 bucket name hosting security logs, findings data lake, and Athena results"
  value       = aws_s3_bucket.security_datalake.id
}

output "api_gateway_url" {
  description = "API Gateway base endpoint URL"
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
}

output "dynamodb_findings_table" {
  description = "DynamoDB table storing security findings"
  value       = aws_dynamodb_table.findings_table.name
}

output "dynamodb_scans_table" {
  description = "DynamoDB table storing scan execution metadata"
  value       = aws_dynamodb_table.scans_table.name
}

output "sns_alerts_topic_arn" {
  description = "SNS Topic ARN for security alerts"
  value       = aws_sns_topic.security_alerts.arn
}

output "athena_workgroup" {
  description = "Athena Workgroup name"
  value       = aws_athena_workgroup.security_workgroup.name
}

output "glue_catalog_database" {
  description = "AWS Glue Data Catalog Database name"
  value       = aws_glue_catalog_database.security_db.name
}

output "cloudwatch_dashboard" {
  description = "CloudWatch Operational Dashboard name"
  value       = aws_cloudwatch_dashboard.operations_dashboard.dashboard_name
}
