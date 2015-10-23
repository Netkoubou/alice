'use strict';
var ObjectID = require('mongodb').ObjectID;
var util     = require('./util');

function pick_all(db, res) {
    var cd = db.collection('departments');
    var cc = db.collection('categories');
    var ct = db.collection('traders');
    
    cd.find().toArray(function(err, ds) {
        if (err != null) {
            db.close();
            res.json({ status: 255 });
        } else {
            cc.find().toArray(function(err, cs) {
                if (err != null) {
                    db.close();
                    res.json({ status: 255 });
                } else {
                    ct.find().toArray(function(err, ts) {
                        db.close();

                        if (err != null) {
                            res.json({ status: 255 });
                        } else {
                            var departments = ds.map(function(d) {
                                return { code: d._id, name: d.name };
                            });

                            var categories = cs.map(function(c) {
                                return { code: c._id, name: c.name };
                            });

                            var traders = ts.map(function(t) {
                                return { code: t._id, name: t.name };
                            });
                            
                            res.json({
                                status:      0,
                                departments: departments,
                                categories:  categories,
                                traders:     traders
                            });
                        }
                    });
                }
            });
        }
    });
}

function pick_step_by_step(user, db, res) {
    var categories     = [];
    var traders        = [];
    var departments    = [];
    var count_products = 0; // 最後の product かを判定するためのカウンタ

    function pick_traders(product, num_of_products) {
        var id     = new ObjectID(product.trader);
        var cursor = db.collection('traders').find({ _id: id }).limit(1);

        cursor.next(function(err, trader) {
            traders.push({
                code: trader._id,
                name: trader.name
            });


            /*
             * 非同期処理なので、どのコールバックがどの順番で実行されるのかは
             * 分からない。
             * そこで product の処理が 1 個終わるごとに count_products を
             * インクリメントして、
             *
             *   count_produc == num_of_products 
             *
             * で判定するようにした。
             * シングルスレッドであるため、複数のコールバックが同時に
             * 走ることはない。
             * よって、排他制御は不要。これは楽だけど、非同期処理による
             * コールバックの嵐はマジ勘弁。
             */
            count_products++;

            if (count_products == num_of_products) {
                /*
                 * users に登録された情報が間違っていない限り、
                 * departments は重複しない。
                 * 但し、categories と traders は重複する可能性があるため、
                 * uniq する。
                 */
                var eq = function(x, y) { return x.code === y.code };

                categories = util.uniq(categories, eq);
                traders    = util.uniq(traders,    eq);

                res.json({
                    status:      0,
                    departments: departments,
                    categories:  categories,
                    traders:     traders
                });

                db.close();
            }
        })
    }

    function pick_categories(product, num_of_products) {
        var id     = new ObjectID(product.category);
        var cursor = db.collection('categories').find({ _id: id }).limit(1);

        cursor.next(function(err, category) {
            categories.push({
                code: category._id,
                name: category.name
            });

            pick_traders(product, num_of_products);
        });
    }

    function pick_departments() {
        user.departments.forEach(function(d, i) {
            var id     = new ObjectID(d.code);
            var cursor = db.collection('departments').find({ _id: id });

            cursor.limit(1).next(function(err, department) {
                if (department != null) {
                    departments.push({
                        code: department._id,
                        name: department.name
                    });
                }

                if (user.departments.length == i + 1) {
                    var collection = db.collection('products');
                    var sel = {
                        '$or': user.departments.map(function(d) {
                            return { departments: new ObjectID(d.code) }
                        })
                    };

                    collection.find(sel).toArray(function(err, products) {
                        products.forEach(function(p, i) {
                            pick_categories(p, products.length);
                        });
                    });
                }
            });
        });
    }

    pick_departments();
}

module.exports = function(req, res) {
    util.query(function(db) {
        var users   = db.collection('users');
        var user_id = new ObjectID(req.session.user_id);

        users.find({ _id: user_id }).next(function(err, user) {
            if (user != null) {
                var draft_ordinarily = user.privileged.draft_ordinarily;
                var draft_urgently   = user.privileged.draft_urgently;

                if (draft_ordinarily || draft_urgently) {
                    pick_all(db, res);
                } else {
                    pick_step_by_step(user, db, res);
                }
            } else {
                res.json({ status: 255 });
            }
        });
    });
};
