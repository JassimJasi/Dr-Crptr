

function addToCart(prodId) {
  $.ajax({
    url: '/add-To-Cart/' + prodId,
    method: 'get',
    success: (response) => {
      if (response.status) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
        alert("Success fully Add to cart")
      } else {
      }
      // console.log("ajax",response);
    },
    error: function () {
      alert("Please Login")

    }
  })
  return alert("Are you sure, you want to add to cart");
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
      if (response.removeProduct) {
        alert("Product removed from cart")
        location.reload()
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
//order placement


$('#checkout-form').submit((e) => {
  e.preventDefault()
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: $('#checkout-form').serialize(),
    success: (response) => {
      console.log("ajax", response);
      alert(response)
      if (response.codSuccess) {
        location.href = '/';
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
        location.href = '/'
      } else {
        alert("Payment Failed")
      }
    }
  })
}