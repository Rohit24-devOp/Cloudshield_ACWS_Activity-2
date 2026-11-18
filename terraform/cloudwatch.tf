# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "api_handler_logs" {
  name              = "/aws/lambda/${var.project_name}-api-handler-${var.environment}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "event_processor_logs" {
  name              = "/aws/lambda/${var.project_name}-event-processor-${var.environment}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "api_gw_logs" {
  name              = "/aws/apigateway/${var.project_name}-api-${var.environment}"
  retention_in_days = 14
}

# CloudWatch Alarm: Lambda Errors
resource "aws_cloudwatch_metric_alarm" "lambda_error_alarm" {
  alarm_name          = "${var.project_name}-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Alarm when Lambda functions encounter unhandled runtime exceptions"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.event_processor.function_name
  }
}

# CloudWatch Alarm: High/Critical Findings Detected
resource "aws_cloudwatch_metric_alarm" "critical_findings_alarm" {
  alarm_name          = "${var.project_name}-critical-findings-spike-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FindingsDiscovered"
  namespace           = "CloudShield/SecurityMetrics"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Triggers when more than 5 critical/high misconfigurations or threats are detected in 5 minutes"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# CloudWatch Operations Dashboard
resource "aws_cloudwatch_dashboard" "operations_dashboard" {
  dashboard_name = "${var.project_name}-operations-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["CloudShield/SecurityMetrics", "FindingsDiscovered", "Service", "GuardDuty"],
            [".", ".", "Service", "SecurityHub"],
            [".", ".", "Service", "Config"],
            [".", ".", "Service", "CloudTrail"]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "CloudShield - Security Findings Discovered by Service"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.api_handler.function_name],
            [".", "Errors", ".", "."],
            [".", "Invocations", "FunctionName", aws_lambda_function.event_processor.function_name],
            [".", "Errors", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Serverless Lambdas - Invocations vs Errors"
        }
      }
    ]
  })
}

