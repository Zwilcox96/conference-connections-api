const express = require('express');
const router = express.Router();

const ctrlProfile = require('../controllers/profile');
router.get('/', ctrlProfile.profileRead);
router.post('/user-password-reset', ctrlProfile.passwordReset);

module.exports = router;
