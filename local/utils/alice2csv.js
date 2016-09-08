'use strict';

const fs = require('fs');

function read_file(path) {
    return new Promise( (resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                console.log(`Failed to read file: ${path}.`);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function write_file(path, data) {
    return new Promise( (resolve, reject) => {
        fs.writeFile(path, data, err => {
            if (err) {
                reject(err)
            } else {
                resolve(data);
            }
        });
    });
}

const targets = [
    'products',
    'users',
    'orders',
    'costs',
    'budgets_and_incomes'
];

const sources = [
    'products',
    'categories',
    'departments',
    'traders',
    'account_titles'
];

function cost2csv(json, db) {
    const state = {
        'APPROVING': '承認待',
        'APPROVED':  '承認済',
        'REJECTED':  '却下'
    };

    const pfx = [
        json.cost_code,
        json.drafting_date,
        json.drafter_account,
        '',
        db.departments[json.department_code].name,
        '',
        state[json.cost_state],
        json.fixed_date
    ].join(',') + ',';

    let lines = [];

    json.breakdowns.forEach(b => {
        let sfx = [
            b.article,
            db.account_titles[json.account_title_code].name,
            '',
            b.price,
            b.quantity,
            b.price * b.quantity,
            b.date,
            '',
            '',
            '',
            b.note
        ];

        lines.push(pfx + sfx + '\n');
    });

    return lines.join('');
}

function order2csv(json, db) {
    if (json.products.length == 0) {
        return '';
    }

    const order_type = {
        'ORDINARY_ORDER': '通常発注',
        'URGENCY_ORDER':  '緊急発注'
    };

    const product_states = {
        'UNORDERED': '未発注',
        'ORDERED':   '発注済',
        'CANCELED':  'キャンセル',
        'DELIVERED': '納品済'
    };

    function order_state() {
        if (!json.is_alive) {
            return '欠番';
        }

        switch (json.order_state) {
        case 'REQUESTING':
            return '依頼中';
            break;
        case 'APPROVING':
            return '承認待';
            break;
        case 'APPROVED':
            if (json.products[0].state === 'UNORDERED') {
                return '承認済';
            } else {
                return '発注済';
            }
            break;
        case 'NULLIFIED':
            return '無効';
            break;
        case 'COMPLETED':
            return '完了';
            break;
        }
    }

    let pfx_json = [
        json.order_code,
        json.drafting_date,
        json.drafter_account,
        order_type[json.order_type],
        db.departments[json.department_code].name,
        db.traders[json.trader_code].name,
        order_state(),
        json.completed_date
    ];

    let lines = [];

    json.products.forEach(p => {
        let delivered_date = '';
        let price          = '';
        let product_state;

        const m = p.state.match(/^(\d{4}\/\d{2}\/\d{2})\s+(\d+(\.\d+)?)$/);

        if (m) {
            delivered_date = m[1];
            price          = m[2];
            product_state  = '納品済み';
        } else {
            product_state = product_states[p.state];
        }

        const pfx = pfx_json.join(',') + ',';
        const sfx = [
            db.products[p.code].name,
            db.categories[db.products[p.code].category_code].name,
            db.products[p.code].maker,
            db.products[p.code].price,
            p.quantity,
            db.products[p.code].price * p.quantity,
            delivered_date,
            price,
            p.billing_amount,
            product_state,
            json.order_remark
        ].join(',');

        lines.push(pfx + sfx + '\n');
    });

    return lines.join('');
}

/*
// 無駄に横に長いバージョン
function product2csv(json, db) {
    let line = [
        json.name,
        db.categories[json.category_code['$oid'] ].name,
        json.maker,
        json.is_common_item? '共通': '非共通',
        db.traders[json.trader_code['$oid'] ].name,
        json.min_price,
        json.cur_price,
        json.max_price,
        json.note,
        json.is_alive? '有効': '無効'
    ];

    json.department_codes.forEach(code => {
        line.push(db.departments[code['$oid'] ]);
    });

    return line.join(',') + '\n';
}
*/

function product2csv(json, db) {
    let line = [
        json.name,
        db.categories[json.category_code['$oid'] ].name,
        json.maker,
        json.is_common_item? '共通': '非共通',
        db.traders[json.trader_code['$oid'] ].name,
        json.min_price,
        json.cur_price,
        json.max_price,
        json.note,
        json.is_alive? '有効': '無効'
    ];

    let pfx = line.join(',');

    if (json.department_codes.length == 0) {
        return pfx + '\n';
    }

    let lines = [];

    json.department_codes.forEach(code => {
        lines.push(pfx + ',' + db.departments[code['$oid'] ].name + '\n');
    });

    return lines.join('');
}

function user2csv(json, db) {
    let line = [
        json.account,
        json.name,
        json.email,
        json.privileged.administrate?     'Yes': 'No',
        json.privileged.draft_ordinarily? 'Yes': 'No',
        json.privileged.draft_urgently?   'Yes': 'No',
        json.privileged.process_order?    'Yes': 'No',
        json.privileged.approve?          'Yes': 'No',
        json.is_alive? '有効': '無効'
    ];

    json.departments.forEach(d => {
        line.push(db.departments[d.code['$oid'] ].name);
        line.push(d.administrate?        'Yes': 'No');
        line.push(d.draft_ordinary?      'Yes': 'No');
        line.push(d.draft_urgently?      'Yes': 'No');
        line.push(d.draft_process_order? 'Yes': 'No');
        line.push(d.draft_approve?       'Yes': 'No');
    });

    return line.join(',') + '\n';
}

function budget_and_incomes2csv(json, db) {
    return [
        json.year,
        db.departments[json.department_code].name,
        json.budget,
    ].concat(json.incomes).join(',') + '\n';
}

function title_row(target) {
    switch (target) {
    case 'products':
        return '名前,'        +
               '品目,'        +
               '製造元,'      +
               '共通/非共通,' +
               '販売元,'      +
               '最低価格,'    +
               '現在価格,'    +
               '最高価格,'    +
               '備考,'        +
               '有効/無効,'   +
               '取扱部署\n';
    case 'users':
        return 'アカウント,'   +
               '名前,'         +
               'E-Mail,'       +
               '管理特権,'     +
               '通常起案特権,' +
               '緊急発注特権,' +
               '処理特権,'     +
               '承認特権,'     +
               '有効/無効,'    +
               '所属,'         +
               '管理,'         +
               '通常起案,'     +
               '緊急起案,'     +
               '処理,'         +
               '承認\n';
    case 'orders':
        return '起案番号,' +
               '起案日,'   +
               '起案者,'   +
               '発注区分,' +
               '発注元,'   +
               '販売元,'   +
               '状態,'     +
               '完了日,'   +
               '品名,'     +
               '品目,'     +
               '製造元,'   +
               '単価,'     +
               '数量,'     +
               '小計,'     +
               '納品日,'   +
               '請求単価,' +
               '請求額,'   +
               '状態,'     +
               '備考\n';
    case 'costs':
        return '起案番号,'    +
               '起案日,'      +
               '起案者,'      +
               ','            +
               '申請元,'      +
               ','            +
               '状態,'        +
               '承認日,'      +
               '品名,'        +
               '勘定科目,'    +
               ','            +
               '単価,'        +
               '数量,'        +
               '小計,'        +
               '購入日,'      +
               ','            +
               ','            +
               ','            +
               '摘要 / 備考\n';
    case 'budgets_and_incomes':
        return '年度,'       +
               '部門診療科,' +
               '予算額,'     +
                '4 月,'      +
                '5 月,'      +
                '6 月,'      +
                '7 月,'      +
                '8 月,'      +
                '9 月,'      +
               '10 月,'      +
               '11 月,'      +
               '12 月,'      +
                '1 月,'      +
                '2 月,'      +
                '3 月\n';
    }
}

function convert(txt, rule) {
    txt.split(/\n|\r\n|\r/).forEach(line => {
        if (!line.match(/^\s*$/) ) {
            const regex      = /ObjectId\(\s*("[^"]+")\s*\)/g;
            const normalized = line.replace(regex, '{"\$oid":$1}');
            rule(JSON.parse(normalized) );
        }
    });
}

function gen_csv(db) {
    function loop(i) {
        const pfx = `dump/alice/${targets[i]}`;

        read_file(`${pfx}.json`).then(txt => {
            let data = title_row(targets[i]);

            convert(txt, json => {
                switch (targets[i]) {
                case 'products':
                    data += product2csv(json, db);
                    break;
                case 'users':
                    data += user2csv(json, db);
                    break;
                case 'orders':
                    data += order2csv(json, db);
                    break;
                case 'costs':
                    data += cost2csv(json, db);
                    break;
                case 'budgets_and_incomes':
                    data += budget_and_incomes2csv(json, db);
                    break;
                }
            });

            return data;
        }).then(data => {
            write_file(`${pfx}.csv`, data).then( () => {
                if (i + 1 < targets.length) {
                    loop(i + 1);
                } else {
                    console.log('finished.');
                }
            }).catch(err => {
                console.log(`Failed to write file: ${path}.csv.`);
                console.log(err);
            });
        }).catch(err => {
            console.log(`Failed to read file: ${path}.json.`);
            console.log(err);
        });
    }

    loop(0);
}

function construct_db() {
    return new Promise( (resolve, reject) => {
        let db = {};

        function loop(i) {
            read_file(`dump/alice/${sources[i]}.json`).then(txt => {
                convert(txt, json => {
                    let data = { name: json.name };

                    if (sources[i] === 'products') {
                        data.price         = json.cur_price;
                        data.maker         = json.maker;
                        data.category_code = json.category_code['$oid'];
                    }

                    db[sources[i] ][json._id['$oid'] ] = data;
                });

                if (i + 1 < sources.length) {
                    loop(i + 1);
                }  else {
                    resolve(db);
                }
            }).catch(err => reject(err) );
        }

        sources.forEach(src => db[src] = {});
        loop(0);
    });
}

construct_db().then(gen_csv).catch(err => console.log(err) );
