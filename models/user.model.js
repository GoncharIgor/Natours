// Fat models, thin controllers philosophy

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please indicate your name'],
  },
  email: {
    type: String,
    required: [true, 'Please indicate your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Incorrect format of email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please indicate your password'],
    minLength: 8,
    select: false, // to hide field from response
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on .save() or .create()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12); // 12 - measure how CP intensive operation will be. Higher - better encryption
  this.passwordConfirm = undefined; // field will be not added to DB
  next();
});

// instance method - available further in all Document objects
userSchema.methods.correctPassword = async function (
  providedPassword,
  passwordInDB
) {
  return bcrypt.compare(providedPassword, passwordInDB); // returns Promise
};

const User = mongoose.model('User', userSchema);

module.exports = User;
