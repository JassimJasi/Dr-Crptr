const mongoClient = require('mongodb').MongoClient

const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = "mongodb+srv://DrCrptr:4mLRtD6rVFGz8YAQ@cluster1.calyylm.mongodb.net/?retryWrites=true&w=majority";
    const dbname = 'DrCrptr'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db =  data.db(dbname)
        done()
    });
};

module.exports.get = function () {
    return state.db
}