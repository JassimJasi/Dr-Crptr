const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt=require('bcrypt');

module.export = {
    adminLogin: (data) =>{
        const response = {}
        return new Promise(async(resolve,reject) =>{
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({name:data.name});
            if(admin) {
                if(admin.password == )
            }
        })
    }
}