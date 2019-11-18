const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports.register = async function (req, res) {
  await User
      .findById(req.payload._id).lean()
      .exec(function (err, requestor) {
        if(err){
          console.warn(err);
          res.status(500).json({
            "message": "Database error. Please contact your system adminisitrator"
          })
        }else if (!requestor.roles.includes('admin')) {
          res.status(403).json({
            "message": "UnauthorizedError: You do not have permissions to create users"
          });
        } else {
          let user = createNewUser(req);
          user.save(function (error) {
              if (error) {
                  console.log(error);
                  if(error.code === 11000){
                      res.status(409).json({
                          "message": "This user already exists"
                      })
                  } else {
                      res.status(500).json({
                          "message": "Unable to create user"
                      })
                  }
              } else {
                  createAndSendToken(user, res);
              }
          });
        }
      });
};

function createNewUser(req){
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

  // if(!req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }

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
