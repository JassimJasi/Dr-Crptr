const db = require('../config/connection');
const collection = require('../config/collections');
var objectId = require('mongodb').ObjectId;

module.exports = {
    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: objectId(orderId)}).then((response) => {
                
                    resolve({status:true})
                }).catch((err) =>{
                    reject(err)
                })
            })
        }
}