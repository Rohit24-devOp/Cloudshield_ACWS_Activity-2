import React, { useState, useEffect } from 'react';

export default function Navbar({ onTriggerScan, isScanning, onExport, onRefresh, lastUpdated }) {
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastUpdated) return;
      const seconds = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      if (seconds < 10) setTimeAgo('Just now');
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    }, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(6, 10, 19, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            position: 'relative',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 50%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                fontSize: '1.35rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CloudShield
              </span>
              <span className="badge badge-low" style={{ fontSize: '0.65rem', padding: '0.2rem 0.55rem' }}>
                <span className="badge-dot"></span> v1.0 Live
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
              AWS Security & Misconfiguration Detection Platform
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* AWS Account & Region Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.4rem 0.85rem',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '9px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Region:</span>
              <strong style={{ color: '#f1f5f9' }}>us-east-1</strong>
            </div>

            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>363577672790</strong>
            </div>
          </div>

          {/* Refresh & Last Updated */}
          <button 
            className="btn btn-secondary" 
            onClick={onRefresh}
            title={`Last updated ${timeAgo}. Click to refresh.`}
            style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo}</span>
          </button>

          {/* Export Report */}
          <button 
            className="btn btn-secondary"
            onClick={onExport}
            title="Download Security Findings Report (JSON)"
            style={{ padding: '0.55rem 0.9rem' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export Report</span>
          </button>

          {/* Run Security Scan */}
          <button 
            className="btn btn-primary"
            onClick={onTriggerScan}
            disabled={isScanning}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ animation: isScanning ? 'spinSlow 1.5s linear infinite' : 'none' }}
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="22" y1="12" x2="18" y2="12"/>
              <line x1="6" y1="12" x2="2" y2="12"/>
              <line x1="12" y1="6" x2="12" y2="2"/>
              <line x1="12" y1="22" x2="12" y2="18"/>
            </svg>
            <span>{isScanning ? 'Scanning AWS Services...' : 'Run Security Scan'}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
