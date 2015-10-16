'use strict';
var mongodb = require('mongodb').MongoClient;

module.exports = function(callback) {
    var result;

    mongodb.connect('mongodb://localhost:27017/alice', function(err, db) {
        if (err != null) {
            console.log('Cannot connect with MongoDB.');
        } else {
            callback(db);
        }
    });
};
