const mongoose = require('mongoose');
const Attendee = mongoose.model('Attendee');
const utility = require('./utilities');
const csv = require('fast-csv');
const Readable = require('stream').Readable;
mongoose.Promise = global.Promise;

module.exports.createAttendee = function (req, res) {
    let attendee = populateAttendeeDocument(req.body);
    attendee.save()
        //Check for errors since apparently mongoose can't be bothered to do it
        .then((response) => {if(response) {res.status(204).send()} else {res.status(500).json({"message": 'Internal error'})}})
        .catch((error) => utility.processMongooseSaveError(error, res));
};

module.exports.viewAttendee = function (req, res) {
    let query = Attendee.findOne({badge: req.params.badge});
    query.exec()
        .then(attendee => {if(attendee) {res.status(200).json(attendee.toJSON())} else {res.status(404).json({"message": 'Document does not exist'})}})
        .catch((error) => utility.processMongooseFindError(error, res))
};

module.exports.viewAllAttendees = function (req, res) {
    let query = Attendee.find({});
    query.exec()
        .then((docs) => sendResultsList(docs, req, res))
        .catch()
};

module.exports.csvUpload = async function (req, res) {
    let errors = [];
    let promises = [];
    if(!req.files || !req.files.csv.data){
        res.status(400).json({"message": "You must submit a csv file"})
    } else {
       let attendeeData = convertBufferToReadable(req.files.csv.data);
        csv.parseStream(attendeeData, {headers: [undefined, undefined, 'name', 'email', 'phone', 'contactPreferenceEmail', 'badge', 'age', 'gender', 'genderSeeking'], renameHeaders: true})
            .on('error', error => {console.error(error); errors.push(error)})
            .on('data', data => {data.contactPreferenceEmail = data.contactPreferenceEmail === 'Email';
                                            promises.push(createAttendee(errors, data))})
            .on('end', rowCount => sendResponse(promises, rowCount, errors, res));
    }
};

function convertBufferToReadable(buffer){
    let readableDataStream = new Readable();
    readableDataStream.push(buffer);
    readableDataStream.push(null);
    return readableDataStream;
}

function sendResponse(promises, rowCount, errors, res){
    console.log(`Parsed ${rowCount} rows`);
    Promise.all(promises).then( response => {
        let created = rowCount - errors.length;
        if(created === 0){
            res.status(400).json({ 'created': created,"message": `There were errors saving ${errors.length} attendees`, "errors": errors});
        } else if (errors.length > 0) {
            res.status(200).json({ 'created': created,"message": `There were errors saving ${errors.length} attendees`, "errors": errors});
        } else {
            res.status(204).send();
        }})
        .catch(error => res.status(500).json({"message": 'Internal error', 'error': error}))
}

function createAttendee(errors, data) {
    return populateAttendeeDocument(data).save()
        .then((user) => {if(user) {/*errors.push(error)*/}})
        //todo: Make custom error message.
        .catch(error => {errors.push(error); console.log(error)})
}

function sendResultsList(docs, req, res) {
    if(!docs){
        res.status(404).json({ "message": "No records found"})
    } else {
        res.status(200).json(createReturnList(docs))
    }
}

function createReturnList(docs){
    let result = { results: []};
    docs.forEach(doc => result.results.push(doc.toJSON()));
    return result
}

function populateAttendeeDocument(data){
    let attendee = new Attendee();
    attendee.name = data.name;
    attendee.email = data.email;
    attendee.phone = data.phone;
    attendee.contactPreferenceEmail = data.contactPreferenceEmail;
    attendee.badge = data.badge;
    attendee.age = data.age;
    attendee.genderSeeking = data.genderSeeking;
    if(data.gender){
        attendee.gender = data.gender;
    }
    return attendee
}
