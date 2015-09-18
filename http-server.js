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
            price:        2500000
        },
        {
            product_code: '0001',
            product_name: 'b',
            maker:  'Y',
            price:  24.01
        },
        {
            product_code: '0002',
            product_name: 'c',
            maker: 'X',
            price:  23.02
        },
        {
            product_code: '0003',
            product_name: 'd',
            maker: 'W',
            price:  22.03
        },
        {
            product_code: '0004',
            product_name: 'e',
            maker: 'V',
            price:  21.04
        },
        {
            product_code: '0005',
            product_name: 'f',
            maker: 'U',
            price:  20.05
        },
        {
            product_code: '0006',
            product_name: 'g',
            maker: 'T',
            price:  19.06
        },
        {
            product_code: '0007',
            product_name: 'h',
            maker: 'S',
            price:  18.07
        },
        {
            product_code: '0008',
            product_name: 'i',
            maker: 'R',
            price:  17.08
        },
        {
            product_code: '0009',
            product_name: 'j',
            maker: 'Q',
            price:  16.09
        },
        {
            product_code: '0010',
            product_name: 'k',
            maker: 'P',
            price:  15.10
        },
        {
            product_code: '0011',
            product_name: 'l',
            maker: 'O',
            price:  14.11
        },
        {
            product_code: '0012',
            product_name: 'm',
            maker: 'N',
            price:  13.12
        },
        {
            product_code: '0013',
            product_name: 'n',
            maker: 'M',
            price:  12.13
        },
        {
            product_code: '0014',
            product_name: 'o',
            maker: 'L',
            price:  11.14
        },
        {
            product_code: '0015',
            product_name: 'p',
            maker: 'K',
            price:  10.15
        },
        {
            product_code: '0016',
            product_name: 'q',
            maker: 'J',
            price:   9.16
        },
        {
            product_code: '0017',
            product_name: 'r',
            maker: 'I',
            price:   8.17
        },
        {
            product_code: '0018',
            product_name: 's',
            maker: 'H',
            price:   7.18
        },
        {
            product_code: '0019',
            product_name: 't',
            maker: 'G',
            price:   6.19
        },
        {
            product_code: '0020',
            product_name: 'u',
            maker: 'F',
            price:   5.20
        },
        {
            product_code: '0021',
            product_name: 'v',
            maker: 'E',
            price:   4.21
        },
        {
            product_code: '0022',
            product_name: 'w',
            maker: 'D',
            price:   3.22
        },
        {
            product_code: '0023',
            product_name: 'x',
            maker: 'C',
            price:   2.23
        },
        {
            product_code: '0024',
            product_name: 'y',
            maker: 'B',
            price:   1.24
        },
        {
            product_code: '0025',
            product_name: 'z',
            maker: 'A',
            price:   0.25
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
    res.json({
        status: 0
    });
});


/*
 * 発注の検索
 */
app.post('/searchOrders', function(req, res) {
    console.log(req.body);
    res.json({
        status: 0,
        orders: [{
            order_code: '0000',
            order_type: 'ORDINARY_ORDER',
            order_state: 'REQUESTING',
            drafting_date:  '2015/08/01',
            last_edit_date: '2015/08/01',
            originator_code: '1853',
            originator_name: 'm-perry',
            last_editor_code: '1853',
            last_editor_name: 'm-perry',
            department_code: '0000',
            department_name: '外科',
            trader_code: '0000',
            trader_name: '阿漕商店',
            products: [
                {
                    code:        '0000',
                    name:        'タイガーマスク',
                    maker:       '梶原一騎',
                    order_price: 42.19,
                    final_price: 43.00,
                    quantity:    8,
                    state:       'PROCESSING',
                    last_change_date: '2014/03/24'
                },
                {
                    code: '4126',
                    name: 'マングローブ',
                    maker:    '亜熱帯潮間帯',
                    order_price:    11.92,
                    final_price:    11.92,
                    quantity: 3,
                    state:    'ORDERED',
                    last_change_date: '2015/10/10'
                }
            ],
            last_modified_date: '2015/10/10',
            last_modifier_code: '1603',
            last_modifier_name: 'i-tokugawa'
        }],
    });
});
        
app.listen(8080);
