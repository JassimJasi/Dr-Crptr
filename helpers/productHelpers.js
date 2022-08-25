const db = require('../config/connection');
const collection = require('../config/collections');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId;

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
    viewCateProducts: (userCate) => {
        return new Promise(async(resolve,reject) => {
          //  let category = ''product.product_categorie'';
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate(
                [
                    { $match:{'product.product_categorie':userCate}}
                ]
            ).toArray()
           // console.log("viewCateProducts ",products);
            resolve(products);
        })
    },
    fourProduct: () => {
        return new Promise(async (resolve, reject) => {
            let fourProducts = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(4).toArray()
           // console.log("four" ,fourProducts);
            resolve(fourProducts);
        })
    },
    addCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            //console.log(category);
            category.categoryName = category.categoryName .toUpperCase()
            let categoryRes = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ categoryName:  category.categoryName })

            if (categoryRes) {
                reject('Category Already Exists')
            } else {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response) => {
                    // console.log("addCat", response);
                    resolve();
                })
            }
        })

    },
    viewCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
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
    getCateById: (cateId) => {
        return new Promise((resolve, reject) => {
            let categoryResu = db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(cateId) })
            if (categoryResu) {
                resolve(categoryResu)
            }else {
                 reject("Not Found")
            }
        })

    },
    editCategory: (cateId, editedCate) => {
        editedCate.categoryName = editedCate.categoryName.toUpperCase()
        return new Promise((resolve, reject) => {
            let sameCategory = db.get().collection(collection.CATEGORY_COLLECTION).findOne({ categoryName: editedCate.categoryName })
            if (sameCategory) {
                reject("Alredy exists")
            } else {
                db.get().collection(collection.CATEGORY_COLLECTION)
                    .updateOne({ _id: objectId(cateId) }, {
                        $set: {
                            categoryName: editedCate.categoryName
                        }
                    }).then((response) => {
                        resolve()
                    })
            }
        })
    },
    getProdById: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((response) => {
                resolve(response)
            })
        })
    },
    editProduct: (prodId, editedProd, image) => {
        return new Promise(async (resolve, reject) => {
            console.log("produ page", editedProd);
            // let oldProducts = db.get().collection(collection.PRODUCT_COLLECTION).findOne({product:editedProd.product_name})
            // if(oldProducts){
            //     resolve("Alredy exists")
            // }else {
            await db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: objectId(prodId) },
                    {
                        $set: {
                            'product.product_name': editedProd.product_name,
                            'product.product_name_fr': editedProd.product_name_fr,
                            'product.product_categorie': editedProd.product_categorie,
                            'product.available_quantity': editedProd.available_quantity,
                            'product.product_description': editedProd.product_description,
                            'product.stock_alert': editedProd.stock_alert,
                            'product.price': editedProd.price,
                            'product.author': editedProd.author,
                            "product.date": 'product.date',
                            'image': image
                        }
                    }).then((response) => {
                        resolve("successfully Updated")
                    }).catch(() => {
                        reject("Sorry somethig went wrong")

                    })
            //}
        })

    },
    //single Product
    productDetails : (prodId) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: objectId(prodId)}).then((product) => {
                resolve(product);
                reject("product Not Found")
            })
        })
    },
//get product by category
     cateProducts: (category) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({"product.product_categorie" : category}).toArray()
            resolve(products);
        })
    },
}  