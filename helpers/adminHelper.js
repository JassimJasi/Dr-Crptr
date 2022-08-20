const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt=require('bcrypt');
var objectId = require('mongodb').ObjectId;

module.exports = {
    adminLogin: (data) =>{
        const response = {}
        return new Promise(async(resolve,reject) =>{
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Name:data.Name});
            if(admin) {
                
                    if (admin.Password == data.Password) {
                        console.log('Loging success');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                
            }else {
                console.log('loginfailed');
                resolve({ status: false })
            }
        })
    },
    doOtpLogin: (data) => {
        return new Promise (async (resolve,reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Phone:data})
            if(admin){
                console.log("Login sucess");
                response.admin = admin;
                response.status = true;
                resolve(response);
    }else {
        console.log('login failed');
        resolve({status:false})
    }
        })
    },
    viewUser: () => {
        return new Promise (async(resolve, reject) => {
           let userData = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(userData);
        })
    },
    delUser : (deleteData) => {
        return new Promise((resolve, reject) => {
            //console.log(deleteData);
            //console.log(objectId(deleteData));
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(deleteData) }).then((response) => {

                resolve(response)
            })
        })
    },
    getUserById : (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userId)}).then((result) => {
                resolve(result);
            })
        })
    },
    editUser : (userId,editUser) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        displayName: editUser.displayName,
                        Email: editUser.Email,
                        Phone: editUser.Phone
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    getAllOrderDetails : () => {
        return new Promise((resolve,reject) => {
           let orders = db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
    confirmShipping: (order_id) => {
        return new Promise((resolve,reject) => {
            console.log("shipp user-help",order_id);
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(order_id) }, {
                    $set: {
                        status: Shipped,                        
                    }
                }).then((response) => {
                    console.log("shipp user-help",response);
                    resolve(response)
                })
        })
    },
    addBanner : (bannerDetails,image) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne({bannerDetails,image}).then(() => {
                resolve()
            })
        })
    },
    addCoupon : (couponDetails) => {
        couponDetails.usedUserDetails = [null]
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails).then(() => {
                console.log("cou",couponDetails);
                resolve()
            })
        })
    },
    viewCoupon : () => {
        return new Promise(async(resolve,reject) => {
          let couponDetails = await  db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(couponDetails);
        })
    }
}