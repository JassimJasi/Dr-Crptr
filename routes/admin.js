const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelper = require('../helpers/adminHelper');
const verify = require('../helpers/verify');
const productHelpers = require('../helpers/productHelpers');
const upload = require('../middleware/multer');
const userHelpers = require('../helpers/userHelpers');
const { Db } = require('mongodb');
const dashboardHelpers = require('../helpers/dashboardHelpers');
const toDoHelper = require('../helpers/toDoListHelper');
const orderHelper = require('../helpers/orderHelper');

const adminVerification = (req, res, next) => {
  if (req.session.adminLoggedIn) {

    next()
  } else {
    res.redirect('/admin')
  }
}

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

router.get('/dashbord', adminVerification, async (req, res) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let salesDetails = await dashboardHelpers.lastFiveOrder();
  let totalSales = await dashboardHelpers.totalSales()
  let dailyTotalSales = await dashboardHelpers.dailyTotalSales();
  let arrayLength = dailyTotalSales.length - 1;
  let dailySales = dailyTotalSales[arrayLength]
  //console.log('chart',dailySales);    
  let salesDate = await dashboardHelpers.salesDate();
  let statusCode = await dashboardHelpers.statusCode();
  let totalStatusCounttext = await dashboardHelpers.totalStatusCounttext()
  let totalStatusCount = await dashboardHelpers.totalStatusCount();
  let todolist = await toDoHelper.getToDolist();
  let admin = req.session.admin;
  res.render('admin/adminHome', { admin, layout: "adminLayout", salesDetails, todolist, totalSales, dailyTotalSales, salesDate, statusCode, totalStatusCount, totalStatusCounttext, dailySales });
});

//view-users
router.get('/view-user', adminVerification, (req, res) => {

  let admin = req.session.admin;
  adminHelper.viewUser().then((userData) => {
    // console.log("view user", userData);
    res.render('admin/viewUser', { admin, userData, layout: "adminLayout" });
  })

})

//delete user 
router.get('/userblock/:id', (req, res) => {
  let userId = req.params.id
  adminHelper.delUser(userId).then(() => {
    res.redirect('/admin/view-user')
  })
})

//user Edit
router.get('/userEdit/:id', async (req, res) => {
  let admin = req.session.admin;
  let userId = req.params.id
  let user = await adminHelper.getUserById(userId)
  res.render('admin/editUser', { admin, layout: "adminLayout", user })

})
router.post('/edit-user/:id', (req, res) => {
  adminHelper.editUser(req.params.id, req.body).then(() => {
    res.redirect('back')
  })
})


//product
//add product

router.get('/add-product', adminVerification, (req, res) => {
  //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  let admin = req.session.admin;
  productHelpers.viewCategory().then((category) => {
    //console.log("addPro Cate", category);
    res.render('admin/addProduct', { admin, category, layout: "adminLayout" })
  })
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
  //console.log(req.body);
  productHelpers.addProduct(req.body, image).then((response) => {
    res.redirect('add-product')
  })
})

//view-products
router.get('/view-product', adminVerification, (req, res) => {

  let admin = req.session.admin;
  productHelpers.viewProducts().then((products) => {

    res.render('admin/adminViewProduct', { admin, layout: "adminLayout", products });
  })
})
//delete Product
router.get('/productDel/:id', (req, res) => {
  let prodId = req.params.id
  productHelpers.delProduct(prodId).then(() => {
    res.redirect('/admin/view-product')
  })
})

//edit Product
router.get('/productEdit/:id', async (req, res) => {

  let prodId = req.params.id
  let products = await productHelpers.getProdById(prodId)
  let category = productHelpers.viewCategory().then((category) => {
    let proErr = req.session.editProductErr
    let proSucc = req.session.successMess
    res.render('admin/editProduct', { category, proSucc, layout: "adminLayout", products, proErr })
    req.session.editProductErr = false
    req.session.successMess = false
  })
})

router.post('/productEdit/:id', upload.array('image', 4), (req, res) => {
  let image = [];
  let files = req.files;

  image = files.map((value) => {
    return value.filename;
  })
  //console.log(req.params.id);
  productHelpers.editProduct(req.params.id, req.body, image).then((success) => {
    req.session.successMess = success
    res.redirect('back')
  }).catch((error) => {
    req.session.editProductErr = error;
    res.redirect('back')
  })
})

//CategoryManagement

router.get('/viewCategory', adminVerification, (req, res) => {

  let admin = req.session.admin;
  productHelpers.viewCategory().then((category) => {
    //console.log("Category", category);
    res.render('admin/viewCategoryManage', { category, admin, layout: "adminLayout" })
  })
})

//addCategoryManagement
router.get('/addCategory', adminVerification, (req, res) => {

  let admin = req.session.admin;
  let errMes = req.session.addCategoryErr

  res.render('admin/addCategoryManage', { admin, errMes, layout: "adminLayout" })
  req.session.addCategoryErr = false

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
  //console.log(cateId);
  productHelpers.delCategory(cateId).then(() => {
    res.redirect('/admin/viewCategory')
  })
})

//edit Category


router.get('/categoryEdit/:id', async (req, res) => {
  let err = req.session.editCateErr
  let cateId = req.params.id
  let admin = req.session.admin;
  productHelpers.getCateById(cateId).then((category) => {
    //console.log(category);
    res.render('admin/editCategory', { admin, err, layout: "adminLayout", category })
  }).catch((errmass) => {
    res.status(404).send(errmass);
  })
})
router.post('/editCategory/:id', (req, res) => {
  productHelpers.editCategory(req.params.id, req.body).then(() => {
    //req.session.editCateErr = errResp
    res.redirect('back')
  }).catch((err) => {
    req.session.editCateErr = err
    res.redirect('back')
  })
})
//order
router.get('/adminOrder', adminVerification, (req, res) => {
  let admin = req.session.admin;
  adminHelper.getAllOrderDetails().then((orders) => {
    res.render('admin/adminOrder', { admin, layout: "adminLayout", orders })
  })
})
router.get('/shippingConfirm/:id', (req, res) => {
  //console.log("shippingConfirm",req.params.id);
  adminHelper.confirmShipping(req.params.id).then((response) => {
    //console.log("shipp",response);
    res.json(response)
  })
})
router.get('/cancelOrder/:id', (req, res) => {
  //console.log("ord",req.params.id);
  orderHelper.cancelOrder(req.params.id).then((response) => {
    res.json(response)
  })
})

//Banner
router.get('/banner', adminVerification, (req, res) => {
  let admin = req.session.admin;
  res.render('admin/viewBanner', { admin, layout: "adminLayout" })
})
router.get('/addBanner', adminVerification, (req, res) => {
  let admin = req.session.admin;
  res.render('admin/addBanner', { admin, layout: "adminLayout" })
})
router.post('/addBanner', upload.single('Image'), (req, res) => {
  let image = req.file.filename
  console.log(req.file);
  adminHelper.addBanner(req.body, image).then(() => {
    res.redirect('/admin/addBanner')
    // if (req.files.Image) {
    //   let image = req.files.Image
    //   image.mv('./public/product-images/bannerImg' + id + '.jpg')
    // }
  })
})

//Coupon Management
router.get('/couponManagement', adminVerification, (req, res) => {
  let admin = req.session.admin;
  adminHelper.viewCoupon().then((couponDetails) => {
    res.render('admin/viewCoupon', { admin, layout: "adminLayout", couponDetails })
  })
})
router.get('/addCoupon', adminVerification, (req, res) => {
  let admin = req.session.admin;
  res.render('admin/addCoupon', { admin, layout: "adminLayout" })
})

router.post('/addCoupon', (req, res) => {
  adminHelper.addCoupon(req.body).then(() => {
    res.render('admin/addCoupon', { layout: "adminLayout" })
  })
})
// router.post('/coupon',(req,res) => {
//   //console.log(req.body);
// })
router.get('/couponDel/:id', (req, res) => {
  adminHelper.deleteCoupon(req.params.id).then((response) => {
    res.json(response)
  }).catch((err) => {
    console.log(err);
  })
})


//chart
router.get('/chart', adminVerification, (req, res) => {
  let admin = req.session.admin;
  res.render('admin/chart', { admin, layout: "adminLayout" })
})

//to Do List
router.post('/toDoList', (req, res) => {
  toDoHelper.adDoList(req.body).then(() => {
    res.redirect('back')
  })
})



//adminLogout
router.get('/adminLogout', (req, res) => {
  req.session.adminLoggedIn = false
  req.session.admin = null;
  res.redirect('/admin')
})




module.exports = router;
