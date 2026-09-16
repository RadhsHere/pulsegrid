import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BedCard } from './components/BedCard';
import { Activity, ShieldAlert } from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

export function App() {
  const [bedsData, setBedsData] = useState({});
  const [bedHistory, setBedHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Listen to real-time vital telemetry stream
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
    });

    // Listen to NEWS2 clinical alert events
    socket.on('vitals:alert', (alertData) => {
      setAlerts((prev) => [alertData, ...prev.slice(0, 9)]);
    });

    return () => socket.disconnect();
  }, []);

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

      {alerts.length > 0 && (
        <section className="alert-feed">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.75rem' }}>
            <ShieldAlert size={18} /> Active NEWS2 Clinical Alerts
          </h4>
          {alerts.map((item, idx) => (
            <div key={idx} className="alert-item">
              <strong>{item.bedId}</strong> — {item.alerts.map((a) => `${a.parameter}: ${a.message}`).join(' | ')}
            </div>
          ))}
        </section>
      )}

      <main className="bed-grid">
        {['BED-101', 'BED-102', 'BED-103', 'BED-104'].map((bedId) => (
          <BedCard
            key={bedId}
            bedId={bedId}
            currentVital={bedsData[bedId]}
            history={bedHistory[bedId] || []}
          />
        ))}
      </main>
    </div>
  );
}

export default App;