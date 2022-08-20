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
       // console.log(profile);

        let userData = {
                        
                id: profile.id,
                displayName : profile.displayName,
                Email: profile._json.email,
                Phone: "",
                
            } 
        //find if a user exisst with this email or not
        userHelper.googleAccount(userData).then((data) => {
            console.log("googleAc",data);
            return done(null, data)
        }).catch((err) =>{
            console.log(err);
        })
    }
    )),
    passport.serializeUser(function(user, done) {
        //console.log("seri",user);
        done(null, user);
      });
      
      passport.deserializeUser(function(user, done) {
        userHelper.googleUserId(user._id).then((user1) => {
            done(null,user);
        })
      });
}