const Validator = require('validator');
const isEmpty = require('./is_empty.js');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  //validator expects string everytime, so we need to convert undefined to string
  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  if(!Validator.isLength(data.name, { min: 2, max: 40})){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if(!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords should match";
  }

  if(!Validator.isLength(data.password, {min: 8, max: 30})){
    errors.password = "Password must be between 8 and 30 characters"
  }
  
  if(Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if(Validator.isEmpty(data.password2)) {
    errors.password2 = "Password confirmation field is required";
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  }
}
