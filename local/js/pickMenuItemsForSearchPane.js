'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');


/*
 * 全部門診療科に跨がって、通常発注 and/or 緊急発注を起案できるユーザは
 * 全ての部門診療科 (departments)、品目 (categories)、販売元 (traders) が
 * 選択対象となる。
 */
function pick_all(db, res) {
    var cd = db.collection('departments');
    var cc = db.collection('categories');
    var ct = db.collection('traders');
    var msg;
    
    cd.find().toArray(function(err, ds) {
        if (err != null) {
            db.close();
            res.json({ status: 255 });
            
            log_warn.warn(err);
            msg = '[pickMenuItemsForSearchPane] ' +
                  'failed to access "departments" collection.';
            log_warn.warn(msg);
        } else {
            cc.find().toArray(function(err, cs) {
                if (err != null) {
                    db.close();
                    res.json({ status: 255 });

                    log_warn.warn(err);

                    msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to access "categories" collection.';

                    log_warn.warn(msg);
                } else {
                    ct.find().toArray(function(err, ts) {
                        db.close();

                        if (err != null) {
                            res.json({ status: 255 });
                            log_warn.warn(err);

                            msg = '[pickMenuItemsForSearchPane] ' +
                                  'failed to access "traders" collection.';

                            log_warn.warn(msg);
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


/*
 * ユーザが所属する部門診療科と係わる品目 (のコードと名前) 及び販売元 (の
 * コードと名前) を、以下のように割り出して行く。
 *
 *   1. ユーザが所属する部門診療科のコード (user.departments) に紐付く名前を、
 *      departments コレクションから割り出す。
 *   2. ユーザが所属する部門診療科が発注可能な物品を products コレクション
 *      から割り出す
 *   3. その検索に引っかかった物品から、品目 (product.category) と販売元
 *      (product.trader) のコードを割り出す
 *   4. 更に品目と販売元の名前を categories コレクションと traders コレク
 *      ションから割り出す。
 *
 * コレクションに跨がった find を非同期 ID でコーディングするのはマジ発狂
 * したくなるレベル。
 * でも、これを読む方はもっと大変な気がする。
 *
 * とりあえず、販売元を割り出すコード (pick_traders)、品目を割り出すコード
 * (pick_categories)、部門診療科の名前を割り出すコード (pick_departments) を
 * function で分割、最後に pick_departments を呼び出す、というどこぞの教科書
 * のような実装をしてみた。
 */
function pick_step_by_step(user, db, res) {
    var categories      = [];
    var traders         = [];
    var departments     = [];
    var count_products  = 0; // 最後の product かを判定するためのカウンタ
    var is_already_sent = false;

    function pick_traders(product, num_of_products) {
        var id     = new ObjectID(product.trader);
        var cursor = db.collection('traders').find({ _id: id }).limit(1);

        cursor.next(function(err, trader) {
            if (is_already_sent) {
                return;
            }

            if (err == null && trader != null) {
                traders.push({
                    code: trader._id,
                    name: trader.name
                });


                /*
                 * 非同期処理なので、どのコールバックがどの順番で実行される
                 * のかは分からない。
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

                    is_already_sent = true;
                    db.close();
                }
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to find trader: "' + id + '".';

                log_warn.warn(msg);
            }
        });
    }

    function pick_categories(product, num_of_products) {
        var id     = new ObjectID(product.category);
        var cursor = db.collection('categories').find({ _id: id }).limit(1);

        cursor.next(function(err, category) {
            if (is_already_sent) {
                return;
            }

            if (err == null && category != null) {
                categories.push({
                    code: category._id,
                    name: category.name
                });

                pick_traders(product, num_of_products);
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to find category: "' + id + '".';

                log_warn.warn(msg);
            }
        });
    }

    function pick_departments() {
        user.departments.forEach(function(d, i) {
            if (is_already_sent) {
                return;
            }

            var id     = new ObjectID(d.code);
            var cursor = db.collection('departments').find({ _id: id });

            cursor.limit(1).next(function(err, department) {
                if (is_already_sent) {
                    return;
                }

                var msg;

                if (err == null && department != null) {
                    departments.push({
                        code: department._id,
                        name: department.name
                    });

                    if (user.departments.length == i + 1) {
                        var collection = db.collection('products');
                        var sel = {
                            '$or': user.departments.map(function(d) {
                                return { departments: new ObjectID(d.code) }
                            })
                        };

                        collection.find(sel).toArray(function(err, products) {
                            if (is_already_sent) {
                                return;
                            }

                            if (err != null && products.length > 0) {
                                db.close();
                                res.json({ status: 255 });
                                is_already_sent = true;

                                log_warn.warn(err);

                                msg = '[pickMenuItemsForSearchPane] ' +
                                      'failed to access ' +
                                      '"products" collection.';

                                log_warn.warn(msg);
                            } else {
                                products.forEach(function(p) {
                                    if (is_already_sent) {
                                        return;
                                    }

                                    pick_categories(p, products.length);
                                });
                            }
                        });
                    }
                } else {
                    db.close();
                    res.json({ status: 255 });
                    is_already_sent = true;

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to find department: "' + id + '".';

                    log_warn.warn(msg);
                }
            });
        });
    }

    pick_departments();
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[pickMenuItemsForSearchPane] invalid session.');
        return;
    }

    util.query(function(db) {
        var draft_ordinarily = req.session.user.privileged.draft_ordinarily;
        var draft_urgently   = req.session.user.privileged.draft_urgently;

        if (draft_ordinarily || draft_urgently) {
            /*
             * 全部門診療科に跨って通常発注 and/or 緊急発注を起案できる
             */
            pick_all(db, res);
        } else {
            /*
             * 自分の所属する部門診療科の通常発注 and/or 緊急発注しか
             * 起案できない
             */
            pick_step_by_step(req.session.user, db, res);
        }
    });
};
