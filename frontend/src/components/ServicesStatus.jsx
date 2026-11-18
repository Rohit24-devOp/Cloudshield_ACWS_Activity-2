import React from 'react';

export default function ServicesStatus({ services }) {
  const serviceItems = [
    {
      id: "config",
      name: "AWS Config",
      desc: "Continuous resource compliance evaluation",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      status: services?.aws_config?.status || "ACTIVE",
      detail: "Recorder: cloudshield-recorder-dev"
    },
    {
      id: "guardduty",
      name: "Amazon GuardDuty",
      desc: "Intelligent threat & anomaly detection",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M12 8v4"/>
          <path d="M12 16h.01"/>
        </svg>
      ),
      status: services?.guardduty?.status || "ACTIVE",
      detail: "Detector: faafb3944e964abf..."
    },
    {
      id: "securityhub",
      name: "AWS Security Hub",
      desc: "Centralized CSPM & CIS Benchmark",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      status: services?.security_hub?.status || "ACTIVE",
      detail: "Standard: CIS AWS Foundations"
    },
    {
      id: "cloudtrail",
      name: "AWS CloudTrail",
      desc: "Multi-region API auditing & logs",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      status: services?.cloudtrail?.status || "ACTIVE",
      detail: "Trail: cloudshield-trail-dev"
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Connected AWS Security & Monitoring Services
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Real-time telemetry streamed via Amazon EventBridge & Serverless Lambda
          </p>
        </div>
        <span className="badge badge-success">
          <span className="badge-dot"></span> 4 Services Active
        </span>
      </div>

      {/* 4 Service Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {serviceItems.map((svc) => (
          <div 
            key={svc.id}
            style={{
              background: 'rgba(11, 18, 33, 0.7)',
              padding: '1.1rem',
              borderRadius: '11px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {svc.icon}
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>{svc.name}</strong>
                </div>

                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.18rem 0.5rem' }}>
                  <span className="badge-dot"></span> {svc.status}
                </span>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '0.35rem' }}>
                {svc.desc}
              </p>
            </div>

            <div style={{
              fontSize: '0.7rem',
              color: '#38bdf8',
              fontFamily: 'monospace',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '0.5rem',
              marginTop: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {svc.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
