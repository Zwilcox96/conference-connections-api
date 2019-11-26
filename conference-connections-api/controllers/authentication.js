const passport = require('passport');
const mongoose = require('mongoose');
const utility = require('./utilities');
const User = mongoose.model('User');

module.exports.executeIfRolesAllow = function (req, res, role, callback){
    let query = User.findById(req.payload._id);
    query.exec()
        .then(function (requester) {
            if (!requester.roles.includes(role)) {
                res.status(403).json({
                    "message": "UnauthorizedError: You do not have permissions to create users"
                });
            } else {
                callback(req, res)
            }
        })
        .catch(error => processUserFindError(error, res));
};

function processUserFindError(error, res){
    console.warn(error);
    res.status(500).json({
        "message": "Database error. Please contact your system administrator"
    })
}

module.exports.register = function (req, res) {
    try {
        module.exports.executeIfRolesAllow(req, res, 'admin', processNewUserCreation);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            "message": "Unknown error. Please contact your system administrator",
            "error": err
        })
    }
};

function processNewUserCreation(req, res){
    let user = populateUserDocument(req);
    user.save()
        .then(user => createAndSendToken(user, res))
        .catch(error => utility.processMongooseSaveError(error, res))
}



module.exports.resetPasswordExt = function(req, res){
    module.exports.executeIfRolesAllow(req, res, 'admin', processPasswordReset);

};

function processPasswordReset(req, res){
    User.findOne({email: req.body.email}, function(error, user){
        if(error){
            console.warn(error);
            res.status(404).json({
                "message": "Could not find user"
            });
        } else {
            module.exports.resetPassword(user, req, res);
        }
    })
}

module.exports.resetPassword = function(user, req, res){
    let fakeUser = new User();
    fakeUser.setPassword(req.body.password);
    user.salt = fakeUser.salt;
    user.hash = fakeUser.hash;
    user.save()
        .then(res.status(204).send())
        .catch(error => utility.processMongooseSaveError(error, res));
};

function populateUserDocument(req){
    let user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.roles = req.body.roles;
    user.setPassword(req.body.password);
    return user;
}

function createAndSendToken(user, res){
    let token;
    token = user.generateJwt();
    res.status(200);
    res.json({
        "token": token
    });
}
module.exports.login = function(req, res) {

  passport.authenticate('local', function(err, user, info){

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      createAndSendToken(user, res);
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};
