const { response } = require('express');
var express = require('express');
var router = express.Router();

const userHelper = require('../helpers/userHelpers')

/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user;
  res.render('user/userHome', { admin: false, user });
});

//userSignup page
router.get('/userSignup', (req, res, next) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/userSignup', {})
  }
});
router.post('/userSignup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    // console.log(response);
    req.session.user = response;
    req.session.loggedIn = true
    res.redirect('/')
  });
});

//userLogin
router.get('/userLogin', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/userLogin', { 'loginErr': req.session.loginErr });
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
router.get('/userLogout',(req,res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
