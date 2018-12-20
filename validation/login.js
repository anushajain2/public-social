const Validator = require('validator');
const isEmpty = require('./is_empty.js');

module.exports = function validateLoginInput(data) {
  let errors = {};

  //validator expects string everytime, so we need to convert undefined to string
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if(!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid"
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  }
}
