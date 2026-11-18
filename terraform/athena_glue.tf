# =========================================================================
# 1. AWS GLUE DATA CATALOG
# =========================================================================
resource "aws_glue_catalog_database" "security_db" {
  name        = "${var.project_name}_security_db_${var.environment}"
  description = "CloudShield Security Lake Catalog Database for Athena Analytics"
}

# Glue Table for Structured Findings Lake
resource "aws_glue_catalog_table" "findings_catalog_table" {
  name          = "security_findings"
  database_name = aws_glue_catalog_database.security_db.name
  table_type    = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL              = "TRUE"
    "classification"      = "json"
    "compressionType"     = "none"
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.security_datalake.bucket}/findings/"
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.IgnoreKeyTextOutputFormat"

    ser_de_info {
      name                  = "json-serde"
      serialization_library = "org.openx.data.jsonserde.JsonSerDe"
      parameters = {
        "ignore.malformed.json" = "true"
      }
    }

    columns {
      name = "finding_id"
      type = "string"
    }
    columns {
      name = "service"
      type = "string"
    }
    columns {
      name = "title"
      type = "string"
    }
    columns {
      name = "description"
      type = "string"
    }
    columns {
      name = "severity"
      type = "string"
    }
    columns {
      name = "resource_id"
      type = "string"
    }
    columns {
      name = "status"
      type = "string"
    }
    columns {
      name = "remediation"
      type = "string"
    }
    columns {
      name = "created_at"
      type = "string"
    }
    columns {
      name = "updated_at"
      type = "string"
    }
  }

  partition_keys {
    name = "year"
    type = "string"
  }
  partition_keys {
    name = "month"
    type = "string"
  }
  partition_keys {
    name = "day"
    type = "string"
  }
}


# =========================================================================
# 2. AMAZON ATHENA (Query historical logs and security data)
# =========================================================================
resource "aws_athena_workgroup" "security_workgroup" {
  name        = "${var.project_name}-workgroup-${var.environment}"
  description = "Athena workgroup for CloudShield security analytics and QuickSight reporting"

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true

    result_configuration {
      output_location = "s3://${aws_s3_bucket.security_datalake.bucket}/athena-query-results/"
      encryption_configuration {
        encryption_option = "SSE_S3"
      }
    }
  }

  tags = {
    Name = "${var.project_name}-athena-workgroup"
  }
}

# Pre-packaged Athena Named Queries for Security Analysts
resource "aws_athena_named_query" "query_critical_findings" {
  name      = "cloudshield-critical-and-high-findings"
  workgroup = aws_athena_workgroup.security_workgroup.id
  database  = aws_glue_catalog_database.security_db.name
  query     = <<-SQL
    SELECT service, severity, title, resource_id, status, created_at
    FROM ${aws_glue_catalog_database.security_db.name}.security_findings
    WHERE severity IN ('CRITICAL', 'HIGH')
    ORDER BY created_at DESC
    LIMIT 100;
  SQL
}

resource "aws_athena_named_query" "query_service_breakdown" {
  name      = "cloudshield-findings-summary-by-service"
  workgroup = aws_athena_workgroup.security_workgroup.id
  database  = aws_glue_catalog_database.security_db.name
  query     = <<-SQL
    SELECT service, severity, count(*) as total_occurrences
    FROM ${aws_glue_catalog_database.security_db.name}.security_findings
    GROUP BY service, severity
    ORDER BY total_occurrences DESC;
  SQL
}

