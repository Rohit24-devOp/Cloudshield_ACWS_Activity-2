# EventBridge Rule 1: GuardDuty Findings
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  name        = "${var.project_name}-guardduty-rule-${var.environment}"
  description = "Capture GuardDuty threat findings"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
  })
}

# EventBridge Rule 2: Security Hub Findings
resource "aws_cloudwatch_event_rule" "securityhub_findings" {
  name        = "${var.project_name}-securityhub-rule-${var.environment}"
  description = "Capture Security Hub findings"

  event_pattern = jsonencode({
    source      = ["aws.securityhub"]
    detail-type = ["Security Hub Findings - Imported"]
  })
}

# EventBridge Rule 3: AWS Config Compliance Changes
resource "aws_cloudwatch_event_rule" "config_compliance_change" {
  name        = "${var.project_name}-config-rule-${var.environment}"
  description = "Capture AWS Config compliance state changes"

  event_pattern = jsonencode({
    source      = ["aws.config"]
    detail-type = ["Config Rules Compliance Change"]
  })
}

# EventBridge Rule 4: CloudTrail Sensitive API Activity
resource "aws_cloudwatch_event_rule" "cloudtrail_security_events" {
  name        = "${var.project_name}-cloudtrail-security-rule-${var.environment}"
  description = "Capture high-risk AWS CloudTrail security actions"

  event_pattern = jsonencode({
    source = ["aws.cloudtrail"]
    detail = {
      eventName = [
        "ConsoleLogin",
        "AuthorizeSecurityGroupIngress",
        "AuthorizeSecurityGroupEgress",
        "PutBucketPolicy",
        "PutBucketAcl",
        "CreateAccessKey"
      ]
    }
  })
}

# Targets for Lambda: Event Processor
resource "aws_cloudwatch_event_target" "guardduty_to_lambda" {
  rule      = aws_cloudwatch_event_rule.guardduty_findings.name
  target_id = "SendGuardDutyToLambda"
  arn       = aws_lambda_function.event_processor.arn
}

resource "aws_cloudwatch_event_target" "securityhub_to_lambda" {
  rule      = aws_cloudwatch_event_rule.securityhub_findings.name
  target_id = "SendSecurityHubToLambda"
  arn       = aws_lambda_function.event_processor.arn
}

resource "aws_cloudwatch_event_target" "config_to_lambda" {
  rule      = aws_cloudwatch_event_rule.config_compliance_change.name
  target_id = "SendConfigToLambda"
  arn       = aws_lambda_function.event_processor.arn
}

resource "aws_cloudwatch_event_target" "cloudtrail_to_lambda" {
  rule      = aws_cloudwatch_event_rule.cloudtrail_security_events.name
  target_id = "SendCloudTrailToLambda"
  arn       = aws_lambda_function.event_processor.arn
}

# Lambda invoke permissions from EventBridge rules
resource "aws_lambda_permission" "allow_eventbridge_guardduty" {
  statement_id  = "AllowEventBridgeGuardDuty"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.event_processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_findings.arn
}

resource "aws_lambda_permission" "allow_eventbridge_securityhub" {
  statement_id  = "AllowEventBridgeSecurityHub"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.event_processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.securityhub_findings.arn
}

resource "aws_lambda_permission" "allow_eventbridge_config" {
  statement_id  = "AllowEventBridgeConfig"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.event_processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.config_compliance_change.arn
}

resource "aws_lambda_permission" "allow_eventbridge_cloudtrail" {
  statement_id  = "AllowEventBridgeCloudTrail"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.event_processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cloudtrail_security_events.arn
}

