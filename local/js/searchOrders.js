'use strict';
var ObjectID = require('mongodb').ObjectID;
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');


/*
 * 'orders' コレクションから、当該ユーザが参照できる発注を引っこ抜くための
 * セレクタを作る。
 * 別に難しいことはないのだが、やたらと煩雑。
 *
 * (発注番号の検索用の) 正規表現の生成に失敗した場合、セレクタの生成に失敗
 * したとして、その理由である文字列を返す。
 * それ以外はセレクタの生成に失敗することはないため、セレクタ (オブジェクト)
 * を返す。
 */
function generateSelector(user, args) {
    var sel = { '$and': [
        {
            drafting_date: {
                '$gte': args.start_date,
                '$lte': args.end_date
            }
        }
    ]};

    var state_sel = [];

    if (args.state.is_requesting) {
        state_sel.push({ order_state: 'REQUESTING' });
    }

    if (args.state.is_approving) {
        state_sel.push({ order_state: 'APPROVING' });
    }

    if (args.state.is_denied) {
        state_sel.push({ order_state: 'DENIED' });
    }

    if (args.state.is_approved) {
        state_sel.push({ order_state: 'APPROVED' });
    }

    if (args.state.is_nullified) {
        state_sel.push({ order_state: 'NULLIFIED' });
    }

    if (args.state.is_completed) {
        state_sel.push({ order_state: 'COMPLETED' });
    }

    if (args.order_code != '') {
        var order_code;

        /*
         * ここで発注番号検索用の正規表現を生成
         */
        try {
            order_code = new RegExp(args.order_code);
        } catch (e) {
            return e.message;
        }

        sel['$and'].push({ order_code: order_code });
    }

    if (args.trader_code != '') {
        sel['$and'].push({ trader_code: args.trader_code });
    }

    if (state_sel.length == 0 && args.state.is_vacant) {
        sel['$and'].push({ is_alive: false });
    } else if (state_sel.length > 0) {
        sel['$and'].push({ '$or': state_sel });

        if (!args.state.is_vacant) {
            sel['$and'].push({ is_alive: true });
        }
    }

    var pdo = user.privileged.draft_ordinarily;
    var pdu = user.privileged.draft_urgently;
    var ppo = user.privileged.process_order;
    var pa  = user.privileged.approve;

    if ( (pdo && pdu) || ppo || pa) {
        ;   // 全発注区分及び全部門診療科が対象、即ち検索条件の付与無し
    } else if (pdo) {
        sel['$and'].push({ order_type: 'ORDINARY_ORDER' });
    } else if (pdu) {
        sel['$and'].push({ order_type: 'URGENCY_ORDER' });
    }

    var complex_sel = [];

    user.departments.forEach(function(d) {
        var ddo = d.draft_ordinarily;
        var ddu = d.draft_urgently;
        var dpo = d.process_order;
        var da  = d.approve;

        if ( (ddo && ddu) || dpo || da) {
            complex_sel.push({ department_code: d.code });
        } else if (ddo) {
            complex_sel.push({
                order_type:      'ORDINARY_ORDER',
                department_code: d.code
            });
        } else if (ddu) {
            complex_sel.push({
                order_type:      'URGENCY_ORDER',
                department_code: d.code
            });
        }
    });

    if (complex_sel.length > 0) {
        sel['$and'].push({ '$or': complex_sel });
    }

    return sel;
}


function construct_response(orders, info, res) {
    var response = orders.map(function(order) {
        var department = info.departments[order.department_code];
        var trader     = info.traders[order.trader_code];

        return {
            order_id:             0,    // 不要
            order_code:           order.order_code,
            order_type:           order.order_type,
            order_state:          order.order_state,
            order_remark:         order.order_remark,
            order_version:        order.order_version,
            drafting_date:        order.drafting_date,
            drafter_account:      order.drafter_account,
            department_code:      order.department_code,

            department_name:      department.name,
            department_tel:       department.tel,

            trader_code:          order.trader_code,

            trader_name:          trader.name,
            trader_communication: trader.communication,

            products: order.products.map(function(p) {
                var product = info.products[p.code];

                return {
                    code:           p.code,

                    name:           product.name,
                    maker:          product.maker,
                    min_price:      product.min_price,
                    cur_price:      product.cur_price,
                    max_price:      product.max_price,

                    quantity:       p.quantity,
                    state:          p.state,
                    billing_amount: p.billing_amount

                };
            }),

            last_modified_date:    order.last_modified_date,
            last_modifier_code:    order.last_modifier_code,
            last_modifier_account: '',  // どうせ使わないので、このまま
            completed_date:        order.completed_date,
            is_alive:              order.is_alive
        };
    });

    res.json({ status: 0, orders: response });
}


/*
 * 引っこ抜いた発注から、クライアントへ返す情報を生成するための情報を収集する。
 * DB に登録されている発注は、検索のためのユニークな ID を保持している
 * (例えば物品コード) ものの、その名前を含んでいない。
 * そのため、それらをいちいち DB に問い合わせて補填していく必要がある。
 * これも難しいことはしていないのだが、非同期 I/O であるが故のコールバックの
 * 嵐によってひどく煩雑に見える。
 */
function collect_info(orders, db, res) {
    var info = {
        departments: {},
        traders:     {},
        products:    {}
    };

    db.collection('departments').find().toArray(function(err, docs) {
        if (err) {
            db.close();
            res.json({ status: 255 });

            var msg = '[searchOrders] ' +
                      'failed to access "departments" collection.';

            log_warn.warn(msg);
        } else {
            docs.forEach(function(d) {
                info.departments[d._id.toString()] = {
                    name: d.name,
                    tel:  d.tel
                };
            });

            db.collection('traders').find().toArray(function(err, docs) {
                if (err) {
                    db.close();
                    res.json({ status: 255 });

                    var msg = '[searchOrders] ' +
                              'failed to access "traders" collection.';

                    log_warn.warn(msg);
                } else {
                    docs.forEach(function(t) {
                        info.traders[t._id.toString()] = {
                            name:          t.name,
                            communication: t.communication
                        };
                    });
                }

                db.collection('products').find().toArray(function(err, docs) {
                    db.close();

                    if (err) {
                        res.json({ status: 255 });
                        var msg = '[searchOrders] ' +
                                  'failed to access "products" collection.';
                        log_warn.warn(msg);
                    } else {
                        docs.forEach(function(p) {
                            info.products[p._id.toString()] = {
                                name:      p.name,
                                maker:     p.maker,
                                min_price: p.min_price,
                                cur_price: p.cur_price,
                                max_price: p.max_price,
                            };
                        });

                        construct_response(orders, info, res);
                    }
                });
            });
        }
    });
}

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[searchOrders] invalid session.');
        return;
    }

    util.query(function(db) {
        var sel = generateSelector(req.session.user, req.body);

        if (typeof sel == 'string') {
            res.json({
                status: 2,
                reason: sel
            });
            return;
        }

        db.collection('orders').find(sel).toArray(function(err, orders) {
            if (err == null) {
                if (orders.length == 0) {
                    db.close();
                    res.json({ status: 0, orders: [] });
                } else {
                    collect_info(orders, db, res);
                }
            } else {
                db.close();
                res.json({ status: 255 });
                log_warn.warn(err);

                var msg = '[searchOrders] ' +
                          'failed to find at "orders" collection.';

                log_warn.warn(msg);
            }
        });
    });
};
