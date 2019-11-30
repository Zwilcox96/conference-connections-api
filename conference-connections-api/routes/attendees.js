const express = require('express');
const router = express.Router();

const ctrlAttendee = require('../controllers/attendee');
router.get('/:badge', ctrlAttendee.viewAttendee);
router.get('/', ctrlAttendee.viewAllAttendees);
router.post('/create', ctrlAttendee.createAttendee);
router.post('/upload', ctrlAttendee.csvUpload);

module.exports = router;
