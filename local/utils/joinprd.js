#!/usr/bin/env node

var ObjectID = require('mongodb').ObjectID;
var util     = require('../js/util');

function usage() {
    console.log('usage: joinprd.js new-abbr orig-abbr');
}

if (process.argv.length != 4) {
    usage();
    return;
}

var new_abbr  = process.argv[2];
var orig_abbr = process.argv[3];

util.query(function(db) {
    db.collection('departments').find({
        abbr: new_abbr
    }).toArray(function(err, ds) {
        if (err) {
            console.log('Failed to connect with department collection.');
            db.close();
            return ;
        }

        if (ds.length == 0) {
            console.log('No such abbr of department: ' + new_abbr + '.');
            db.close();
            return;
        } else if (ds.length > 1) {
            console.log('"' + abbr + '" is duplicated.');
            db.close();
            return;
        }

        var new_dep_id = ds[0]._id;

        db.collection('departments').find({
            abbr: orig_abbr
        }).toArray(function(err, ds) {
            if (err) {
                console.log('Failed to connect with department collection.');
                db.close();
                return ;
            }

            if (ds.length == 0) {
                console.log('No such abbr of department: ' + orig_abbr + '.');
                db.close();
                return;
            } else if (ds.length > 1) {
                console.log('"' + orig_abbr + '" is duplicated.');
                db.close();
                return;
            }

            var orig_dep_id = ds[0]._id;

            db.collection('products').find().toArray(function (err, ps) {
                if (err) {
                    console.log('Failed to connect with products collection.');
                    db.close();
                    return;
                }

                var targets = ps.filter(function(p) {
                    var is_target  = false;
                    var is_already = false;

                    p.department_codes.forEach(function(c) {
                        if (c.toString() === new_dep_id.toString() ) {
                            is_already = true;
                        }

                        if (c.toString() === orig_dep_id.toString() ) {
                            is_target = true;
                        }
                    });

                    return !is_already && is_target;
                });

                if (targets.length == 0) {
                    console.log('No target.');
                    db.close();
                    return;
                }

                var finished = 0;

                targets.forEach(function(t) {
                    t.department_codes.push(new_dep_id);

                    db.collection('products').updateOne(
                        { _id: t._id },
                        { '$set': { department_codes: t.department_codes } },
                        function () {
                            finished++;

                            console.log('"' + t.name + '" was set.');

                            if (finished == targets.length) {
                                db.close();
                                console.log('finished.');
                            }
                        }
                    );
                });
            });
        });
    });
});
