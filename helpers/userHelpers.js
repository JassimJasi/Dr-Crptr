const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');

module.exports = {
    doSignup: (userdata) => {
        return new Promise(async(resolve, reject) => {
            userdata.Password = await bcrypt.hash(userdata.Password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userdata).then((data) => {
                userdata._id=data.insertedId
                console.log(userdata);
                resolve(userdata)
            });
        });
    },
    doLogin: (userdata) => {
        return new Promise(async (resolve,reject) => {
            console.log(userdata);
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({Name:userdata.name})
            console.log(user);
            if(user){
                bcrypt.compare(userdata.password,user.Password).then((status) => {
                    if(status) {
                        console.log("Login sucess");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }else {
                        console.log("login Failed");
                        resolve({status:false});
                    }
                });
            }else {
                console.log('login failed');
                resolve({status:false})
            }
        });
    },
}