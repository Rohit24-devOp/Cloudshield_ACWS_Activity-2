import React from 'react';

export default function TopHeader({ onTriggerScan, isScanning, onExport, onRefresh, searchTerm, onSearchChange }) {
  return (
    <header className="soc-topbar">
      
      {/* Global Search with command palette styling */}
      <div style={{ position: 'relative', width: '380px' }}>
        <svg 
          width="15" 
          height="15" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--text-dim)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <input
          type="text"
          placeholder="Filter resources, IAM keys, CVEs, or findings..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: '#f8fafc',
            padding: '0.45rem 2.8rem 0.45rem 2.2rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            outline: 'none',
            transition: 'border 0.2s ease'
          }}
        />

        <span style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.65rem',
          background: 'rgba(255, 255, 255, 0.08)',
          color: 'var(--text-dim)',
          padding: '0.15rem 0.35rem',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          /
        </span>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Real-time Threat Monitor Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          fontSize: '0.72rem',
          color: '#34d399',
          fontWeight: '600'
        }}>
          <span className="radar-dot"></span>
          <span>Security Engine Live</span>
        </div>

        {/* Refresh */}
        <button 
          className="soc-btn soc-btn-secondary" 
          onClick={onRefresh}
          title="Refresh Data from DynamoDB"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
          <span>Refresh</span>
        </button>

        {/* Export Report */}
        <button 
          className="soc-btn soc-btn-secondary" 
          onClick={onExport}
          title="Export Findings as JSON"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Export</span>
        </button>

        {/* Trigger On-Demand Scan */}
        <button 
          className="soc-btn soc-btn-primary" 
          onClick={onTriggerScan}
          disabled={isScanning}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="22" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="12" x2="2" y2="12"/>
            <line x1="12" y1="6" x2="12" y2="2"/>
            <line x1="12" y1="22" x2="12" y2="18"/>
          </svg>
          <span>{isScanning ? 'Scanning...' : 'Trigger Scan'}</span>
        </button>

        {/* Admin Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.75rem',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          SO
        </div>

      </div>

    </header>
  );
}

