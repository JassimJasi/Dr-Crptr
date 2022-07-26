const { response } = require('express');
var express = require('express');
var router = express.Router();

const userHelper = require('../helpers/userHelpers');
const verify = require('../helpers/verify')
const passport = require('passport')
require ('../helpers/googleAuth')(passport);

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;
  console.log("final",user);
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('user/userHome', { admin: false, user });
});

//userSignup page
router.get('/userSignup', (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/userSignup', {layout:'loginLayout'})
  }
});
router.post('/userSignup', (req, res) => {
  req.session.userBody = req.body;
  verify.getOTP(req.body.Phone).then((response) => {
    res.redirect('/otp')
  });
});
router.get('/otp', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('user/userSignupotp', { "verifyErr": req.session.verifyErr, layout:'loginLayout' })
  req.session.verifyErr = false;

});
router.post('/otp', (req, res) => {
  let userData = req.session.userBody
  let number = userData.Phone
  verify.otpVerify(req.body, number).then((data) => {
    console.log("otp post ", data);
    if (data.status == 'approved') {
      if (req.session.userLoginBody) {
        userHelper.dootpLogin(req.session.userBody.Phone).then((response) => {
          console.log('doOtpLogin', response);
          req.session.user = response.user;
          req.session.loggedIn = true
          req.session.userLoginBody = false;
          res.redirect('/')
        })
      } else {
        userHelper.doSignup(req.session.userBody).then((response) => {
          console.log("post__", response);
          req.session.user = response;
          req.session.loggedIn = true
          res.redirect('/')
        });
      }
    } else {

      req.session.verifyErr = "Code Error";
      res.redirect(req.get('referer'))
      // res.send('<script>alert("error"</script>')
    }
  })
})
router.get('/loginOTP', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('user/userOtpLogin',{layout:'loginLayout'})
});
router.post('/userOtpLogin', (req, res) => {
  req.session.userBody = req.body;
  req.session.userLoginBody = true;
  verify.getOTP(req.body.Phone).then((response) => {
    res.redirect('/otp')
  });
})

//userLogin
router.get('/userLogin', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/userLogin', { 'loginErr': req.session.loginErr , layout:'loginLayout'});
    req.session.loginErr = false
  }
});
router.post('/userLogin', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log("loging done", response.user);
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid Email or Password"

      res.redirect('/userLogin')
    }
  });
});
//google
router.get('/google',passport.authenticate('google',{scope :['profile', 'email', ]}))
router.get('/google/callback',passport.authenticate('google',{failureRedirect: '/login'}), (req, res) => {
 // console.log("logged",req.user);
  req.session.user = req.user
  req.session.loggedIn = true
  res.redirect('/')
});


router.get('/userLogout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
