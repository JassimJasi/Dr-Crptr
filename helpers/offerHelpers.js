const db = require('../config/connection');
const collection = require('../config/collections');
const objectId = require('mongodb').ObjectId;
const userHelper = require('./userHelpers')

module.exports = {
    applyCoupon: (coupon, userId) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            response.discount = 0;
            let couponData = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: coupon.couponCode })
            if (couponData) {
                let userExit = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode: coupon.couponCode ,usedUserDetails: { $in: [objectId(userId)] } })
                if (userExit) {
                    response.status = false;
                    resolve(response)
                } else {
                    response.status = true;
                    response.coupon = couponData;

                    userHelper.getTotalAmount(userId).then((total) => {
                        response.discountTotal = total - ((total * couponData.discount) / 100)
                        response.discountPrice = (total * couponData.discount) / 100
                        console.log("res",response);
                        resolve(response)
                    })
                }
            } else {
                response.status = false;
                resolve(response)
            }
        })
    }
}