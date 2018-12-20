const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User.js');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys.js');
const passport = require('passport');
const validateRegisterInput = require('../../validation/register.js');
const validateLoginInput = require('../../validation/login.js');

// @route   GET api/users/test
// @desc    Tests users routes
// @access  Public
router.get('/test', (req, res) => res.json({msg: "User Works"}));

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  //check if inputs are valid
  const { errors, isValid } = validateRegisterInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }

  //Use mongoose to find if email already exists
  User.findOne({ email: req.body.email })
    .then(user => {
      if(user) {
        errors.email = 'Email already exists'
        return res.status(400).json(errors);
      }
      else {
        //if user doesn't exist, create new user
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });

        //use bcrypt to hash the password and store the hash in DB
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          })
        })
      }
    })
});

// @route   POST api/users/login
// @desc    Login user / returning JWT token
// @access  Public
router.post('/login', (req, res) => {
  //check if inputs are valid
  const { errors, isValid } = validateLoginInput(req.body);

  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //find user by Email
  User.findOne({ email })
    .then(user => {
      //check for user
      if(!user){
        errors.email = 'User not found'
        return res.status(400).json(errors);
      }

      //check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if(isMatch){
            //User matched in record, generate user token

            // create payload to pass user information via jwt token
            const payload = {
              id: user.id,
              name: user.name,
            }
            // Sign token, expiresin no.of seconds
            jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  //defining a type of token
                  token: 'Bearer ' + token
                });
            });
          }
          else {
            //user password's didn't match
            errors.password = 'Password incoorect'
            return res.status(400).json(errors);
          }
        });

    });
});

// @route   GET api/users/current
// @desc    Returns the current user, whom the token belongs to
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;
