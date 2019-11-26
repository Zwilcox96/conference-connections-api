const mongoose = require("mongoose");
const libphonenumber = require('google-libphonenumber');
const phoneNumberFormat = libphonenumber.PhoneNumberFormat;
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

let attendeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    contactPreferenceEmail: {
        type: Boolean,
        required: true
    },
    badge: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        min: 18,
        required: true
    },
    gender: String,
    genderSeeking: {
        type: String,
        required: true
    },
    sessions: [String]
});

attendeeSchema.virtual('contactPreferencePhone').get(function() {
    return !this.contactPreferenceEmail;
});

attendeeSchema.virtual('formattedPhoneNumber').get(function() {
    let number = phoneUtil.parseAndKeepRawInput(this.phone, 'US');
    return phoneUtil.format(number, phoneNumberFormat.E164)
});

attendeeSchema.methods.toJSON = function() {
    let obj = this.toObject();
    delete obj.__v;
    delete obj._id;
    return obj
};

mongoose.model('Attendee', attendeeSchema);
