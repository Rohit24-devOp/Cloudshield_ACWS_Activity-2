import React, { useState } from 'react';

export default function FindingsTable({ findings, activeSeverity, onSelectSeverity, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = (findings || []).filter((item) => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resource_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const effectiveSeverity = activeSeverity || 'ALL';
    const matchesSeverity = 
      effectiveSeverity === 'ALL' || item.severity?.toUpperCase() === effectiveSeverity.toUpperCase();
      
    const matchesService = 
      serviceFilter === 'ALL' || item.service?.toLowerCase() === serviceFilter.toLowerCase();

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'CRITICAL_HIGH') {
      matchesTab = ['CRITICAL', 'HIGH'].includes(item.severity?.toUpperCase());
    } else if (activeTab === 'GUARDDUTY') {
      matchesTab = item.service?.toLowerCase() === 'guardduty';
    } else if (activeTab === 'SECURITYHUB') {
      matchesTab = item.service?.toLowerCase() === 'securityhub';
    } else if (activeTab === 'CONFIG') {
      matchesTab = item.service?.toLowerCase() === 'config';
    }
      
    return matchesSearch && matchesSeverity && matchesService && matchesTab;
  });

  const getSeverityBadgeClass = (sev) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      case 'LOW': return 'badge-low';
      default: return 'badge-low';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      
      {/* Top Header & Tab Navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Detected Misconfigurations & Security Findings
            </h2>
            <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>
              {filtered.length} Displayed
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Aggregated in DynamoDB & S3 Security Lake across AWS services
          </p>
        </div>

        {/* Tab Pills */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '0.25rem',
          borderRadius: '9px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CRITICAL_HIGH', label: 'Critical & High' },
            { id: 'SECURITYHUB', label: 'Security Hub' },
            { id: 'GUARDDUTY', label: 'GuardDuty' },
            { id: 'CONFIG', label: 'AWS Config' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: '7px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        padding: '0.85rem 1rem',
        background: 'rgba(11, 18, 33, 0.6)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '1.25rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--text-muted)" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search finding, resource ARN, or IAM identity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              padding: '0.55rem 1rem 0.55rem 2.35rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              transition: 'border 0.2s ease'
            }}
          />
        </div>

        {/* Severity Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Severity:</span>
          <select
            value={activeSeverity || 'ALL'}
            onChange={(e) => onSelectSeverity && onSelectSeverity(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f1f5f9',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Service Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Service:</span>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f1f5f9',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Services</option>
            <option value="SecurityHub">Security Hub</option>
            <option value="GuardDuty">GuardDuty</option>
            <option value="Config">AWS Config</option>
            <option value="CloudTrail">CloudTrail</option>
          </select>
        </div>

        {/* Reset & Refresh */}
        {(searchTerm || activeSeverity !== 'ALL' || serviceFilter !== 'ALL' || activeTab !== 'ALL') && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSearchTerm('');
              setServiceFilter('ALL');
              setActiveTab('ALL');
              onSelectSeverity && onSelectSeverity('ALL');
            }}
            style={{ fontSize: '0.75rem', color: '#f43f5e' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Cyber Table */}
      <div className="table-wrapper">
        <table className="cyber-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Severity</th>
              <th>Finding Title</th>
              <th style={{ width: '130px' }}>Service</th>
              <th>Affected Resource</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '120px' }}>Detected</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No security findings matched your current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isExpanded = expandedId === item.finding_id;
                return (
                  <React.Fragment key={item.finding_id}>
                    <tr 
                      className={isExpanded ? 'expanded' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedId(isExpanded ? null : item.finding_id)}
                    >
                      <td>
                        <span className={`badge ${getSeverityBadgeClass(item.severity)}`}>
                          <span className="badge-dot"></span>
                          {item.severity}
                        </span>
                      </td>

                      <td style={{ fontWeight: '600', color: '#f8fafc' }}>
                        {item.title}
                      </td>

                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontWeight: '600'
                        }}>
                          {item.service}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.resource_id}>
                        {item.resource_id}
                      </td>

                      <td>
                        <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                          <span className="badge-dot"></span> {item.status || 'OPEN'}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: isExpanded ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: isExpanded ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </td>
                    </tr>

                    {/* Smooth Collapsible Drawer */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" style={{ background: 'rgba(11, 18, 33, 0.95)', padding: '1.5rem', borderTop: 'none' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
                            
                            {/* Left: Description & Resource Info */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                  Finding Description
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Service: {item.service}</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6, background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                {item.description}
                              </p>

                              <div style={{ marginTop: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                    Affected Resource ARN
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(item.resource_id, `res-${item.finding_id}`)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: copiedId === `res-${item.finding_id}` ? '#10b981' : '#38bdf8',
                                      fontSize: '0.72rem',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem'
                                    }}
                                  >
                                    {copiedId === `res-${item.finding_id}` ? '✓ Copied!' : 'Copy ARN'}
                                  </button>
                                </div>
                                <code style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  background: 'rgba(2, 6, 23, 0.8)',
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: '6px',
                                  color: '#38bdf8',
                                  wordBreak: 'break-all',
                                  border: '1px solid rgba(56, 189, 248, 0.15)'
                                }}>
                                  {item.resource_id}
                                </code>
                              </div>
                            </div>

                            {/* Right: AWS Remediation Card */}
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
                              padding: '1.25rem',
                              borderRadius: '10px',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                  </svg>
                                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Recommended Remediation
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                                  {item.remediation || "Review AWS Security Hub best practices and restrict permissions."}
                                </p>
                              </div>

                              <div style={{
                                marginTop: '1rem',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  ID: {item.finding_id.slice(0, 20)}...
                                </span>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => copyToClipboard(JSON.stringify(item, null, 2), `json-${item.finding_id}`)}
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
                                >
                                  {copiedId === `json-${item.finding_id}` ? '✓ Copied JSON' : 'Copy JSON'}
                                </button>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
