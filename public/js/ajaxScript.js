function addToCart(prodId){
    $.ajax({
      url:'/add-To-Cart/'+prodId,
      method:'get',
      success:(response) => {
        if(response.status){
            let count = $('#cart-count').html()
            count = parseInt(count)+1
            $('#cart-count').html(count)
            alert("Success fully Add to cart")
        }else {
        }
        // console.log("ajax",response);
      },
      error : function () {
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