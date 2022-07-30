const db = require('../config/connection');
const collection = require('../config/collections');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId

module.exports = {
    addProduct: (product, image) => {
        return new Promise(async (resolve, reject) => {
            //console.log("addprod",product);
            await db.get().collection(collection.PRODUCT_COLLECTION).insertOne({ product, image }).then((response) => {
                resolve();
            })
        })
    },
    viewProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products);
        })
    },
    addCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            //console.log(category);
            let categoryRes =await db.get().collection(collection.CATEGORY_COLLECTION).findOne({categoryName:category.categoryName})
                
                if (categoryRes) {
                    reject('Category Already Exists')
                }else {
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response) => {
                       // console.log("addCat", response);
                        resolve();
                    })
                 }
            })
       
    },
    viewCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category =await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    delCategory: (deleteData) => {
        return new Promise((resolve, reject) => {
            //console.log(deleteData);
            //console.log(objectId(deleteData));
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(deleteData) }).then((response) => {

                resolve(response)
            })
        })
    },
    delProduct: (deleteData) => {
        return new Promise((resolve, reject) => {
            //console.log(deleteData);
            //console.log(objectId(deleteData));
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(deleteData) }).then((response) => {

                resolve(response)
            })
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
    }
} 