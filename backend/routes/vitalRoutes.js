const express = require('express');
const router = express.Router();
const VitalLog = require('../models/VitalLog');

// GET /api/vitals/:bedId - Fetch recent vital history for a specific bed
router.get('/:bedId', async (req, res) => {
  try {
    const { bedId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const history = await VitalLog.find({ bedId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve historical vital logs.',
      details: err.message,
    });
  }
});

module.exports = router;