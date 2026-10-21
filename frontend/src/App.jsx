import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BedCard } from './components/BedCard';
import { Activity, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { calculateNEWS2 } from './utils/news2';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function App() {
  const [bedsData, setBedsData] = useState({});
  const [bedHistory, setBedHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Stream live vitals and evaluate NEWS2 scoring
    socket.on('vitals:stream', (telemetry) => {
      const { bedId } = telemetry;

      setBedsData((prev) => ({
        ...prev,
        [bedId]: telemetry,
      }));

      setBedHistory((prev) => ({
        ...prev,
        [bedId]: [...(prev[bedId] || []).slice(-30), telemetry],
      }));

      // Evaluate NEWS2 clinical risk
      const { score, alerts: newAlerts } = calculateNEWS2(telemetry);
      if (score >= 2 && newAlerts.length > 0) {
        setAlerts((prev) => {
          const exists = prev.some((a) => a.bedId === bedId && a.timestamp === telemetry.timestamp);
          if (exists) return prev;
          return [{ bedId, score, alerts: newAlerts, timestamp: telemetry.timestamp }, ...prev.slice(0, 8)];
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  const acknowledgeAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <header className="dashboard-header">
        <div className="dashboard-title">
          <Activity size={28} /> PulseGrid ICU Telemetry Dashboard
        </div>
        <div className="status-badge">
          <span className="status-dot" style={{ backgroundColor: connected ? '#34d399' : '#ef4444' }}></span>
          {connected ? 'Live Backend Connected' : 'Disconnected'}
        </div>
      </header>

      {/* Real-Time Active Clinical Alerts Feed */}
      {alerts.length > 0 && (
        <section className="alert-feed">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.75rem' }}>
            <ShieldAlert size={18} /> Active NEWS2 Clinical Alerts ({alerts.length})
          </h4>
          {alerts.map((item, idx) => (
            <div key={idx} className="alert-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.bedId}</strong> (NEWS2 Score: {item.score}) —{' '}
                {item.alerts.map((a) => `${a.parameter}: ${a.message}`).join(' | ')}
              </div>
              <button
                onClick={() => acknowledgeAlert(idx)}
                style={{
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem'
                }}
              >
                <CheckCircle size={14} /> Acknowledge
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Beds Grid */}
      <main className="bed-grid">
        {['BED-101', 'BED-102', 'BED-103', 'BED-104'].map((bedId) => (
          <div key={bedId} onClick={() => setSelectedBed(bedId)} style={{ cursor: 'pointer' }}>
            <BedCard
              bedId={bedId}
              currentVital={bedsData[bedId]}
              history={bedHistory[bedId] || []}
            />
          </div>
        ))}
      </main>

      {/* Detail History Modal */}
      {selectedBed && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedBed(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1rem', color: '#38bdf8' }}>{selectedBed} — Detailed Telemetry Log</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
              Showing latest streamed data points for bed analysis:
            </p>
            <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
              {(bedHistory[selectedBed] || []).slice().reverse().map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #334155', fontSize: '0.85rem' }}>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span>HR: <strong style={{ color: '#f87171' }}>{log.heartRate} bpm</strong></span>
                  <span>SpO2: <strong style={{ color: '#38bdf8' }}>{log.spO2}%</strong></span>
                  <span>Temp: <strong style={{ color: '#fbbf24' }}>{log.temperature}°C</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;