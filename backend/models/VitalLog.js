const mongoose = require('mongoose');

const vitalLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    bedId: { type: String, required: true },
    heartRate: { type: Number, required: true },
    spO2: { type: Number, required: true },
    temperature: { type: Number, required: true },
  },
  {
    // Native MongoDB Time-Series setup
    timeseries: {
      timeField: 'timestamp',
      metaField: 'bedId',
      granularity: 'seconds',
    },
  }
);

module.exports = mongoose.model('VitalLog', vitalLogSchema);