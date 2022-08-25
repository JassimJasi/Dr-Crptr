const db = require('../config/connection');
const collection = require('../config/collections');

module.exports = {
    adDoList : (list) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TO_DO_LIST_COLLECTION).insertOne().then(() => {
                resolve
            }).catch(() => {
                reject()
            })
        })
    },
    getToDolist: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TO_DO_LIST_COLLECTION).find().toArray().then(() => {
                resolve()
            })
        })
    }
}