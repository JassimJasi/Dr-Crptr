const client = require('twilio')('AC94f9187080c646e5ee387a4a257a70e7','210083f9fe10c6ec105bc6d8b1c383e5');
const serviceId = 'VA29e3ee42649f27699e9feb60cf1b2dbf';

module.exports = {
    getOTP: (nodata) => {
        let res = {}
        return new Promise ((resolve, reject) => {
            client.verify.services(serviceId).verifications.create({
                to:`+91${nodata}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)
            })
        });
    },
    otpVerify: (otpdata , nodata) => {
        console.log("otpVeryify__",nodata);
        let response = {}
        return new Promise(async (resolve,reject) => {
            client.verify.services(serviceId).verificationChecks.create ({
                to: `+91${nodata}`,
                code: otpdata.otp
            }).then((response) => {
                resolve(response)
                console.log("otpVeryify__",response);
            })
        })
    }
}