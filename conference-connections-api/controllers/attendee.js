const mongoose = require('mongoose');
const Attendee = mongoose.model('Attendee');
const utility = require('./utilities');
mongoose.Promise = global.Promise;

module.exports.createAttendee = function (req, res) {
    let attendee = populateAttendeeDocument(req);
    attendee.save()
        //Check for errors since apparently mongoose can't be bothered to do it
        .then((error) => {if(!error) {res.status(204).send()}})
        .catch((error) => utility.processMongooseSaveError(error, res));
};

module.exports.viewAttendee = function (req, res) {
    let query = Attendee.findOne({badge: req.params.badge});
    query.exec()
        .then(attendee => res.status(200).json(attendee.toJSON()))
        .catch((error) => utility.processMongooseSaveError(error, res))
};

function populateAttendeeDocument(req){
    let attendee = new Attendee();
    attendee.name = req.body.name;
    attendee.email = req.body.email;
    attendee.phone = req.body.phone;
    attendee.contactPreferenceEmail = req.body.contactPreferenceEmail;
    attendee.badge = req.body.badge;
    attendee.age = req.body.age;
    attendee.genderSeeking = req.body.genderSeeking;
    if(req.body.gender){
        attendee.gender = req.body.gender;
    }
    return attendee
}
