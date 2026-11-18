import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import PostureScorecard from './components/PostureScorecard';
import ServicesStatus from './components/ServicesStatus';
import FindingsExplorer from './components/FindingsExplorer';
import ArchitectureView from './components/ArchitectureView';
import { fetchStats, fetchFindings, fetchServicesStatus, triggerManualScan } from './services/api';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [findings, setFindings] = useState([]);
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [activeSeverity, setActiveSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  const loadData = async () => {
    try {
      const [statsData, findingsData, servicesData] = await Promise.all([
        fetchStats(),
        fetchFindings(),
        fetchServicesStatus()
      ]);
      setStats(statsData);
      setFindings(findingsData.findings || []);
      setServices(servicesData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error("Failed to load CloudShield data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setScanMessage("Querying live AWS Config, GuardDuty & Security Hub via Lambda API...");
    try {
      const result = await triggerManualScan();
      setScanMessage(`Scan complete: ${result.findings_discovered || 0} findings recorded into DynamoDB.`);
      await loadData();
      setTimeout(() => setScanMessage(null), 5000);
    } catch (err) {
      setScanMessage(`Scan error: ${err.message}`);
      setTimeout(() => setScanMessage(null), 5000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = () => {
    const reportData = {
      export_timestamp: new Date().toISOString(),
      account_id: "363577672790",
      region: "us-east-1",
      stats: stats,
      total_findings: findings.length,
      findings: findings
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudshield-security-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="soc-layout">
      {/* 1. Left Enterprise Sidebar Navigation */}
      <Sidebar 
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        stats={stats}
        isScanning={isScanning}
      />

      {/* 2. Main Workspace */}
      <div className="soc-main">
        {/* Top Header */}
        <TopHeader 
          onTriggerScan={handleScan}
          isScanning={isScanning}
          onExport={handleExport}
          onRefresh={loadData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Laser Scanner Progress Bar */}
        {isScanning && (
          <div style={{ position: 'relative', height: '2px', background: 'rgba(14, 165, 233, 0.2)', overflow: 'hidden' }}>
            <div className="scanner-bar"></div>
          </div>
        )}

        {/* Content Area */}
        <main className="soc-content">
          
          {/* Notification Toast */}
          {scanMessage && (
            <div style={{
              background: 'linear-gradient(90deg, #0284c7 0%, #1e40af 100%)',
              color: 'white',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span>⚡</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{scanMessage}</span>
              </div>
              <button
                onClick={() => setScanMessage(null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* VIEW: Architecture Pipeline */}
          {activeNav === 'pipeline' && (
            <ArchitectureView />
          )}

          {/* VIEW: Compliance Posture View */}
          {activeNav === 'compliance' && (
            <div>
              <PostureScorecard 
                stats={stats}
                activeSeverity={activeSeverity}
                onSelectSeverity={setActiveSeverity}
              />
              <ServicesStatus services={services} />
            </div>
          )}

          {/* VIEW: Default Overview & Findings */}
          {(activeNav === 'dashboard' || activeNav === 'findings' || activeNav === 'assets') && (
            <div>
              {/* Only show top scorecard on dashboard/overview tab */}
              {activeNav === 'dashboard' && (
                <>
                  <PostureScorecard 
                    stats={stats}
                    activeSeverity={activeSeverity}
                    onSelectSeverity={setActiveSeverity}
                  />
                  <ServicesStatus services={services} />
                </>
              )}

              {/* Enterprise Split-Pane Findings Explorer */}
              <FindingsExplorer 
                findings={findings}
                activeSeverity={activeSeverity}
                onSelectSeverity={setActiveSeverity}
                searchTerm={searchTerm}
              />
            </div>
          )}

        </main>

        {/* SOC Bottom Status Footer */}
        <footer style={{
          padding: '0.85rem 1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(8, 10, 15, 0.9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-dim)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>CloudShield CSPM Platform</span>
            <span>•</span>
            <span className="mono">Account: 363577672790</span>
            <span>•</span>
            <span>Region: us-east-1</span>
          </div>
          <div>
            Data Lake: <span className="mono" style={{ color: '#0ea5e9' }}>DynamoDB + S3</span> | Query Engine: <span className="mono" style={{ color: '#a78bfa' }}>Athena</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
