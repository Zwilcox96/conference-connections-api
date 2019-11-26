const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

const ctrlAuth = require('../controllers/authentication');

// authentication
router.post('/register', auth, ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/update-password', auth, ctrlAuth.resetPasswordExt);

module.exports = router;
