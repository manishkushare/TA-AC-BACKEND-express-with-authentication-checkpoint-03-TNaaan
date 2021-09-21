var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var User = require('../models/User');

passport.use(new GitHubStrategy(
{
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    var email = profile._json.email
    var profileData = {
        email : email,
        providers : [profile.provider],
        github : {
            name : profile._json.name,
            login: profile._json.login,
            location : profile._json.location
        }
    }
    try {
        var user = await User.findOne({email});
        if(user){
            console.log('if');  
            return cb(null,user);
        } else {
            console.log('else')
            var addedUser = await User.create(profileData);
            return cb(null,addedUser);
        }
    
    } catch (error) {
        console.log(error);
        return cb(error);
    }
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    var email = profile._json.email;
    var profileData = {
        email : email,
        providers : [profile.provider],
        google : {
            name : profile._json.name
        }
    }
    try {
        var user = await User.findOne({email});
        if(user){
            return cb(null,user);
        } else {
            var addedUser = await User.create(profileData);
            return cb(null,addedUser);
        }
    
    } catch (error) {
        return cb(error);
    }
        
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser( async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null,user);
    } catch (error) {
        done(error);    
    }
});  