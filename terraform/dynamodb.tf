resource "aws_dynamodb_table" "findings_table" {
  name         = "${var.project_name}-findings-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "finding_id"

  attribute {
    name = "finding_id"
    type = "S"
  }

  attribute {
    name = "severity"
    type = "S"
  }

  attribute {
    name = "service"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "severity-created_at-index"
    hash_key        = "severity"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "service-created_at-index"
    hash_key        = "service"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-findings"
  }
}

resource "aws_dynamodb_table" "scans_table" {
  name         = "${var.project_name}-scans-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "scan_id"

  attribute {
    name = "scan_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-scans"
  }
}

