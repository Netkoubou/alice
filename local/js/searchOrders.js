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
 */
function generateSelector(user, args) {
    var sel = { '$and': [
        { is_alive: true },
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

    if (state_sel.length > 0) {
        sel['$and'].push({ '$or': state_sel });
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


/*
 * 引っこ抜いた発注から、クライアントへ返す情報を生成する。
 * DB に登録されている発注は、検索のためのユニークな ID を保持している
 * (例えば物品コード) ものの、その名前を含んでいない。
 * そのため、それらをいちいち DB に問い合わせて補填していく必要がある。
 * これも難しいことはしていないのだが、非同期 I/O であるが故のコールバックの
 * 嵐によってひどく煩雑に見える。
 */
function construct_response(orders, db, res) {
    var response        = [];
    var order_count     = 0;
    var products_count  = [];
    var is_already_sent = false;

    function lookup_product(order_index, product_index, product_code) {
        var id     = new ObjectID(product_code);
        var cursor = db.collection('products').find({ _id: id }).limit(1);

        cursor.next(function(err, product) {
            if (is_already_sent) {
                return;
            }

            if (err == null && product != null) {
                var p = response[order_index].products[product_index];

                p.name      = product.name;
                p.maker     = product.maker;
                p.min_price = product.min_price;
                p.cur_price = product.cur_price;
                p.max_price = product.max_price;

                products_count[order_index]++;

                var is_finished = false;

                if (order_count >= orders.length) {
                    is_finished = true;

                    products_count.forEach(function(c, i) {
                        if (c == null || c < orders[i].products.length) {
                            is_finished = false;
                        }
                    });
                }

                if (is_finished) {
                    res.json({ status: 0, orders: response });
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

                var msg = '[searchOrders] ' +
                          'failed to find product: "' + product_code + '".';

                log_warn.warn(msg);
            }
        });
    }

    function lookup(target, order, index) {
        var id, cursor, next_action;
        var err_msg = '[searchOrders] ';

        switch (target) {
        case 'drafter_account':
            cursor = db.collection('users').find({
                account: order.drafter_account
            }).limit(1);

            next_action = function(user) {
                response[index].drafter_account = user.account;
                lookup('last_modifier_account', order, index);
            };

            err_msg += 'failed to find user: "' + order.drafter_account + '".';
            break;
        case 'last_modifier_account':
            id     = new ObjectID(order.last_modifier_code);
            cursor = db.collection('users').find({ _id: id }).limit(1);

            next_action = function(user) {
                response[index].last_modifier_account = user.account;
                lookup('department_name', order, index);
            };

            err_msg += 'failed to find user: "' + id + '".';
            break;
        case 'department_name':
            id     = new ObjectID(order.department_code);
            cursor = db.collection('departments').find({ _id: id }).limit(1);

            next_action = function(department) {
                response[index].department_name = department.name;
                lookup('trader_name', order, index);
            };

            err_msg += 'failed to find department: "' + id + '".';
            break;
        default:
            id     = new ObjectID(order.trader_code);
            cursor = db.collection('traders').find({ _id: id }).limit(1);

            next_action = function(trader) {
                response[index].trader_name = trader.name;

                order_count++;
                products_count[index] = 0;

                order.products.forEach(function(p, i) {
                    if (is_already_sent) {
                        return;
                    }

                    response[index].products[i] = {
                        code:           p.code,
                        name:           '', // これから埋める
                        maker:          '', // これから埋める    
                        min_price:      0,  // これから埋める
                        cur_price:      0,  // これから埋める
                        max_price:      0,  // これから埋める
                        quantity:       p.quantity,
                        state:          p.state,
                        billing_amount: p.billing_amount
                    };

                    lookup_product(index, i, p.code);
                });
            }

            err_msg += 'failed to find trader: "' + order.trader_code + '".';
        }

        cursor.next(function(err, document) {
            if (is_already_sent) {
                return;
            }

            if (err == null && document != null) {
                next_action(document);
            } else {
                db.close();
                res.json({ status: 255 });
                is_already_sent = true;

                if (err != null) {
                    log_warn.warn(err);
                }

                log_warn.warn(err_msg);
            }
        });
    }

    orders.forEach(function(order, index) {
        if (is_already_sent) {
            return;
        }

        response[index] = {
            order_id:        0,     // 不要 (DBMS に MySQL を用いる場合に必要)
            order_code:      order.order_code,
            order_type:      order.order_type,
            order_state:     order.order_state,
            order_remark:    order.order_remark,
            order_version:   order.order_version,
            drafting_date:   order.drafting_date,
            drafter_account: '',    // これから埋める
            department_code: order.department_code,
            department_name: '',    // これから埋める
            trader_code:     order.trader_code,
            trader_name:     '',    // これから埋める

            products: [],

            last_modified_date:    order.last_modified_date,
            last_modifier_code:    order.last_modifier_code,
            last_modifier_account: ''   // これから埋める
        };
            
        lookup('drafter_account', order, index);
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

        db.collection('orders').find(sel).toArray(function(err, orders) {
            if (err == null) {
                if (orders.length == 0) {
                    res.json({ status: 0, orders: [] });
                } else {
                    construct_response(orders, db, res);
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
