variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  type        = string
  default     = null
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  type        = string
  default     = null
  sensitive   = true
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "cloudshield"
}

variable "environment" {
  description = "Environment stage (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "alert_email" {
  description = "Email address for security alert notifications via SNS"
  type        = string
  default     = ""
}

variable "enable_cloudfront" {
  description = "Enable CloudFront CDN distribution (requires verified AWS account for CloudFront)"
  type        = bool
  default     = false
}
