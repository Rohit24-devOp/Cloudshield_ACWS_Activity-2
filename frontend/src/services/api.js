// API Base URL - read from environment variable or window config injected at runtime
const API_BASE_URL = 
  (typeof window !== 'undefined' && window.__CLOUDSHIELD_API_URL__) ||
  import.meta.env.VITE_API_URL ||
  "";

// Fallback mock data representing live AWS Security services
const MOCK_STATS = {
  total_findings: 18,
  total_open: 14,
  compliance_score: 82.5,
  severity_breakdown: {
    CRITICAL: 2,
    HIGH: 5,
    MEDIUM: 7,
    LOW: 4
  },
  service_breakdown: {
    Config: 6,
    GuardDuty: 3,
    SecurityHub: 7,
    CloudTrail: 2
  },
  status_breakdown: {
    OPEN: 14,
    RESOLVED: 4
  },
  last_evaluated: new Date().toISOString()
};

const MOCK_SERVICES = {
  aws_config: { status: "ACTIVE", details: { rules_active: 4, recorder: "cloudshield-recorder-dev" } },
  guardduty: { status: "ACTIVE", details: { detector_id: "det-491208a0fcb", threats_detected: 3 } },
  security_hub: { status: "ACTIVE", details: { standards: "CIS AWS Benchmark & Foundational Security" } },
  cloudtrail: { status: "ACTIVE", details: { multi_region: true, log_validation: "Enabled" } }
};

const MOCK_FINDINGS = [
  {
    finding_id: "sec-find-001",
    service: "SecurityHub",
    title: "S3 Bucket Public Read Access Permitted",
    severity: "CRITICAL",
    resource_id: "arn:aws:s3:::customer-assets-archive",
    status: "OPEN",
    description: "S3 Bucket policy contains Principal '*' allowing anonymous internet read access without authentication.",
    remediation: "Apply S3 Block Public Access and restrict bucket policy to authenticated IAM principals only.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    finding_id: "sec-find-002",
    service: "GuardDuty",
    title: "Recon:IAMUser/AnomalousBehavior",
    severity: "CRITICAL",
    resource_id: "arn:aws:iam::123456789012:user/devops-ci",
    status: "OPEN",
    description: "GuardDuty detected API DescribeInstances and GetCallerIdentity invoked from an unusual geolocation (Tor exit node).",
    remediation: "Revoke active IAM sessions, deactivate leaked access key, and inspect CloudTrail trails.",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    finding_id: "sec-find-003",
    service: "Config",
    title: "Security Group Port 22 (SSH) Open to World",
    severity: "HIGH",
    resource_id: "sg-04819a58b2cd (launch-wizard-1)",
    status: "OPEN",
    description: "Inbound rule allows TCP port 22 traffic from CIDR block 0.0.0.0/0.",
    remediation: "Restrict SSH ingress to the corporate bastion host CIDR or VPN gateway.",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    finding_id: "sec-find-004",
    service: "Config",
    title: "Root Account MFA Not Enabled",
    severity: "HIGH",
    resource_id: "arn:aws:iam::123456789012:root",
    status: "OPEN",
    description: "The AWS Account root user does not have a virtual or hardware Multi-Factor Authentication device activated.",
    remediation: "Enable FIDO2 WebAuthn or virtual MFA for the root user immediately in IAM console.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    finding_id: "sec-find-005",
    service: "CloudTrail",
    title: "IAM Access Key Created Without Expiry",
    severity: "MEDIUM",
    resource_id: "arn:aws:iam::123456789012:user/data-sync-worker",
    status: "OPEN",
    description: "CloudTrail logged CreateAccessKey event. Credential rotation policy recommends 90-day maximum age.",
    remediation: "Automate Secrets Manager rotation or migrate to IAM Roles Anywhere / IRSA.",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    finding_id: "sec-find-006",
    service: "Config",
    title: "EBS Volumes Without Encryption Enabled",
    severity: "LOW",
    resource_id: "vol-0a817b22cf9",
    status: "OPEN",
    description: "Attached EBS volume is unencrypted at rest. Default EBS encryption is recommended.",
    remediation: "Enable default AWS KMS EBS volume encryption at the region level.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export async function fetchStats() {
  if (!API_BASE_URL) {
    return MOCK_STATS;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback stats due to API error:", err);
    return MOCK_STATS;
  }
}

export async function fetchFindings(params = {}) {
  if (!API_BASE_URL) {
    let list = [...MOCK_FINDINGS];
    if (params.severity) {
      list = list.filter(f => f.severity.toUpperCase() === params.severity.toUpperCase());
    }
    if (params.service) {
      list = list.filter(f => f.service.toLowerCase() === params.service.toLowerCase());
    }
    return { count: list.length, findings: list };
  }
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/findings?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback findings due to API error:", err);
    return { count: MOCK_FINDINGS.length, findings: MOCK_FINDINGS };
  }
}

export async function fetchServicesStatus() {
  if (!API_BASE_URL) {
    return MOCK_SERVICES;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/services`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Using fallback service statuses:", err);
    return MOCK_SERVICES;
  }
}

export async function triggerManualScan() {
  if (!API_BASE_URL) {
    await new Promise(r => setTimeout(r, 1200));
    return {
      message: "Security scan completed successfully (Simulated Mode)",
      scan_id: `scan-${Date.now()}`,
      findings_discovered: MOCK_FINDINGS.length,
      findings: MOCK_FINDINGS
    };
  }
  const res = await fetch(`${API_BASE_URL}/api/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

