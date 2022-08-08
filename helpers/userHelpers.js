const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');
var objectId = require('mongodb').ObjectId;

module.exports = {
    doSignup: (userdata) => {
        return new Promise(async (resolve, reject) => {
            userdata.Password = await bcrypt.hash(userdata.Password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userdata).then((data) => {
                userdata._id = data.insertedId
                //console.log(userdata);
                resolve(userdata)
            });
        });
    },
    doLogin: (userdata) => {
        return new Promise(async (resolve, reject) => {
            //console.log(userdata);
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ displayName: userdata.displayName })
            console.log(user);
            if (user) {
                bcrypt.compare(userdata.password, user.Password).then((status) => {
                    if (status) {
                        console.log("Login sucess");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        console.log("login Failed");
                        resolve({ status: false });
                    }
                });
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        });
    },
    dootpLogin: (userdata) => {
        return new Promise(async (resolve, reject) => {
            //console.log(userdata);
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone: userdata })
            if (user) {
                console.log("Login sucess");
                response.user = user;
                response.status = true;
                resolve(response);
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        });
    },
    googleAccount: (data) => {
        return new Promise(async (resolve, reject) => {
            //console.log("google userhelp",data);
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: data.Email })
            if (user) {
                response.user = user;
                response.status = true;
                console.log("g-login", response);
                resolve(response);
            } else {
                await db.get().collection(collection.USER_COLLECTION).insertOne(data).then((data1) => {
                    data._id = data1.insertedId
                    response.user = data;
                    response.status = true;
                    console.log("g-acc crear", response);
                    resolve(response)
                });

            }
        });
    },
    googleUserId: (data) => {
        return new Promise(async (resolve, reject) => {
            //console.log(userdata);
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: data })
            if (user) {

                resolve(response);
            } else {
                resolve({ status: false })
            }
        });
    },
    addToCart: (prodId, userId) => {
        let proObj =  {
            item:objectId(prodId),
            quantity:1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prodId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(prodId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve()
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: proObj }

                            }).then((response) => {
                                resolve()
                            })
                }
               
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProduct: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {//to change array product to object
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
                
            ]).toArray()
           // console.log('userhe',cartItems[0].product);
            resolve(cartItems)
        }).catch(() => {
            resolve("not found")
        })
    },
    getCartCount : (userId) => {
        return new Promise (async(resolve,reject) => {
            let count = 0
           let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
           if(cart){
            count = cart.products.length
           }
           resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },
    removeCartitem: (RemDetails) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(RemDetails.cart) },
                    {
                        $pull: { products: { item: objectId(RemDetails.product) } }
                    }
                ).then((response) => {
                    resolve(true)
                })
        })
    },
    getTotalAmount: (userId) => {
        //getting all product details
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                //aggregate is used to read product id from 'cart(collection)' and go to that id from 'product(collection) and take it'
                {
                    $match: { user: objectId(userId) }//to take cart  from db as match to user id
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: "item",
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {//to change array product to object
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.product.price' }] } }
                    }
                }
            ]).toArray()
            console.log("total",total);
            resolve(total[0].total)


        })
    },
}