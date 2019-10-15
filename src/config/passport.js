const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
var Users = require('../models/Users');

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true 

}, function (req, email, password, done) {  
    Users.findOne({'email': email}, function(err, user){
      
      if (err) {
        return done(null, false, req.flash('error', err))
      }
      if (!user) {
        return done(null, false, req.flash('error', 'Email no encontrado'))
      }
      if (!user.validPassword(password)) {
       return done(null, false, req.flash('error', 'Password no encontrado'))
      }
      //console.log(user.role)
      return done(null, user);

    })

}))


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

