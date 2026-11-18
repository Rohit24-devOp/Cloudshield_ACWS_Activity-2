import React from 'react';

export default function PostureScorecard({ stats, activeSeverity, onSelectSeverity }) {
  if (!stats) return null;

  const score = typeof stats.compliance_score === 'number' ? stats.compliance_score : 0;
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  
  const critical = stats.severity_breakdown?.CRITICAL || 0;
  const high = stats.severity_breakdown?.HIGH || 0;
  const medium = stats.severity_breakdown?.MEDIUM || 0;
  const low = stats.severity_breakdown?.LOW || 0;
  const info = stats.severity_breakdown?.INFORMATIONAL || 0;
  const total = stats.total_findings || (critical + high + medium + low + info) || 1;

  const pCritical = ((critical / total) * 100).toFixed(1);
  const pHigh = ((high / total) * 100).toFixed(1);
  const pMedium = ((medium / total) * 100).toFixed(1);
  const pLow = ((low / total) * 100).toFixed(1);
  const pInfo = ((info / total) * 100).toFixed(1);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '320px 1fr 340px',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      
      {/* 1. CIS Posture Gauge Card */}
      <div className="soc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CIS Security Posture
          </span>
          <span style={{ fontSize: '0.65rem', color: '#38bdf8', fontFamily: 'monospace' }}>
            v1.4.0 Benchmark
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '0.85rem 0' }}>
          <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="70" height="70" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="30" cy="30" r="25" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent"/>
              <circle 
                cx="30" 
                cy="30" 
                r="25" 
                stroke={scoreColor} 
                strokeWidth="6" 
                strokeDasharray={2 * Math.PI * 25} 
                strokeDashoffset={2 * Math.PI * 25 * (1 - score / 100)} 
                strokeLinecap="round" 
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span className="mono" style={{ fontSize: '1.1rem', fontWeight: '800', color: scoreColor }}>
                {score}%
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>
              {score >= 80 ? 'Optimal Compliance' : score >= 50 ? 'Moderate Risk Detected' : 'Elevated Exposure'}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Evaluated across S3 public buckets, IAM root MFA, & Security Group ingress.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', fontSize: '0.7rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>Policy Engine</span>
          <span style={{ color: '#10b981', fontWeight: '600' }}>Active Enforcement</span>
        </div>
      </div>

      {/* 2. Attack Surface Severity Spectrum */}
      <div className="soc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Attack Surface Severity Distribution
          </span>
          <span className="mono" style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: '700' }}>
            {total} Total Findings
          </span>
        </div>

        {/* Proportional Segmented Progress Bar */}
        <div style={{ margin: '1rem 0' }}>
          <div style={{
            height: '10px',
            borderRadius: '6px',
            overflow: 'hidden',
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            gap: '2px'
          }}>
            {critical > 0 && <div style={{ width: `${pCritical}%`, background: '#f43f5e' }} title={`Critical: ${critical}`} />}
            {high > 0 && <div style={{ width: `${pHigh}%`, background: '#f97316' }} title={`High: ${high}`} />}
            {medium > 0 && <div style={{ width: `${pMedium}%`, background: '#f59e0b' }} title={`Medium: ${medium}`} />}
            {low > 0 && <div style={{ width: `${pLow}%`, background: '#0ea5e9' }} title={`Low: ${low}`} />}
            {info > 0 && <div style={{ width: `${pInfo}%`, background: '#64748b' }} title={`Informational: ${info}`} />}
          </div>
        </div>

        {/* Interactive Severity Filter Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
          
          <button
            onClick={() => onSelectSeverity('CRITICAL')}
            style={{
              background: activeSeverity === 'CRITICAL' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(244, 63, 94, 0.08)',
              border: '1px solid',
              borderColor: activeSeverity === 'CRITICAL' ? '#f43f5e' : 'rgba(244, 63, 94, 0.2)',
              borderRadius: '8px',
              padding: '0.55rem 0.4rem',
              textAlign: 'center',
              cursor: 'pointer',
              color: '#fda4af',
              transition: 'all 0.15s ease'
            }}
          >
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '800' }}>{critical}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700' }}>Critical</div>
          </button>

          <button
            onClick={() => onSelectSeverity('HIGH')}
            style={{
              background: activeSeverity === 'HIGH' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(249, 115, 22, 0.08)',
              border: '1px solid',
              borderColor: activeSeverity === 'HIGH' ? '#f97316' : 'rgba(249, 115, 22, 0.2)',
              borderRadius: '8px',
              padding: '0.55rem 0.4rem',
              textAlign: 'center',
              cursor: 'pointer',
              color: '#fdba74',
              transition: 'all 0.15s ease'
            }}
          >
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '800' }}>{high}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700' }}>High</div>
          </button>

          <button
            onClick={() => onSelectSeverity('MEDIUM')}
            style={{
              background: activeSeverity === 'MEDIUM' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.08)',
              border: '1px solid',
              borderColor: activeSeverity === 'MEDIUM' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              padding: '0.55rem 0.4rem',
              textAlign: 'center',
              cursor: 'pointer',
              color: '#fde047',
              transition: 'all 0.15s ease'
            }}
          >
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '800' }}>{medium}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700' }}>Medium</div>
          </button>

          <button
            onClick={() => onSelectSeverity('LOW')}
            style={{
              background: activeSeverity === 'LOW' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(14, 165, 233, 0.08)',
              border: '1px solid',
              borderColor: activeSeverity === 'LOW' ? '#0ea5e9' : 'rgba(14, 165, 233, 0.2)',
              borderRadius: '8px',
              padding: '0.55rem 0.4rem',
              textAlign: 'center',
              cursor: 'pointer',
              color: '#7dd3fc',
              transition: 'all 0.15s ease'
            }}
          >
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '800' }}>{low}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700' }}>Low</div>
          </button>

          <button
            onClick={() => onSelectSeverity('ALL')}
            style={{
              background: activeSeverity === 'ALL' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid',
              borderColor: activeSeverity === 'ALL' ? '#f8fafc' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.55rem 0.4rem',
              textAlign: 'center',
              cursor: 'pointer',
              color: '#cbd5e1',
              transition: 'all 0.15s ease'
            }}
          >
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '800' }}>{total}</div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '700' }}>All</div>
          </button>

        </div>
      </div>

      {/* 3. Security Engine Feed Health */}
      <div className="soc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sensors & Data Lake
          </span>
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>
            ONLINE
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', margin: '0.6rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>GuardDuty Threat Stream:</span>
            <span style={{ color: '#f8fafc', fontWeight: '600' }}>Active (15m Interval)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>DynamoDB Lake Sync:</span>
            <span className="mono" style={{ color: '#0ea5e9', fontWeight: '600' }}>cloudshield-findings-dev</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>S3 Audit Lake:</span>
            <span className="mono" style={{ color: '#a78bfa', fontWeight: '600' }}>cloudshield-security-datalake</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
          <span style={{ color: 'var(--text-dim)' }}>Alert Pipeline:</span>
          <span style={{ color: '#38bdf8', fontWeight: '600' }}>Amazon SNS Subscribed</span>
        </div>
      </div>

    </div>
  );
}

