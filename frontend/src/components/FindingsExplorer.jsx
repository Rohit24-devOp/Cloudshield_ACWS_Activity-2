import React, { useState } from 'react';

export default function FindingsExplorer({ findings, activeSeverity, onSelectSeverity, searchTerm }) {
  const [selectedFindingId, setSelectedFindingId] = useState(findings?.[0]?.finding_id || null);
  const [activeTab, setActiveTab] = useState('REMEDIATION');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState(null);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filtered = (findings || []).filter((item) => {
    const matchesSearch = 
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resource_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const effectiveSeverity = activeSeverity || 'ALL';
    const matchesSeverity = 
      effectiveSeverity === 'ALL' || item.severity?.toUpperCase() === effectiveSeverity.toUpperCase();
      
    const matchesService = 
      serviceFilter === 'ALL' || item.service?.toLowerCase() === serviceFilter.toLowerCase();
      
    return matchesSearch && matchesSeverity && matchesService;
  });

  const selectedFinding = 
    filtered.find(f => f.finding_id === selectedFindingId) || 
    filtered[0] || 
    null;

  const getSeverityPill = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return 'sev-pill-critical';
      case 'HIGH': return 'sev-pill-high';
      case 'MEDIUM': return 'sev-pill-medium';
      case 'LOW': return 'sev-pill-low';
      default: return 'sev-pill-info';
    }
  };

  return (
    <div className="soc-card" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Top Filter & Counter Bar */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11, 14, 23, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f8fafc' }}>
            Security Findings Explorer
          </span>
          <span className="mono" style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
            {filtered.length} of {findings?.length || 0} findings
          </span>
        </div>

        {/* Service Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {['ALL', 'SecurityHub', 'GuardDuty', 'Config'].map(svc => (
            <button
              key={svc}
              onClick={() => setServiceFilter(svc)}
              style={{
                background: serviceFilter === svc ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                color: serviceFilter === svc ? '#38bdf8' : 'var(--text-dim)',
                border: serviceFilter === svc ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {svc === 'ALL' ? 'All Services' : svc}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="triage-grid" style={{ minHeight: '620px' }}>
        
        {/* LEFT COLUMN: Findings Stream */}
        <div style={{
          borderRight: '1px solid var(--border-subtle)',
          maxHeight: '750px',
          overflowY: 'auto',
          background: 'rgba(10, 13, 20, 0.4)'
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              No security findings match the active filters.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedFinding?.finding_id === item.finding_id;
              return (
                <div
                  key={item.finding_id}
                  onClick={() => setSelectedFindingId(item.finding_id)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #0ea5e9' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span className={`sev-pill ${getSeverityPill(item.severity)}`}>
                      {item.severity}
                    </span>

                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      {item.service}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isSelected ? '#38bdf8' : '#f1f5f9', lineHeight: 1.35, marginBottom: '0.4rem' }}>
                    {item.title}
                  </div>

                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.resource_id}>
                    {item.resource_id}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Deep Inspection & Remediation Drawer */}
        {selectedFinding ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(15, 20, 34, 0.9)' }}>
            
            {/* Drawer Top Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className={`sev-pill ${getSeverityPill(selectedFinding.severity)}`}>
                  {selectedFinding.severity} SEVERITY
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>● STATUS: OPEN</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', lineHeight: 1.35, marginBottom: '0.5rem' }}>
                {selectedFinding.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Source:</span>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600' }}>{selectedFinding.service}</span>
                <span style={{ color: 'var(--border-muted)' }}>•</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Date:</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{new Date(selectedFinding.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Sub-Tabs: Remediation, Overview, Raw JSON */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
              {[
                { id: 'REMEDIATION', label: '🛠️ Remediation Plan' },
                { id: 'OVERVIEW', label: '🔍 Asset & Context' },
                { id: 'JSON', label: '📄 Payload JSON' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: activeTab === tab.id ? '700' : '500',
                    color: activeTab === tab.id ? '#38bdf8' : 'var(--text-dim)',
                    background: activeTab === tab.id ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #0ea5e9' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              
              {/* TAB 1: Remediation */}
              {activeTab === 'REMEDIATION' && (
                <div>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '1.1rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                      Prescribed AWS Fix
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                      {selectedFinding.remediation || "Follow AWS security guidance to restrict public access or enforce encryption."}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Affected AWS Resource
                    </div>
                    <div style={{
                      background: '#090c14',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8', wordBreak: 'break-all' }}>
                        {selectedFinding.resource_id}
                      </span>
                      <button
                        onClick={() => copyText(selectedFinding.resource_id, 'drawer-arn')}
                        className="soc-btn soc-btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem' }}
                      >
                        {copiedKey === 'drawer-arn' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Remediation Runbook CLI
                    </div>
                    <pre className="mono" style={{
                      background: '#06080e',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      fontSize: '0.72rem',
                      color: '#a78bfa',
                      overflowX: 'auto',
                      lineHeight: 1.6
                    }}>
{selectedFinding.service === 'Config' 
  ? `# Remediate via AWS CLI\naws configservice get-compliance-details-by-config-rule \\\n  --config-rule-name "${selectedFinding.title}"`
  : `# Audit resource permissions\naws s3api get-bucket-policy-status \\\n  --bucket "${selectedFinding.resource_id.replace('arn:aws:s3:::', '')}"`
}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 2: Overview & Context */}
              {activeTab === 'OVERVIEW' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Detection Narrative
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      {selectedFinding.description}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Finding ID</div>
                      <div className="mono" style={{ fontSize: '0.72rem', color: '#f1f5f9', wordBreak: 'break-all', marginTop: '0.2rem' }}>
                        {selectedFinding.finding_id}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>AWS Account</div>
                      <div className="mono" style={{ fontSize: '0.72rem', color: '#0ea5e9', fontWeight: '700', marginTop: '0.2rem' }}>
                        363577672790
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Raw JSON */}
              {activeTab === 'JSON' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => copyText(JSON.stringify(selectedFinding, null, 2), 'raw-json')}
                      className="soc-btn soc-btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                    >
                      {copiedKey === 'raw-json' ? '✓ Copied' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="mono" style={{
                    background: '#06080e',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.7rem',
                    color: '#38bdf8',
                    overflowX: 'auto',
                    maxHeight: '380px'
                  }}>
                    {JSON.stringify(selectedFinding, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Drawer Bottom Actions */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(11, 14, 23, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                CloudShield Telemetry Hub
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="soc-btn soc-btn-secondary"
                  onClick={() => copyText(selectedFinding.finding_id, 'id-copy')}
                  style={{ fontSize: '0.75rem' }}
                >
                  {copiedKey === 'id-copy' ? 'Copied ID' : 'Copy ID'}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Select a finding on the left to inspect
          </div>
        )}

      </div>

    </div>
  );
}

