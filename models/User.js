const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {isEmail} = require('validator');

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be 2 or more characters'],
    maxlength: [19, 'Name must be under 20 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Email is required'],
  },
}, {
  timestamps: true,
});

// Compile model from schema
module.exports = mongoose.model('User', UserSchema );
