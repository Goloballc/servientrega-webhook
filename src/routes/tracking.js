const express = require('express');
const router = express.Router();
const { handleTracking, handleTrackingHistory } = require('../handlers/trackingHandler');

router.post('/', handleTracking);
router.post('/history', handleTrackingHistory);

module.exports = router;
