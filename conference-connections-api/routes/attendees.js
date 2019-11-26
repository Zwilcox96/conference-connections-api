const express = require('express');
const router = express.Router();

const ctrlAttendee = require('../controllers/attendee');
router.get('/:badge', ctrlAttendee.viewAttendee);
router.post('/create', ctrlAttendee.createAttendee);

module.exports = router;
