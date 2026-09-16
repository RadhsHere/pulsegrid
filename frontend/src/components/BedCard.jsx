import React from 'react';
import { Activity, Heart, Thermometer } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export const BedCard = ({ bedId, currentVital, history = [] }) => {
  const isCritical = currentVital?.spO2 < 92 || currentVital?.heartRate > 130 || currentVital?.heartRate < 40;

  return (
    <div className={`bed-card ${isCritical ? 'has-alert' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{bedId}</h3>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {currentVital ? new Date(currentVital.timestamp).toLocaleTimeString() : 'Waiting...'}
        </span>
      </div>

      <div className="vital-metric">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={18} color="#ef4444" />
          <span>Heart Rate</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f87171' }}>
          {currentVital ? `${currentVital.heartRate} bpm` : '--'}
        </span>
      </div>

      <div className="vital-metric">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#38bdf8" />
          <span>SpO2</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#38bdf8' }}>
          {currentVital ? `${currentVital.spO2}%` : '--'}
        </span>
      </div>

      <div className="vital-metric">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Thermometer size={18} color="#fbbf24" />
          <span>Temperature</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#fbbf24' }}>
          {currentVital ? `${currentVital.temperature}°C` : '--'}
        </span>
      </div>

      <div style={{ height: '60px', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.slice(-15)}>
            <Line type="monotone" dataKey="heartRate" stroke="#f87171" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="spO2" stroke="#38bdf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};