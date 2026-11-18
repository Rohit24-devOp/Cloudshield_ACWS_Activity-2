import React from 'react';

export default function StatsOverview({ stats, activeSeverity, onSelectSeverity }) {
  if (!stats) return null;

  const score = typeof stats.compliance_score === 'number' ? stats.compliance_score : 0;
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#facc15' : '#f43f5e';
  const circumference = 2 * Math.PI * 24;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const criticalCount = stats.severity_breakdown?.CRITICAL || 0;
  const highCount = stats.severity_breakdown?.HIGH || 0;
  const mediumCount = stats.severity_breakdown?.MEDIUM || 0;
  const totalOpen = stats.total_open || 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      
      {/* 1. Compliance Score with Circular Gauge */}
      <div 
        className="stat-card"
        style={{
          '--border-color': scoreColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(13, 20, 36, 0.7) 100%)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Compliance Posture
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: '800', color: scoreColor, letterSpacing: '-0.03em' }}>
              {score}%
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            CIS AWS Foundations & Best Practices
          </p>
        </div>

        {/* Circular SVG Gauge */}
        <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="30"
              cy="30"
              r="24"
              stroke={scoreColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <span style={{ position: 'absolute', fontSize: '0.8rem', fontWeight: '700', color: scoreColor }}>
            {score < 50 ? '!' : '✓'}
          </span>
        </div>
      </div>

      {/* 2. Critical Findings */}
      <div 
        className="stat-card"
        onClick={() => onSelectSeverity && onSelectSeverity(activeSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
        style={{
          '--border-color': '#f43f5e',
          borderColor: activeSeverity === 'CRITICAL' ? '#f43f5e' : undefined,
          boxShadow: activeSeverity === 'CRITICAL' ? '0 0 20px rgba(244, 63, 94, 0.25)' : undefined
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#fb7185', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Critical Severity
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#f43f5e', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
              {criticalCount}
            </div>
          </div>
          <span className="badge badge-critical">
            <span className="badge-dot"></span> Urgent
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Immediate action required</span>
          <span style={{ color: '#f43f5e', fontSize: '0.7rem', fontWeight: '600' }}>
            {activeSeverity === 'CRITICAL' ? 'Active Filter' : 'Filter →'}
          </span>
        </div>
      </div>

      {/* 3. High Severity */}
      <div 
        className="stat-card"
        onClick={() => onSelectSeverity && onSelectSeverity(activeSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
        style={{
          '--border-color': '#f97316',
          borderColor: activeSeverity === 'HIGH' ? '#f97316' : undefined,
          boxShadow: activeSeverity === 'HIGH' ? '0 0 20px rgba(249, 115, 22, 0.25)' : undefined
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#fb923c', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              High Severity
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#f97316', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
              {highCount}
            </div>
          </div>
          <span className="badge badge-high">
            <span className="badge-dot"></span> Action
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Misconfigurations & public access</span>
          <span style={{ color: '#f97316', fontSize: '0.7rem', fontWeight: '600' }}>
            {activeSeverity === 'HIGH' ? 'Active Filter' : 'Filter →'}
          </span>
        </div>
      </div>

      {/* 4. Total Open Issues */}
      <div 
        className="stat-card"
        onClick={() => onSelectSeverity && onSelectSeverity('ALL')}
        style={{
          '--border-color': '#38bdf8',
          borderColor: activeSeverity === 'ALL' ? 'rgba(56, 189, 248, 0.5)' : undefined
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Total Open Findings
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
              {totalOpen}
            </div>
          </div>
          <span className="badge badge-low">
            <span className="badge-dot"></span> DynamoDB
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Indexed in Data Lake</span>
          <span style={{ color: '#38bdf8', fontSize: '0.7rem', fontWeight: '600' }}>View All →</span>
        </div>
      </div>

    </div>
  );
}
