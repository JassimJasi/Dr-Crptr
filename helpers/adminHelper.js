const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt=require('bcrypt');

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
    }
}