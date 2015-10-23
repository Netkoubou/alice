'use strict';
var mongodb = require('mongodb').MongoClient;

module.exports = {
    query: function(callback) {
        var result;

        mongodb.connect('mongodb://localhost:27017/alice', function(err, db) {
            if (err != null) {
                console.log('Cannot connect with MongoDB.');
            } else {
                callback(db);
            }
        });
    },

    uniq: function(array, eq) {
        function exists(x, a) {             
            a.filter(function(y) { return eq(x, y); }).length != 0;
        }
                                                                 
        function iter(rest, ans) {
            if (rest.length < 1) {
                return ans;
            } else {   
                var car = rest[0];
                var cdr = rest.slice(1);

                if (exists(car, ans) ) {
                    return iter(cdr, ans);
                } else {         
                    return iter(cdr, ans.concat(car) );
                }
            }
        }

        if (array.length < 2) {
            return array;
        } else {                           
            return iter(array.slice(1), array.slice(0, 1) );
        }
    }
};
