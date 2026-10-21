/**
 * Calculates NEWS2 sub-scores for incoming patient vitals.
 */
export function calculateNEWS2(vitals) {
  if (!vitals) return { score: 0, alerts: [] };

  const { heartRate, spO2, temperature } = vitals;
  let score = 0;
  const alerts = [];

  // Heart Rate Scoring
  if (heartRate <= 40 || heartRate >= 131) {
    score += 3;
    alerts.push({ parameter: 'Heart Rate', message: `Critical HR: ${heartRate} bpm` });
  } else if (heartRate >= 111 && heartRate <= 130) {
    score += 2;
    alerts.push({ parameter: 'Heart Rate', message: `Elevated HR: ${heartRate} bpm` });
  } else if ((heartRate >= 41 && heartRate <= 50) || (heartRate >= 91 && heartRate <= 110)) {
    score += 1;
  }

  // SpO2 Scoring
  if (spO2 <= 91) {
    score += 3;
    alerts.push({ parameter: 'SpO2', message: `Critically Low SpO2: ${spO2}%` });
  } else if (spO2 >= 92 && spO2 <= 93) {
    score += 2;
    alerts.push({ parameter: 'SpO2', message: `Low SpO2: ${spO2}%` });
  } else if (spO2 >= 94 && spO2 <= 95) {
    score += 1;
  }

  // Temperature Scoring
  if (temperature <= 35.0) {
    score += 3;
    alerts.push({ parameter: 'Temperature', message: `Hypothermia: ${temperature}°C` });
  } else if (temperature >= 39.1) {
    score += 2;
    alerts.push({ parameter: 'Temperature', message: `High Fever: ${temperature}°C` });
  } else if ((temperature >= 35.1 && temperature <= 36.0) || (temperature >= 38.1 && temperature <= 39.0)) {
    score += 1;
  }

  return { score, alerts };
}