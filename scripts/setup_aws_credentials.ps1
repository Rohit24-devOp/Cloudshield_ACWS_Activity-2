# ==============================================================================
# CloudShield - Helper Script to Set AWS Access Key & Secret Key
# ==============================================================================
param(
    [string]$AccessKeyId = "",
    [string]$SecretAccessKey = "",
    [string]$AwsRegion = "us-east-1"
)

if (-not $AccessKeyId) {
    $AccessKeyId = Read-Host "Enter your AWS Access Key ID"
}

if (-not $SecretAccessKey) {
    $SecretAccessKey = Read-Host "Enter your AWS Secret Access Key" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretAccessKey)
    $SecretAccessKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

if (-not $AccessKeyId -or -not $SecretAccessKey) {
    Write-Error "Access Key and Secret Key are required."
    exit 1
}

[System.Environment]::SetEnvironmentVariable('AWS_ACCESS_KEY_ID', $AccessKeyId, 'Process')
[System.Environment]::SetEnvironmentVariable('AWS_SECRET_ACCESS_KEY', $SecretAccessKey, 'Process')
[System.Environment]::SetEnvironmentVariable('AWS_DEFAULT_REGION', $AwsRegion, 'Process')

Write-Host "`nAWS Credentials successfully configured in the current session!" -ForegroundColor Green
Write-Host "AWS_DEFAULT_REGION: $AwsRegion" -ForegroundColor Cyan
Write-Host "You can now run: .\scripts\deploy.ps1 to launch the architecture.`n" -ForegroundColor Yellow

