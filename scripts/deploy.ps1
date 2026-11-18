# ==============================================================================
# CloudShield - Automated Deployment Script
# ==============================================================================
param(
    [string]$AwsRegion = "us-east-1",
    [string]$AlertEmail = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   CloudShield AWS Architecture Deployment Initiated   " -ForegroundColor Cyan
Write-Host "=======================================================`n" -ForegroundColor Cyan

# 1. Check AWS Credentials
Write-Host "[1/5] Checking AWS Credentials..." -ForegroundColor Yellow
if (-not $env:AWS_ACCESS_KEY_ID -or -not $env:AWS_SECRET_ACCESS_KEY) {
    Write-Warning "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables not found."
    Write-Host "Please set your AWS credentials or run scripts\setup_aws_credentials.ps1 before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "AWS credentials detected." -ForegroundColor Green

# 2. Package Lambda Functions
Write-Host "`n[2/5] Packaging Lambda zip artifacts..." -ForegroundColor Yellow
$terraformDist = Join-Path $PSScriptRoot "..\terraform\dist"
if (-not (Test-Path $terraformDist)) {
    New-Item -ItemType Directory -Path $terraformDist -Force | Out-Null
}

$apiHandlerSrc = Join-Path $PSScriptRoot "..\backend\api_handler\*"
$apiHandlerZip = Join-Path $terraformDist "api_handler.zip"
if (Test-Path $apiHandlerZip) { Remove-Item $apiHandlerZip -Force }
Compress-Archive -Path $apiHandlerSrc -DestinationPath $apiHandlerZip -Force
Write-Host "Packaged api_handler.zip" -ForegroundColor Green

$eventProcessorSrc = Join-Path $PSScriptRoot "..\backend\event_processor\*"
$eventProcessorZip = Join-Path $terraformDist "event_processor.zip"
if (Test-Path $eventProcessorZip) { Remove-Item $eventProcessorZip -Force }
Compress-Archive -Path $eventProcessorSrc -DestinationPath $eventProcessorZip -Force
Write-Host "Packaged event_processor.zip" -ForegroundColor Green

# 3. Terraform Init & Apply
Write-Host "`n[3/5] Initializing & Applying Terraform Infrastructure..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "..\terraform")

terraform init
if ($LASTEXITCODE -ne 0) {
    Write-Error "Terraform init failed."
    exit $LASTEXITCODE
}

$tfArgs = @("apply", "-auto-approve")
if ($AlertEmail) {
    $tfArgs += "-var=alert_email=$AlertEmail"
}
$tfArgs += "-var=aws_region=$AwsRegion"

terraform @tfArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Terraform apply failed."
    exit $LASTEXITCODE
}

# 4. Extract Outputs
Write-Host "`n[4/5] Extracting Architecture Endpoints..." -ForegroundColor Yellow
$frontendBucket = (terraform output -raw frontend_s3_bucket 2>$null)
$cloudfrontUrl = (terraform output -raw cloudfront_dashboard_url 2>$null)
$cfDistributionId = (terraform output -raw cloudfront_distribution_id 2>$null)
$apiUrl = (terraform output -raw api_gateway_url 2>$null)

Write-Host "Frontend S3 Bucket: $frontendBucket" -ForegroundColor Cyan
Write-Host "API Gateway URL:    $apiUrl" -ForegroundColor Cyan
Write-Host "CloudFront URL:     $cloudfrontUrl" -ForegroundColor Cyan

# 5. Sync Frontend Web App to S3 & Invalidate CloudFront
Write-Host "`n[5/5] Deploying Web App to S3 & CloudFront..." -ForegroundColor Yellow
$frontendDist = Join-Path $PSScriptRoot "..\frontend\dist"

# Inject API Gateway URL into index.html
$indexHtmlPath = Join-Path $frontendDist "index.html"
if (Test-Path $indexHtmlPath) {
    $content = Get-Content $indexHtmlPath -Raw
    $injected = $content -replace 'window\.__CLOUDSHIELD_API_URL__\s*\|\|\s*""', "`"$apiUrl`""
    Set-Content -Path $indexHtmlPath -Value $injected
}

if (Get-Command aws -ErrorAction SilentlyContinue) {
    aws s3 sync $frontendDist "s3://$frontendBucket" --delete
    if ($cfDistributionId) {
        aws cloudfront create-invalidation --distribution-id $cfDistributionId --paths "/*" | Out-Null
    }
    Write-Host "Frontend successfully uploaded to S3 and CloudFront cache invalidated!" -ForegroundColor Green
} else {
    Write-Warning "AWS CLI not found on PATH. Please upload files in frontend\dist to s3://$frontendBucket manually or install aws-cli."
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "   CloudShield Architecture Deployment Complete!      " -ForegroundColor Green
Write-Host "   Access Dashboard: $cloudfrontUrl" -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Green

