const db = require('../config/connection');
const collection = require('../config/collections');
var objectId = require('mongodb').ObjectId;

module.exports = {
    lastFiveOrder: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({}).sort({ _id: -1 }).limit(5).toArray().then((result) => {
                resolve(result)
            }).catch(() => {
                reject()
            })
        })
    },
    totalSales: () => {
        return new Promise(async (resolve, reject) => {
            total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        totalAmount: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' }
                    }
                }
            ]).toArray()
            resolve(total[0]?.total)
        })
    },
    salesDate: () => {
        return new Promise(async (resolve, reject) => {
            total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        totalAmount: 1,
                        date: 1
                    }
                },
                {
                    $group: {
                        _id: '$date',
                        total: { $sum: '$totalAmount' }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $project:{
                        _id:1,
                        total:0
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            var totalId = total.map(function(item) {
                return item['_id'];
            });
            resolve(totalId)
        })
    },
    dailyTotalSales: () => {
        return new Promise(async (resolve, reject) => {
            total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        totalAmount: 1,
                        date: 1
                    }
                },
                {
                    $group: {
                        _id: '$date',
                        total: { $sum: '$totalAmount' }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $project:{
                        _id:0,
                        total:1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            var totalId = total.map(function(item) {
                return item['total'];
            });
            resolve(totalId)
        })
    },
    //chart 2
    statusCode: () => {
        return new Promise(async (resolve, reject) => {
            totalPending = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        status:1
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        statusCount: { $sum: 1 }
                    }
                },
               
                {
                    $project:{
                        _id:1,
                        statusCount:0
                    }
                }
            ]).toArray()
            var totalId = totalPending.map(function(item) {
                return item['_id'];
            });
            resolve(totalId)
        })
    },
    totalStatusCount: () => {
        return new Promise(async (resolve, reject) => {
            totalPending = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        status:1
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        statusCount: { $sum: 1 }
                    }
                },
               
                {
                    $project:{
                        _id:0,
                        statusCount:1
                    }
                }
            ]).toArray()
            var totalId = totalPending.map(function(item) {
                return item['statusCount'];
            });
            resolve(totalId)
        })
    },
    totalStatusCounttext: () => {
        return new Promise(async (resolve, reject) => {
            totalPending = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        status:1
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        statusCount: { $sum: 1 }
                    }
                },
               
                {
                    $project:{
                        _id:1,
                        statusCount:1
                    }
                }
            ]).toArray()
            
            var totalId = totalPending.map(function(item) {
                return item['statusCount'];
            });
            resolve(totalId)
        })
    },
}