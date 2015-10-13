/*
 * テスト用 HTTP サーバ。
 * 通常の HTTP リクエストに対しては正規のレスポンスを返す。
 * Ajax のリクエストに対しては、適当な (それっぽい)  JSON を返す。
 */
'use strict';
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();


/*
 * 通常の HTTP リクエスト用
 */
app.use(express.static('public') );


/*
 * POST されてきた JSON のデコード用
 */
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }) );


/*
 * ダミーデータ
 */
var traders = [
    { code: '0', name: '阿漕商店' },
    { code: '1', name: 'バッタモン市場' },
    { code: '2', name: '贋物マーケット' },
    { code: '3', name: 'エセショップ' },
    { code: '4', name: 'Cwm fjord veg balks nth pyx quiz' }
];


/*
 * ログイン
 */
app.post('/authenticateUser', function(req, res) {
    var account    = req.body.account;
    var passphrase = req.body.passphrase;

    if (account === 'm-perry' && passphrase === 'jesus') {
        res.json({
            status: 0,
            user: {
                is_privileged: false,
                is_admin:      false,
                is_medical:    false,
                is_urgency:    false,
                is_approval:   false
            }
        });
    } else if (account === 't-harris' && passphrase === 'jesus') {
        res.json({
            status: 0,
            user: {
                is_privileged: true,
                is_admin:      true,
                is_medical:    false,
                is_urgency:    false,
                is_approval:   true
            }
        });
    } else if (account === 'j-mung' && passphrase === 'jesus') {
        res.json({
            status: 0,
            user: {
                is_privileged: false,
                is_admin:      false,
                is_medical:    true,
                is_urgency:    true,
                is_approval:   false
            }
        });
    } else {
        res.json({ status: 1 });
    }
});


/*
 * ログアウト
 */
app.get('/logout', function(req,res) {
    res.json({ status: 0 });
});


/*
 * 発注画面の SearchPane から発行される品目と販売元の検索リクエスト
 */
app.get('/pickMenuItemsForSearchPane', function(req, res) {
    var categories = [
        { code: '0000', name: '凄いアレ' },
        { code: '0001', name: '驚きのナニ' },
        { code: '0002', name: 'ありえないソレ' },
        { code: '0003', name: '感動のコレ' },
    ];

    var departments;
    
    if (Math.random() < 0.5) {
        departments = [
            { code: '0000', name: '外科' },
            { code: '0001', name: '内科' },
            { code: '0002', name: '中科' },
            { code: '0003', name: '小児科' },
            { code: '0004', name: '眼科' }
        ];
    } else {
        departments = [{ code: '0000', name: '外科' }];
    }
    
    res.json({
        status:      0,
        departments: departments,
        categories:  categories,
        traders:     traders
    });
});


/*
 * 発注画面の SearchPane から発行される品名候補の検索リクエスト
 */
app.post('/searchCandidates', function(req, res) {
    var candidates = [
        {
            product_code: '0000',
            product_name: 'The quick brown fox jumps over the lazy dog',
            maker:        'J.Q. Vandz struck my big fox whelp',
            min_price:        0,
            cur_price:        2499999,
            max_price:        2500000
        },
        {
            product_code: '0001',
            product_name: 'b',
            maker:  'Y',
            min_price:  24.00,
            cur_price:  24.01,
            max_price:  24.02
        },
        {
            product_code: '0002',
            product_name: 'c',
            maker: 'X',
            min_price:  23.03,
            cur_price:  23.04,
            max_price:  23.05
        },
        {
            product_code: '0003',
            product_name: 'd',
            maker: 'W',
            min_price:  22.06,
            cur_price:  22.07,
            max_price:  22.08
        },
        {
            product_code: '0004',
            product_name: 'e',
            maker: 'V',
            min_price:  21.09,
            cur_price:  21.10,
            max_price:  21.11
        },
        {
            product_code: '0005',
            product_name: 'f',
            maker: 'U',
            min_price:  20.12,
            cur_price:  20.13,
            max_price:  20.14
        },
        {
            product_code: '0006',
            product_name: 'g',
            maker: 'T',
            min_price:  19.15,
            cur_price:  19.16,
            max_price:  19.17
        },
        {
            product_code: '0007',
            product_name: 'h',
            maker: 'S',
            min_price:  18.18,
            cur_price:  18.19,
            max_price:  18.20
        },
        {
            product_code: '0008',
            product_name: 'i',
            maker: 'R',
            min_price:  17.21,
            cur_price:  17.22,
            max_price:  17.23
        },
        {
            product_code: '0009',
            product_name: 'j',
            maker: 'Q',
            min_price:  16.24,
            cur_price:  16.25,
            max_price:  16.26
        },
        {
            product_code: '0010',
            product_name: 'k',
            maker: 'P',
            min_price:  15.27,
            cur_price:  15.28,
            max_price:  15.29
        },
        {
            product_code: '0011',
            product_name: 'l',
            maker: 'O',
            min_price:  14.30,
            cur_price:  14.31,
            max_price:  14.32
        },
        {
            product_code: '0012',
            product_name: 'm',
            maker: 'N',
            min_price:  13.33,
            cur_price:  13.34,
            max_price:  13.35
        },
        {
            product_code: '0013',
            product_name: 'n',
            maker: 'M',
            min_price:  12.36,
            cur_price:  12.37,
            max_price:  12.38
        },
        {
            product_code: '0014',
            product_name: 'o',
            maker: 'L',
            min_price:  11.39,
            cur_price:  11.40,
            max_price:  11.41
        },
        {
            product_code: '0015',
            product_name: 'p',
            maker: 'K',
            min_price:  10.42,
            cur_price:  10.43,
            max_price:  10.44
        },
        {
            product_code: '0016',
            product_name: 'q',
            maker: 'J',
            min_price:   9.45,
            cur_price:   9.46,
            max_price:   9.47
        },
        {
            product_code: '0017',
            product_name: 'r',
            maker: 'I',
            min_price:   8.48,
            cur_price:   8.49,
            max_price:   8.50
        },
        {
            product_code: '0018',
            product_name: 's',
            maker: 'H',
            min_price:   7.51,
            cur_price:   7.52,
            max_price:   7.53
        },
        {
            product_code: '0019',
            product_name: 't',
            maker: 'G',
            min_price:   6.54,
            cur_price:   6.55,
            max_price:   6.56
        },
        {
            product_code: '0020',
            product_name: 'u',
            maker: 'F',
            min_price:   5.57,
            cur_price:   5.58,
            max_price:   5.59
        },
        {
            product_code: '0021',
            product_name: 'v',
            maker: 'E',
            min_price:   4.60,
            cur_price:   4.61,
            max_price:   4.62
        },
        {
            product_code: '0022',
            product_name: 'w',
            maker: 'D',
            min_price:   3.63,
            cur_price:   3.64,
            max_price:   3.65
        },
        {
            product_code: '0023',
            product_name: 'x',
            maker: 'C',
            min_price:   2.67,
            cur_price:   2.68,
            max_price:   2.69
        },
        {
            product_code: '0024',
            product_name: 'y',
            maker: 'B',
            min_price:   1.70,
            cur_price:   1.71,
            max_price:   1.72
        },
        {
            product_code: '0025',
            product_name: 'z',
            maker: 'A',
            min_price:   0.73,
            cur_price:   0.74,
            max_price:   0.75
        }
    ];

    if (req.body.trader_code != '') {
        candidates = candidates.map(function(c) {
            c.trader_code = req.body.trader_code;
            c.trader_name = traders[parseInt(req.body.trader_code)].name;

            return c;
        });
    } else {
        candidates = candidates.map(function(c, i) {
            c.trader_code = (i % traders.length).toString();
            c.trader_name = traders[(i % traders.length)].name;

            return c;
        });
    }

    res.json({ status: 0, candidates: candidates });
});


/*
 * 発注の新規登録
 */
app.post('/registerOrder', function(req, res) {
    console.log(req.body);
    res.json({ status: 0, order_code: '0893' });
});


/*
 * 既存の発注の更新
 */
app.post('/updateOrder', function(req, res) {
    console.log(req.body);
    res.json({ status: 0 });
});


/*
 * 既存の発注の消去
 */
app.post('/eraseOrder', function(req, res) {
    console.log(req.body);
    res.json({ status: 0 });
});


/*
 * 発注の状態変更
 */
app.post('/changeOrderState', function(req, res) {
    console.log(req.body);
    res.json({ status: 0 });
});


/*
 * 発注の検索
 */
app.post('/searchOrders', function(req, res) {
    console.log(req.body);
    res.json({
        status: 0,
        orders: [{
            order_code:      '0000',
            order_type:      'ORDINARY_ORDER',
            order_state:     'REQUESTING',
            order_remark:    'なにそのチョンマゲ',
            drafting_date:   '2015/08/01',
            drafter_code:    '1853',
            drafter_account: 'm-perry',
            department_code: '0001',
            department_name: '内科',
            trader_code:     '0000',
            trader_name:     '阿漕商店',
            products: [
                {
                    code:     '0000',
                    name:     'タイガーマスク',
                    maker:    '梶原一騎',
                    min_price:    43.00,
                    cur_price:    43.01,
                    max_price:    43.02,
                    quantity: 8,
                    state:    'PROCESSING',
                    billing_amount:      0,
                    last_edited_date:    '2015/08/01',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                },
                {
                    code:     '4126',
                    name:     'マングローブ',
                    maker:    '亜熱帯潮間帯',
                    min_price:    11.92,
                    cur_price:    11.92,
                    max_price:    11.92,
                    quantity: 3,
                    state:    'ORDERED',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/11',
                    last_editor_code:    '1192',
                    last_editor_account: 'y-minamoto',
                }
            ],
            last_modified_date:    '2015/10/10',
            last_modifier_code:    '1603',
            last_modifier_account: 'y-tokugawa'
        },
        {
            order_code:      '4219',
            order_type:      'URGENCY_ORDER',
            order_state:     'APPROVING',
            order_remark:    'それで何を表現しようと言うの?',
            drafting_date:   '2015/08/01',
            drafter_code:    '1853',
            drafter_account: 'm-perry',
            department_code: '0002',
            department_name: '中科',
            trader_code:     '0001',
            trader_name:     'バッタモン市場',
            products: [
                {
                    code:     '0001',
                    name:     '危険薬',
                    maker:    '酩酊ラリ子',
                    min_price:    43.01,
                    cur_price:    43.02,
                    max_price:    43.03,
                    quantity: 666,
                    state:    'PROCESSING',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                },
                {
                    code: '   0645',
                    name:     'STAP細胞',
                    maker:    '小保方製薬',
                    min_price:    11.92,
                    cur_price:    11.92,
                    max_price:    11.92,
                    quantity: 9,
                    state:    'ORDERED',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                }
            ],
            last_modified_date: '2015/10/10',
            last_modifier_code: '1603',
            last_modifier_account: 'k-katsu'
        },
        {
            order_code:      '1818',
            order_type:      'ORDINARY_ORDER',
            order_state:     'APPROVED',
            order_remark:    '開国いいよ〜',
            drafting_date:   '2015/03/02',
            drafter_code:    '1853',
            drafter_account: 'm-perry',
            department_code: '0000',
            department_name: '外科',
            trader_code:     '0001',
            trader_name:     'バッタモン市場',
            products: [
                {
                    code:     '0710',
                    name:     'アレ',
                    maker:    '秘密のアッコちゃん',
                    min_price:    893.00,
                    cur_price:    893.01,
                    max_price:    893.02,
                    quantity: 42,
                    state:    'PROCESSING',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                },
                {
                    code: '   0794',
                    name:     'ソレ',
                    maker:    'クレヨンしんちゃん',
                    min_price:    29.29,
                    cur_price:    29.92,
                    max_price:    29.92,
                    quantity: 9,
                    state:    'ORDERED',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                },
                {
                    code: '   1333',
                    name:     'ナニ',
                    maker:    'ちびまるこちゃん',
                    min_price:    41.35,
                    cur_price:    41.41,
                    max_price:    41.92,
                    quantity: 9,
                    state:    'CANCELED',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                },
                {
                    code: '   1549',
                    name:     'ドレ?',
                    maker:    'サザエさん',
                    min_price:    33.00,
                    cur_price:    33.50,
                    max_price:    33.99,
                    quantity: 1000,
                    state:    'DELIVERED',
                    billing_amount:      33800,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                }
            ],
            last_modified_date: '2015/10/10',
            last_modifier_code: '1603',
            last_modifier_account: 'k-katsu'
        },
        {
            order_code:      '4351',
            order_type:      'MEDS_ORDER',
            order_state:     'DENIED',
            order_remark:    '怒り? 哀しみ? 喜び? 喜怒哀楽?',
            drafting_date:   '2015/08/01',
            drafter_code:    '1853',
            drafter_account: 'm-perry',
            department_code: '0003',
            department_name: '小児科',
            trader_code:     '0003',
            trader_name:     'エセショップ',
            products: [
                {
                    code:     '0001',
                    name:     '危険薬',
                    maker:    '酩酊ラリ子',
                    min_price:    42.19,
                    cur_price:    42.19,
                    max_price:    42.19,
                    quantity: 666,
                    state:    'PROCESSING',
                    billing_amount:      0,
                    last_edited_date:    '2015/09/18',
                    last_editor_code:    '1853',
                    last_editor_account: 'm-perry',
                },
            ],
            last_modified_date:    '2015/10/10',
            last_modifier_code:    '1603',
            last_modifier_account: 'k-katsu'
        }],
    });
});
        
app.listen(8080);
