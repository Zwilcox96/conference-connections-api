const mongoose = require('mongoose');
const auth = require('./authentication');
const User = mongoose.model('User');

module.exports.profileRead = function(req, res) {
  res.status(200).json({
    "name": req.user.name,
    "roles": req.user.roles,
    "email": req.user.email
  });
};

module.exports.passwordReset = function (req, res) {
  auth.resetPassword(req.user, req, res);
};
