const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelper = require('../helpers/adminHelper');
const verify = require('../helpers/verify');
const productHelpers = require('../helpers/productHelpers');
const upload = require('../middleware/multer');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.adminLoggedIn) {
    res.redirect('admin/dashbord');
  } else {
    res.render('admin/adminLogin', { admin: true, 'loginErr': req.session.adminErr, layout: 'loginLayout' });
    req.session.adminErr = false
  }
});

router.post('/', (req, res) => {
  adminHelper.adminLogin(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('admin/dashbord')
    } else {
      req.session.adminErr = "Invalid Email or Password"
      res.redirect('/admin')
    }
  })
})

router.get('/adminOtp1', (req, res) => {
  res.render('admin/adminOtp', { admin: true, layout: 'loginLayout' });
});
router.post('/adminOtp', (req, res) => {
  console.log("adminotp post", req.body);
  req.session.adminBody = req.body;
  req.session.adminLoginBody = true;
  verify.getOTP(req.body.Phone).then((response) => {
    res.redirect('otpAdmin')
  })
})

router.get('/otpAdmin', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.render('admin/adminOtpVerify', { "verifyErr": req.session.verifyErr, layout: 'loginLayout' })
  req.session.verifyErr = false;
});
router.post('/otpAdmin', (req, res) => {
  console.log("otpAdmin post", req.session.adminBody);
  let adminData = req.session.adminBody;
  let number = adminData.Phone;
  verify.otpVerify(req.body, number).then((data) => {
    if (data.status == 'approved') {
      adminHelper.doOtpLogin(req.session.adminBody.Phone).then((response) => {
        req.session.admin = response.admin;
        req.session.adminLoggedIn = true
        req.session.adminLoginBody = false;
        res.redirect('/admin')
      })
    } else {

      req.session.verifyErr = "Code Error";
      res.redirect(req.get('referer'))
      // res.send('<script>alert("error"</script>')
    }
  })
})

router.get('/dashbord', (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.admin) {
    let admin = req.session.admin;
    res.render('admin/adminHome', { admin, layout: "adminLayout" });
  } else {
    res.redirect('/admin')
  }
});

//view-users
router.get('/view-user', (req, res) => {
  if (req.session.admin) {
    let admin = req.session.admin;
    adminHelper.viewUser().then((userData) => {
      console.log("view user", userData);
      res.render('admin/viewUser', { admin, userData, layout: "adminLayout" });
    })
  } else {
    res.redirect('/admin');
  }
})

//delete user 
router.get('/userDel/:id', (req,res) => {
  let userId = req.params.id
  productHelpers.delUser(userId).then(() => {
    res.redirect('/admin/view-user')
  })
})


//product
//add product

router.get('/add-product', (req, res) => {
  //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.admin) {
    let admin = req.session.admin;
    productHelpers.viewCategory().then((category) => {
      console.log("addPro Cate",category);
    res.render('admin/addProduct', { admin,category, layout: "adminLayout" })
    })
  } else {
    res.redirect('/admin')
  }
})

router.post('/addProduct', upload.array('image', 4), (req, res) => {
  //console.log("product ", req.files);
  let image = [];
  let files = req.files;

  image = files.map((value) => {
    return value.filename;
  })

  let dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1;
  let year = dateObj.getUTCFullYear();
  let day = dateObj.getUTCDate();
  req.body.date = day + "/" + month + "/" + year;
  console.log(req.body);
  productHelpers.addProduct(req.body, image).then((response) => {
    res.redirect('add-product')
  })
})

//view-products
router.get('/view-product', (req, res) => {
  if (req.session.admin) {
    let admin = req.session.admin;
    productHelpers.viewProducts().then((products) => {
      
      res.render('admin/adminViewProduct', { admin, layout: "adminLayout", products });
    })
  } else {
    res.redirect('/admin')
  }
})
//delete Product
router.get('/productDel/:id', (req,res) => {
  let prodId = req.params.id
  productHelpers.delProduct(prodId).then(() => {
    res.redirect('/admin/view-product')
  })
})
// router.get('/userDel/:id', (req,res) => {
//   let userId = req.params.id
//   productHelpers.delUser(userId).then(() => {
//     res.redirect('/admin/view-user')
//   })
// })

//CategoryManagement

router.get('/viewCategory', (req, res) => {
  if (req.session.admin) {
    let admin = req.session.admin;
    productHelpers.viewCategory().then((category) => {
      console.log("Category", category);
      res.render('admin/viewCategoryManage', { category, admin, layout: "adminLayout" })
    })
  } else {
    res.redirect('/admin')
  }
})

//addCategoryManagement
router.get('/addCategory', (req, res) => {
  if (req.session.admin) {
    let admin = req.session.admin;
    let errMes = req.session.addCategoryErr
     
    res.render('admin/addCategoryManage', { admin, errMes, layout: "adminLayout" })
    req.session.addCategoryErr = false
      
  } else {
    res.redirect('viewCategory')
  }
});
router.post('/addCategory', (req, res) => {
  //console.log("Category", req.body);
  productHelpers.addCategory(req.body).then((response) => {
    //console.log(response);
   
    res.redirect('viewCategory');
  }).catch((err) => {
    req.session.addCategoryErr = err;
    res.redirect('addCategory');


  })
})
//delete category 
router.get('/categoryDel/:id', (req, res) => {
  let cateId = req.params.id
  console.log(cateId);
  productHelpers.delCategory(cateId).then(() => {
    res.redirect('/admin/viewCategory')
  })
})

//adminLogout
router.get('/adminLogout', (req, res) => {
  req.session.adminLoggedIn = false
  req.session.admin = null;
  res.redirect('/admin')
})


module.exports = router;
