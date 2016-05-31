'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('ctitical');


/*
 * ユーザが所属する部門診療科と係わる品目 (のコードと名前) 及び販売元 (の
 * コードと名前) を、以下のように割り出して行く。
 *
 *   1. ユーザが所属する部門診療科のコード (user.departments) に紐付く名前を、
 *      departments コレクションから割り出す。
 *   2. ユーザが所属する部門診療科が発注可能な物品を products コレクション
 *      から割り出す
 *   3. その検索に引っかかった物品から、品目 (product.category_code) と販売元
 *      (product.trader_code) のコードを割り出す
 *   4. 更に品目と販売元の名前を categories コレクションと traders コレク
 *      ションから割り出す。
 *
 * コレクションに跨がった find を非同期 ID でコーディングするのはマジ発狂
 * したくなるレベル。
 * でも、これを読む方はもっと大変な気がする。
 *
 * とりあえず、販売元を割り出すコード (retrieve_traders)、
 * 品目を割り出すコード (retrieve_categories)、部門診療科の名前を割り出す
 * コード (retrieve_departments) を function で分割、最後に retrieve_traders
 * を呼び出す、というどこぞの教科書のような実装をしてみた。
 */
function retrieve_step_by_step(user, order_type, db, res) {
    var categories      = [];
    var traders         = [];
    var departments     = [];
    var count_products  = 0; // 最後の product かを判定するためのカウンタ
    var is_already_sent = false;


    /*
     * ユーザが所属する部門診療科が発注可能な物品 1 個の販売元のコードと
     * 名前を割り出す。
     *
     * 全ての物品について、品目と販売元の割り出しが完了したら、
     * クライアントに結果を返す。
     */
    function retrieve_traders(product, num_of_products) {
        db.collection('traders').find({
            is_alive: true,
            _id:      new ObjectID(product.trader_code)
        }).limit(1).next(function(err, trader) {
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
                 *   count_products == num_of_products 
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
                    var eq = function(x, y) {
                        return x.code.toString() === y.code.toString()
                    };

                    res.json({
                        status:      0,
                        departments: departments,
                        categories:  util.uniq(categories, eq),
                        traders:     util.uniq(traders,    eq)
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
                          'failed to find trader: "' +
                          product.trader_code + '".';

                log_warn.warn(msg);
            }
        });
    }


    /*
     * ユーザが所属する部門診療科が発注可能な物品 1 個の品目のコードと
     * 名前を割り出す。
     */
    function retrieve_categories(product, num_of_products) {
        db.collection('categories').find({
            is_alive: true,
            _id:      new ObjectID(product.category_code)
        }).limit(1).next(function(err, category) {
            if (is_already_sent) {
                return;
            }

            if (err == null && category != null) {
                categories.push({
                    code: category._id,
                    name: category.name
                });

                retrieve_traders(product, num_of_products);
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to find category: "' +
                          product.category_code + '".';

                log_warn.warn(msg);
            }
        });
    }


    /*
     * ユーザの所属する部門診療科が発注可能な物品を products コレクション
     * から割り出す。
     * そして割り出した物品の情報から、更にその品目コード (category_code) と
     * 販売元のコード (trader_code) を割り出すのだが、
     * 物品情報はそれらを割り出すために利用するだけ。
     * クライアントには返さない。
     */
    function retrieve_products() {
        var user_department_codes = user.departments.map(function(d) {
            return { department_codes: new ObjectID(d.code) };
        });

        db.collection('products').find({
            is_alive: true,
            '$or':    user_department_codes
        }).toArray(function(err, products) {
            if (is_already_sent) {
                return;
            }

            if (err == null && products.length > 0) {
                products.forEach(function(p) {
                    if (is_already_sent) {
                        return;
                    }

                    retrieve_categories(p, products.length);
                });
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                var msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to access "products" collection.';

                log_warn.warn(msg);
            }
        });
    }


    /*
     * ユーザの情報から、所属する部門診療科のコードを引っこ抜く。
     * クライアントにはそれぞれのコードに対応する名前のペアを返すのだが、
     * ユーザの情報は診療科のコードしか持っていない。
     * そこで、departments コレクションから部門診療科のコードに対応する
     * 名前を引くようにしている。
     */
    function retrieve_departments() {
        user.departments.forEach(function(d, i) {
            if (is_already_sent) {
                return;
            }

            var is_target = false;

            if (order_type === 'ORDINARY_ORDER' && d.draft_ordinarily) {
                /*
                 * 通常発注なので、通常発注権限を持っている部門診療科が対象
                 */
                is_target = true;
            }

            if (order_type === 'URGENCY_ORDER' && d.draft_urgently) {
                // 緊急発注でも同じ
                is_target = true;
            }

            if (!is_target) {
                if (user.departments.length == i + 1) {
                    retrieve_products();
                }

                return;
            }

            db.collection('departments').find({
                is_alive: true,
                _id:      new ObjectID(d.code)
            }).limit(1).next(function(err, department) {
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
                        retrieve_products();
                    }
                } else {
                    db.close();
                    res.json({ status: 255 });
                    is_already_sent = true;

                    if (err != null) {
                        log_warn.warn(err);
                    }

                    msg = '[pickMenuItemsForSearchPane] ' +
                          'failed to find department: "' + d.code + '".';

                    log_warn.warn(msg);
                }
            });
        });
    }

    retrieve_departments();
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[pickMenuItemsForSearchPane] invalid session.');
        return;
    }

    util.query(function(db) {
        var order_type       = req.body.order_type;
        var draft_ordinarily = req.session.user.privileged.draft_ordinarily;
        var draft_urgently   = req.session.user.privileged.draft_urgently;

        if (order_type === 'ORDINARY_ORDER' && draft_ordinarily) {
            /*
             * 全部門診療科に跨がって通常発注を起案できるユーザは、
             * 全ての部門診療科 (departments)、品目 (categories)、
             * 販売元 (traders) が選択対象となる。
             */
            util.retrieve_all_departments_categories_traders(res, db);
        } else if (order_type === 'URGENCY_ORDER' && draft_urgently) {
            // 全部門診療科に跨がって緊急発注を起案できるユーザは、以下同文
            util.retrieve_all_departments_categories_traders(res, db);
        } else {
            /*
             * 自分の所属する部門診療科の通常発注 and/or 緊急発注しか
             * 起案できない
             */
            retrieve_step_by_step(req.session.user, order_type, db, res);
        }
    });
};
