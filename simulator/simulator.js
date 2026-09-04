const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

const BEDS = ['BED-101', 'BED-102', 'BED-103'];

client.on('connect', () => {
  console.log('[Simulator] Connected to MQTT Broker. Streaming vitals...');

  setInterval(() => {
    BEDS.forEach((bedId) => {
      const payload = {
        bedId,
        heartRate: Math.floor(70 + Math.random() * 15),
        spO2: Math.floor(95 + Math.random() * 4),
        temperature: parseFloat((36.5 + Math.random() * 0.8).toFixed(1)),
        timestamp: new Date().toISOString(),
      };

      client.publish(`icu/bed/${bedId}/vitals`, JSON.stringify(payload));
    });
  }, 1000);
});