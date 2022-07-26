const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Passport } = require('passport');
const userHelper = require("./userHelpers");
const clientId = require("../config/googleData").clientId;
const clientSecreT = require("../config/googleData").clientSecret;

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: clientId,
        clientSecret: clientSecreT,
        callbackURL: "http://localhost:3000/google/callback"
    },
    (AccessToken,refreshToken,profile,done) => {
        console.log(profile);

        //find if a user exisst with this email or not
        userHelper.googleAccount(profile).then((data) => {
            console.log("googleAc",data);
            return done(null, data)
        })
    }
    )),
    passport.serializeUser(function(user, done) {
        console.log("seri",user);
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        userHelper.googleUserId(user._id).then((user) => {
            done(null,user);
        })
      });
}