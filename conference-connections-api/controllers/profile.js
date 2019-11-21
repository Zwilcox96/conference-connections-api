const mongoose = require('mongoose');
const auth = require('./authentication');
const User = mongoose.model('User');

module.exports.profileRead = function(req, res) {

  if (!req.payload._id || req.payload.exp < Date.now() / 1000) {
    res.status(403).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        res.status(200).json({
          "name": user.name,
          "roles": user.roles,
          "email": user.email
        });
      });
  }

};

module.exports.passwordReset = function (req, res) {
  if (!req.payload._id || req.payload.exp < Date.now() / 1000) {
    res.status(403).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
  User
      .findById(req.payload._id)
      .exec(function(err, user) {
         auth.resetPassword(user, req, res);
        });
  }
};
