const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('./keys.js');

const options = {};
//extract the token from the request to server
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
//JwtStrategy takens in options with the specific key name 'secretOrKey'
options.secretOrKey = keys.secretOrKey;

//passport that was passed in server.js, is being taken as argument
module.exports = (passport) => {
  //create new JwtStrategy using the token and secret
  passport.use(
    new JwtStrategy(options, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if(user){
            //we return done() because this is a backend function that will
            //be called by passport.authenticate in the front end
            return done(null, user);
          }
          //else
          return done(null, false);
        })
        .catch(err => console.log(err));
  }));
};
