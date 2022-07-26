const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelper = require('../helpers/adminHelper');
const verify = require('../helpers/verify');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if(req.session.adminLoggedIn) {
    res.redirect('admin/dashbord');
  }else {
    res.render('admin/adminLogin', { admin: true, 'loginErr': req.session.adminErr , layout : 'loginLayout'});
    req.session.loginErr = false
  }
});

router.post('/',(req,res) => {
  adminHelper.adminLogin(req.body).then((response) =>{
    console.log(response);
    if(response.status){
      req.session.adminLoggedIn=true
      req.session.admin=response.admin
      res.redirect('admin/dashbord')
    }else{
      req.session.adminErr="Invalid Email or Password"
      res.redirect('/admin')
    }
  })
})

router.get('/adminOtp1', (req,res) => {
  res.render('admin/adminOtp',{admin:true, layout : 'loginLayout'});
});
router.post('/adminOtp', (req,res) => {
  console.log("adminotp post",req.body);
  req.session.adminBody = req.body;
  req.session.adminLoginBody = true;
  verify.getOTP(req.body.Phone).then((response) => {
    res.redirect('otpAdmin')
  })
})

router.get('/otpAdmin',(req,res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('admin/adminOtpVerify', { "verifyErr": req.session.verifyErr, layout : 'loginLayout' })
  req.session.verifyErr = false;
});
router.post('/otpAdmin',(req,res) => {
  console.log("otpAdmin post",req.session.adminBody);
  let adminData = req.session.adminBody;
  let number = adminData.Phone;
  verify.otpVerify(req.body, number).then((data) => {
    if(data.status == 'approved') {
      adminHelper.doOtpLogin(req.session.adminBody.Phone).then((response) => {
        req.session.admin = response.admin;
          req.session.adminLoggedIn = true
          req.session.adminLoginBody = false;
          res.redirect('/admin')
      })
    }
  })
})

router.get('/dashbord', (req , res ) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.admin) {
    res.render('admin/adminHome',{admin: true,layout:"adminLayout"} );
  } else {
    res.redirect('/admin')
  }
});

module.exports = router;
