const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Profile = require('../../models/Profile.js');
const User = require('../../models/User.js');

// @route   GET api/profile/test
// @desc    Tests profile routes
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"}));

// @route   GET api/profile
// @desc    Display current users profile
// @access  Private
router.get('/', passport.authenticate('jwt', {session:false}), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate('user', 'name')
    .then(profile => {
      if(!profile){
        errors.noprofile = "There is no profile for this user"
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', 'name')
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by handle
// @access  Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', 'name')
    .then(profile => {
      if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => {
      errors.noprofile = 'There is no profile for this user';
      res.status(404).json(errors)
    });
});

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', 'name')
    .then(profiles => {
      if(!profiles) {
        errors.noprofile = 'No profiles found'
        return res.status(404).json(errors)
      }
      res.json(profiles);
    })
    .catch(err => {
      errors.noprofile = 'No profiles found'
      res.status(404).json(errors)
    })
});

// @route   POST api/profile
// @desc    Create or edit profile for current user
// @access  Private
router.post('/', passport.authenticate('jwt', {session:false}), (req, res) => {
  const errors = {};

  //Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.birthdate) profileFields.birthdate = req.body.birthdate;
  if(req.body.location) profileFields.location = req.body.location;
  //publicsocial - an object cannot be assigned directly to a value
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if(profile) {
        //Update profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile))
         .catch(err => res.status(404).json(err));
      }
      else {
        //Create profile

        //check if handle exists
        Profile.findOne({ handle: profileFields.handle })
          .then(profile => {
            if(profile){
              errors.handle = 'This handle already exists';
              return res.status(400).json(errors);
            }
          })

        new Profile(profileFields).save()
          .then(profile => {
            res.json(profile);
          })
      }
    })

});

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};

  const expFields = {};
  if(req.body.title) expFields.title = req.body.title;
  if(req.body.company) expFields.company = req.body.company;
  if(req.body.location) expFields.location = req.body.location;
  if(req.body.from) expFields.from = req.body.from;
  if(req.body.to) expFields.to = req.body.to;
  if(req.body.current) expFields.current = req.body.current;
  if(req.body.description) expFields.description = req.body.description;


  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if(profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $push: { "work": expFields} },
          { new: true })
          .then(profile => res.json(profile))
          .catch(err => res.status(404).json(err));
      }
      else {
        errors.noprofile = "Please create user profile first";
        res.status(400).json(errors);
      }
    });
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //find the index of work from url
      const removeIndex = profile.work
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //remove the object at this index from work array
      profile.work.splice(removeIndex, 1);

      //save update profile
      profile.save().then(profile => res.json(profile))
        .catch(err => { res.status(404).json(err) });

    });
});

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};

  const eduFields = {};
  if(req.body.degree) eduFields.degree = req.body.degree;
  if(req.body.school) eduFields.school = req.body.school;
  if(req.body.location) eduFields.location = req.body.location;
  if(req.body.from) eduFields.from = req.body.from;
  if(req.body.to) eduFields.to = req.body.to;
  if(req.body.current) eduFields.current = req.body.current;
  if(req.body.description) eduFields.description = req.body.description;


  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if(profile) {
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $push: { "education": eduFields} },
          { new: true })
          .then(profile => res.json(profile))
          .catch(err => res.status(404).json(err));
      }
      else {
        errors.noprofile = "Please create user profile first";
        res.status(400).json(errors);
      }
    });
});

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //find the index of work from url
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //remove the object at this index from work array
      profile.education.splice(removeIndex, 1);

      //save update profile
      profile.save().then(profile => res.json(profile))
        .catch(err => { res.status(404).json(err) });

    });
});

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};

  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => { res.json({ success: true }) })
    .catch(err => { res.status(404).json(err) });
});

module.exports = router;
