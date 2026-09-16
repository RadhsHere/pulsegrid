// Evaluates incoming telemetry against clinical thresholds
const evaluateVitals = (telemetry) => {
  const { bedId, heartRate, spO2, temperature } = telemetry;
  const alerts = [];

  // SpO2 Thresholds
  if (spO2 < 92) {
    alerts.push({
      severity: 'CRITICAL',
      parameter: 'SpO2',
      value: `${spO2}%`,
      message: 'Severe Hypoxia detected!',
    });
  } else if (spO2 < 95) {
    alerts.push({
      severity: 'WARNING',
      parameter: 'SpO2',
      value: `${spO2}%`,
      message: 'Low oxygen saturation level.',
    });
  }

  // Heart Rate Thresholds
  if (heartRate > 130 || heartRate < 40) {
    alerts.push({
      severity: 'CRITICAL',
      parameter: 'Heart Rate',
      value: `${heartRate} bpm`,
      message: 'Critical heart rate instability!',
    });
  } else if (heartRate > 100) {
    alerts.push({
      severity: 'WARNING',
      parameter: 'Heart Rate',
      value: `${heartRate} bpm`,
      message: 'Elevated heart rate (Tachycardia).',
    });
  }

  // Temperature Thresholds
  if (temperature > 38.5) {
    alerts.push({
      severity: 'WARNING',
      parameter: 'Temperature',
      value: `${temperature}°C`,
      message: 'High fever detected.',
    });
  }

  if (alerts.length > 0) {
    return {
      bedId,
      timestamp: new Date().toISOString(),
      alerts,
    };
  }

  return null;
};

module.exports = { evaluateVitals };