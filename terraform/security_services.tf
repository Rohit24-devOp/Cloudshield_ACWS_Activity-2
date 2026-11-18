# =========================================================================
# 1. AWS CONFIG (Config changes & compliance)
# =========================================================================
resource "aws_config_configuration_recorder" "config_recorder" {
  name     = "${var.project_name}-recorder-${var.environment}"
  role_arn = aws_iam_role.config_role.arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_config_delivery_channel" "config_delivery_channel" {
  name           = "${var.project_name}-delivery-channel-${var.environment}"
  s3_bucket_name = aws_s3_bucket.security_datalake.bucket
  s3_key_prefix  = "aws-config"

  snapshot_delivery_properties {
    delivery_frequency = "Six_Hours"
  }

  depends_on = [
    aws_config_configuration_recorder.config_recorder,
    aws_s3_bucket_policy.datalake_service_policy
  ]
}

resource "aws_config_configuration_recorder_status" "config_status" {
  name       = aws_config_configuration_recorder.config_recorder.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.config_delivery_channel]
}

# AWS Config Managed Rule: S3 Public Read Prohibited
resource "aws_config_config_rule" "s3_public_read_prohibited" {
  name        = "s3-bucket-public-read-prohibited"
  description = "Checks that your Amazon S3 buckets do not allow public read access."

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_PUBLIC_READ_PROHIBITED"
  }

  depends_on = [aws_config_configuration_recorder_status.config_status]
}

# AWS Config Managed Rule: Restricted SSH
resource "aws_config_config_rule" "restricted_ssh" {
  name        = "restricted-ssh"
  description = "Checks whether security groups in use disallow unrestricted incoming SSH traffic (port 22)."

  source {
    owner             = "AWS"
    source_identifier = "INCOMING_SSH_DISABLED"
  }

  depends_on = [aws_config_configuration_recorder_status.config_status]
}

# AWS Config Managed Rule: Root Account MFA
resource "aws_config_config_rule" "root_account_mfa" {
  name        = "root-account-mfa-enabled"
  description = "Checks whether the root user of your AWS account has MFA enabled."

  source {
    owner             = "AWS"
    source_identifier = "ROOT_ACCOUNT_MFA_ENABLED"
  }

  depends_on = [aws_config_configuration_recorder_status.config_status]
}

# AWS Config Managed Rule: EBS Encrypted Volumes
resource "aws_config_config_rule" "encrypted_volumes" {
  name        = "encrypted-volumes"
  description = "Checks whether EBS volumes that are in an attached state are encrypted."

  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }

  depends_on = [aws_config_configuration_recorder_status.config_status]
}


# =========================================================================
# 2. AWS CLOUDTRAIL (API activity logs)
# =========================================================================
resource "aws_cloudtrail" "security_trail" {
  name                          = "${var.project_name}-trail-${var.environment}"
  s3_bucket_name                = aws_s3_bucket.security_datalake.bucket
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true

  depends_on = [aws_s3_bucket_policy.datalake_service_policy]

  tags = {
    Name = "${var.project_name}-cloudtrail"
  }
}


# =========================================================================
# 3. AMAZON GUARDDUTY (Threat detection)
# =========================================================================
resource "aws_guardduty_detector" "primary_detector" {
  enable                       = true
  finding_publishing_frequency = "FIFTEEN_MINUTES"

  tags = {
    Name = "${var.project_name}-guardduty"
  }
}


# =========================================================================
# 4. AWS SECURITY HUB (Centralized security findings)
# =========================================================================
resource "aws_securityhub_account" "security_hub" {
  enable_default_standards = true
}
