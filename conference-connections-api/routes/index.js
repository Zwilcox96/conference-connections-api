const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

const ctrlProfile = require('../controllers/profile');
const ctrlAuth = require('../controllers/authentication');

// profile
router.get('/profile', auth, ctrlProfile.profileRead);
router.post('/user-password-reset', auth, ctrlProfile.passwordReset);

// authentication
router.post('/register', auth, ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/update-password', auth, ctrlAuth.resetPassword);

module.exports = router;
