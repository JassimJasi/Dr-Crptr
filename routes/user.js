const { response } = require('express');
var express = require('express');
var router = express.Router();

const userHelper = require('../helpers/userHelpers');
const verify = require('../helpers/verify');
const passport = require('passport');
require('../helpers/googleAuth')(passport);
const productHelpers = require('../helpers/productHelpers');
const payHelper = require('../helpers/PayHelpers');
const offerHelper = require('../helpers/offerHelpers')

// Not login
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/userLogin')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user;
  //console.log("final", user);
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  let banner = await userHelper.getBanner()
  console.log(banner);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
    //console.log(cartCount);
  }
  let fourProducts = await productHelpers.fourProduct()
  // console.log(fourProducts);
  productHelpers.viewProducts().then((products) => {
    //console.log("prod", products);
    res.render('user/userHome', { admin: false, user, products, cartCount, fourProducts, banner });
  })

});

//userSignup page
router.get('/userSignup', (req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/userSignup', { layout: 'loginLayout' })
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
  res.render('user/userSignupotp', { "verifyErr": req.session.verifyErr, layout: 'loginLayout' })
  req.session.verifyErr = false;

});
router.post('/otp', (req, res) => {
  let userData = req.session.userBody
  let number = userData.Phone
  verify.otpVerify(req.body, number).then((data) => {
    // console.log("otp post ", data);
    if (data.status == 'approved') {
      if (req.session.userLoginBody) {
        userHelper.dootpLogin(req.session.userBody.Phone).then((response) => {
          //console.log('doOtpLogin', response);
          req.session.user = response.user;
          req.session.loggedIn = true
          req.session.userLoginBody = false;
          res.redirect('/')
        })
      } else {
        userHelper.doSignup(req.session.userBody).then((response) => {
          //console.log("post__", response);
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
  res.render('user/userOtpLogin', { layout: 'loginLayout' })
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
    res.render('user/userLogin', { 'loginErr': req.session.loginErr, layout: 'loginLayout' });
    req.session.loginErr = false
  }
});
router.post('/userLogin', (req, res) => {
  // console.log("userLog", req.body);
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      //  console.log("loging done", response.user);
      req.session.loggedIn = true
      req.session.user = response.user
      if (req.session.cartPage) {
        res.redirect('/cart')
        req.session.cartPage = false
      } else {
        res.redirect('/')
      }
    } else {
      req.session.loginErr = "Invalid Email or Password"

      res.redirect('/userLogin')
    }
  });
});
//google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email',] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  //console.log("logged", req.user.user);
  req.session.user = req.user.user
  req.session.loggedIn = true
  res.redirect('/')
});

//product
router.get('/userProduct', async (req, res) => {
  let user = req.session.user;
  let category = await productHelpers.viewCategory()

  //console.log("userCate",category);
  productHelpers.viewProducts().then((products) => {
    let sortProduct = products.sort(function (a, b) { return a.product.price - b.product.price })
    res.render('user/userProduct', { user, category, sortProduct })
  })
})
router.get('/userProduct/:cate', async (req, res) => {
  let user = req.session.user;
  let category = await productHelpers.viewCategory()
  if (req.params) {
    // console.log(req.params);
    productHelpers.viewCateProducts(req.params.cate).then((products) => {
      let sortProduct = products.sort(function (a, b) { return a.product.price - b.product.price })
      res.render('user/userProduct', { user, category, sortProduct })
    })
  } else {
    console.log("All");
    //console.log("userCate",category);
    productHelpers.viewProducts().then((products) => {

      res.render('user/userProduct', { user, category, products })
    })
  }

})

//product Details
router.get('/prodDetails/:id', (req, res, next) => {

  let user = req.session.user;

  productHelpers.productDetails(req.params.id).then((productDetails) => {
    // console.log("user 1 pro", productDetails);
    let category = productDetails.product.product_categorie
    productHelpers.cateProducts(category).then((products) => {
      //console.log("cate prod", products)
      res.render('user/productDetails', { user, productDetails, products })
    })
  }).catch((errMes) => {
    next(errMes)
  })
})

//cart
router.get('/cart', verifyLogin, async (req, res) => {
  req.session.cartPage = true
  let user = req.session.user;
  // let cartErr = res.session.cartErr;
  let totalValue = 0
  let products = await userHelper.getCartProduct(req.session.user._id)
  if (products.length > 0) {
    totalValue = await userHelper.getTotalAmount(req.session.user._id)
    //console.log(products);
    // console.log("cart", products);
    res.render('user/cart', { user, products, totalValue })
    // res.session.cartEr = false;
  } else {
    // res.session.cartErr = "Please login"
    res.redirect('/userLogin')
  }
})
// .catch((error) => {
//   next(error)
// })


//add to cart
router.get('/add-To-Cart/:id', (req, res) => {
  //req.session.cartPage = true
  //console.log("cart", req.params.id);
  //console.log("api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res, next) => {
  // console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)
    //console.log("res", response);
    res.json(response)
  })
})
router.post('/remove-cart-product', (req, res, next) => {
  //console.log(req.body);
  userHelper.removeCartitem(req.body).then((response) => {
    res.json(response)
  })
})
//wishlist
router.get('/wishlist', verifyLogin, async (req, res) => {
  let user = req.session.user;
  let products = await userHelper.getWishListProduct(req.session.user._id)
  if (products.length > 0) {

    //console.log(products);
    // console.log("cart", products);
    res.render('user/whishList', { user, products })
    // res.session.cartEr = false;
  } else {
    // res.session.cartErr = "Please login"
    res.redirect('/userLogin')
  }

})
router.get('/add-To-wishlist/:id', (req, res) => {
  //req.session.cartPage = true
  //console.log("cart", req.params.id);
  //console.log("api call");
  userHelper.addTowishlist(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})
router.post('/remove-Wishlist-product', (req, res) => {
  console.log("wish", req.body);
  userHelper.removeWishlistitem(req.body).then((response) => {
    res.json(response)
  })
})
//Coupon
router.post('/apply-coupon', verifyLogin, (req, res) => {
  console.log("userjs", req.body, "sxxsx", req.session.user._id);
  offerHelper.applyCoupon(req.body, req.session.user._id).then((response) => {
    if (response.status) {
      req.session.coupon = response.coupon;
      req.session.discount = response.discountPrice
      console.log("user",req.session.coupon);
    }
    console.log('user coup', response);
    res.json(response)
  })
})

//checkout
router.get('/checkout', verifyLogin, async (req, res) => {
  let DiscountTotal = 00
  let address = await userHelper.getUserAddress(req.session.user._id)
  let total = await userHelper.getTotalAmount(req.session.user._id)
  let coupon = req.session.coupon;
  DiscountTotal = req.session.discount;
  res.render("user/checkout", { total, user: req.session.user, address, DiscountTotal, coupon })

})
//place order
router.post('/place-order', verifyLogin, async (req, res) => {
  let totalPrice = 0;
  let products = await userHelper.getCartProductList(req.body.userId);
  if (req.session.discount) {
    totalPrice = req.session.discount;
  } else {
    totalPrice = await userHelper.getTotalAmount(req.body.userId);
  }
  userHelper.userAddress(req.body).then(() => {
    console.log(req.session.coupon);
    userHelper.placeOrder(req.body, products, totalPrice, req.session.coupon).then((orderId) => {
      // console.log("place req body",req.body['payment-method']);
      if (req.body['payment-method'] === 'COD') {

        res.json({ codSuccess: true })
      } else {

        payHelper.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response)
        })
      }
    })
    req.session.discount = null;
    req.session.coupon = null;
  })
})
router.post('/verify-payment', verifyLogin, (req, res) => {
  console.log(req.body);

  payHelper.verifyPayment(req.body).then(() => {
    payHelper.changePaymentStatus(req.body['order[receipt]'], req.session.user._id).then(() => {
      console.log('payment successfull');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

//order
router.get('/order', verifyLogin, async (req, res) => {
  let orders = await payHelper.getOrderDetails(req.session.user._id)
 // console.log('order', orders);
  res.render('user/order', { orders })

})
router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  let products = await userHelper.getOrderProducts(req.params.id)
  //console.log("view-ord", products);
  res.render('user/viewOrderProducts', { products })
})


router.get('/userLogout', (req, res) => {
  req.session.loggedIn = false
  req.session.user = null;
  res.redirect('/')
})

module.exports = router;
