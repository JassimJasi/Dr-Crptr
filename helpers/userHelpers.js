const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const { response } = require('express');

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
                console.log("g-login",response);
                resolve(response);
            } else {
                
                  
                   await db.get().collection(collection.USER_COLLECTION).insertOne(data).then((data1) => {
                        data._id = data1.insertedId
                        response.user = data;
                        response.status = true;
                        console.log("g-acc crear",response);
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
    }
}