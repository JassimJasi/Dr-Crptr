const db = require('../config/connection');
const collection = require('../config/collections');
var objectId = require('mongodb').ObjectId;
const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'rzp_test_fCu3oZ6fzN1xBU',
    key_secret: 'EMeKQnO1HGUBbqmPR9o8afYw',
});

module.exports = {
    generateRazorpay: (orderId, total) => {
       // console.log("pay ist");
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,//amount is the smallest currency unit (paisa)so(*100)
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log("new order: ", order);
                resolve(order)
            });
        })

    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'EMeKQnO1HGUBbqmPR9o8afYw');

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            //console.log("asdfgdscd",details['payment[razorpay_order_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                //console.log("done");
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }).then(() => {
                        resolve()
                    })
        })
    },
    getOrderDetails: (userId) => {
        return new Promise(async(resolve, reject) => {
          let orders =  await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
          resolve(orders)
        })
    }
}