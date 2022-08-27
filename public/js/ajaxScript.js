
function addToCart(prodId) {
  $.ajax({
    url: '/add-To-Cart/' + prodId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Added to Cart',
          showConfirmButton: false,
          timer: 2000
        })
      } else {
      }
      // console.log("ajax",response);
    },
    error: function () {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please login!',
        footer: '<a href="">Why do I have this issue?</a>'
      }).then(function() {
        window.location = "/userLogin";
      });
    }
  })
  return ;
 
}

function addToWishList(prodId) {
  $.ajax({
    url: '/add-To-wishlist/' + prodId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Added to wish list',
          showConfirmButton: false,
          timer: 2000
        })
      } else {
      }
      // console.log("ajax",response);
    },
    error: function () {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please login!',
        footer: '<a href="">Why do I have this issue?</a>'
      }).then(function() {
        window.location = "/userLogin";
      });
    }
  })
  return ;
 
}


//script for cart.hbs
function changeQuantity(cartId, proId, userId, count) {
  let quantity = parseInt(document.getElementById(proId).innerHTML)
  count = parseInt(count)
  $.ajax({
    url: '/change-product-quantity',
    data: {
      user: userId,
      cart: cartId,
      product: proId,
      count: count,
      quantity: quantity
    },
    method: 'post',
    success: (response) => {
      console.log(response);
      if (response.removeProduct) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Product removed from cart',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {

          location.reload()
        })
      } else {
        document.getElementById(proId).innerHTML = quantity + count
        document.getElementById('total').innerHTML = response.total

      }
    }
  })
}
function removeCartProduct(cartId, proId) {
  $.ajax({
    url: '/remove-cart-product',
    data: {
      cart: cartId,
      product: proId
    },
    method: 'post',
    success: (response) => {
      alert('remove Product')
      location.reload()
    }
  })
}
function removeWishlistProduct(cartId, proId) {
  $.ajax({
    url: '/remove-Wishlist-product',
    data: {
      cart: cartId,
      product: proId
    },
    method: 'post',
    success: (response) => {
      alert('remove Product')
      location.reload()
    }
  })
}

//order placement


$('#checkout-form').submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      console.log("ajax", response);
      
      if (response.codSuccess) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Payment Success',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          location.href = '/';
        })
      } else {
        razorpayPayment(response);
      }
    }
  })
})

function razorpayPayment(order) {
  var options = {
    "key": "rzp_test_fCu3oZ6fzN1xBU", // Enter the Key ID generated from the Dashboard
    "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Dr.crptr",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response) {


      verifyPayment(response, order)
    },
    "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9999999999"
    },
    "notes": {
      "address": "Razorpay Corporate Office"
    },
    "theme": {
      "color": "#3399cc"
    }
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}
function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order
    },
    method: 'post',
    success: (response) => {
      if (response.status) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Payment Success',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          location.href = '/';
        })
       
      } else {
        Swal.fire({
          icon: 'Failed',
          title: 'Oops...',
          text: 'Payment Failed!',
          
        })
      }
    }
  })
}
//coupon
$('#couponForm').submit((e) => {
  e.preventDefault();
  $.ajax({
    url: '/apply-coupon',
    method:'post',
    data:$('#couponForm').serialize(),
    success:(resource) => {
      if(resource.status) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Coupon Success',
          showConfirmButton: false,
          timer: 2000
        })
        document.getElementById('discount').innerHTML = resource.discountPrice
        document.getElementById('total').innerHTML = resource.discountTotal
      }else{
        Swal.fire({
          position: 'center',
          icon: 'Failed',
          title: 'Invalid coupon!',
          showConfirmButton: false,
          timer: 2000
        })
      }
    }
  })
})
function cancelOrder(orderId) {
  $.ajax({
    url: '/cancelOrder/' + orderId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Cancelled',
          showConfirmButton: false,
          timer: 2000
        })
        location.reload()
      }
    },
    error: (response) => {
      alert(response)
    }
  })
}
//edit user
$('#editUserAccount').submit((e) => {
  e.preventDefault();
  $.ajax({
    url: '/editUserAccount',
    method:'post',
    data:$('#editUserAccount').serialize(),
    success:(resource) => {
      if(resource.ediStatus) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Account successfully edited',
          showConfirmButton: false,
          timer: 2000
        })
        // document.getElementById('discount').innerHTML = resource.discountPrice
        // document.getElementById('total').innerHTML = resource.discountTotal
      }else{
        Swal.fire({
          position: 'center',
          icon: 'Failed',
          title: 'Failed!!',
          showConfirmButton: false,
          timer: 2000
        })
      }
    }
  })
})
