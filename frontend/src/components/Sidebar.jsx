import React from 'react';

export default function Sidebar({ activeNav, onSelectNav, stats, isScanning }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Security Overview',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"/>
          <rect x="14" y="3" width="7" height="5"/>
          <rect x="14" y="12" width="7" height="9"/>
          <rect x="3" y="16" width="7" height="5"/>
        </svg>
      )
    },
    {
      id: 'findings',
      label: 'Findings & Triage',
      badge: stats?.total_open || 0,
      badgeColor: '#f43f5e',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    },
    {
      id: 'compliance',
      label: 'CIS Compliance',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )
    },
    {
      id: 'assets',
      label: 'Asset Inventory',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      )
    },
    {
      id: 'pipeline',
      label: 'Architecture Pipeline',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M3 12h6m6 0h6M12 3v6m0 6v6"/>
        </svg>
      )
    }
  ];

  return (
    <aside className="soc-sidebar">
      
      {/* Brand Header */}
      <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(14, 165, 233, 0.4)',
          color: '#fff',
          fontWeight: 800,
          fontSize: '1rem'
        }}>
          🛡️
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
              CloudShield
            </span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: '700' }}>
              CSPM
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>AWS Security Ops</div>
        </div>
      </div>

      {/* Account Selector Pill */}
      <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.6rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="radar-dot"></span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#f1f5f9' }}>Production AWS</div>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>363577672790</div>
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '600' }}>Active</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: '0.85rem 0.65rem', flex: 1 }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', padding: '0 0.65rem 0.5rem', letterSpacing: '0.06em' }}>
          Platform Navigation
        </div>

        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectNav(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                background: isActive ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.15s ease',
                marginBottom: '0.2rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ color: isActive ? '#38bdf8' : 'var(--text-dim)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  color: '#fda4af',
                  border: '1px solid rgba(244, 63, 94, 0.3)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry Status */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '600' }}>EventBridge Feed</span>
          <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700' }}>SYNCHRONIZED</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>AWS Region:</span>
          <span className="mono" style={{ color: '#f8fafc', fontWeight: '600' }}>us-east-1</span>
        </div>
      </div>

    </aside>
  );
}

