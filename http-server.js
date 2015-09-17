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
    var classes = [
        { code: '0000', name: '医科' },
        { code: '0001', name: '歯科' },
        { code: '0002', name: 'ええじゃない科' },
        { code: '0003', name: 'その他' }
    ];

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
        classes:     classes,
        categories:  categories,
        departments: departments,
        traders:     traders
    });
});


/*
 * 発注画面の SearchPane から発行される品名候補の検索リクエスト
 */
app.post('/searchCandidates', function(req, res) {
    var candidates = [
        {
            goods:  {
                code: '0000',
                name: 'The quick brown fox jumps over the lazy dog'
            },
            maker: 'J.Q. Vandz struck my big fox whelp',
            price:  2500000
        },
        {
            goods:  { code: '0001', name: 'b'  },
            maker:  'Y',
            price:  24.01
        },
        {
            goods:  { code: '0002', name: 'c'  },
            maker: 'X',
            price:  23.02
        },
        {
            goods:  { code: '0003', name: 'd'  },
            maker: 'W',
            price:  22.03
        },
        {
            goods:  { code: '0004', name: 'e'  },
            maker: 'V',
            price:  21.04
        },
        {
            goods:  { code: '0005', name: 'f'  },
            maker: 'U',
            price:  20.05
        },
        {
            goods:  { code: '0006', name: 'g'  },
            maker: 'T',
            price:  19.06
        },
        {
            goods:  { code: '0007', name: 'h'  },
            maker: 'S',
            price:  18.07
        },
        {
            goods:  { code: '0008', name: 'i'  },
            maker: 'R',
            price:  17.08
        },
        {
            goods:  { code: '0009', name: 'j'  },
            maker: 'Q',
            price:  16.09
        },
        {
            goods:  { code: '0010', name: 'k'  },
            maker: 'P',
            price:  15.10
        },
        {
            goods:  { code: '0011', name: 'l'  },
            maker: 'O',
            price:  14.11
        },
        {
            goods:  { code: '0012', name: 'm'  },
            maker: 'N',
            price:  13.12
        },
        {
            goods:  { code: '0013', name: 'n'  },
            maker: 'M',
            price:  12.13
        },
        {
            goods:  { code: '0014', name: 'o'  },
            maker: 'L',
            price:  11.14
        },
        {
            goods:  { code: '0015', name: 'p'  },
            maker: 'K',
            price:  10.15
        },
        {
            goods:  { code: '0016', name: 'q'  },
            maker: 'J',
            price:   9.16
        },
        {
            goods:  { code: '0017', name: 'r'  },
            maker: 'I',
            price:   8.17
        },
        {
            goods:  { code: '0018', name: 's'  },
            maker: 'H',
            price:   7.18
        },
        {
            goods:  { code: '0019', name: 't'  },
            maker: 'G',
            price:   6.19
        },
        {
            goods:  { code: '0020', name: 'u'  },
            maker: 'F',
            price:   5.20
        },
        {
            goods:  { code: '0021', name: 'v'  },
            maker: 'E',
            price:   4.21
        },
        {
            goods:  { code: '0022', name: 'w'  },
            maker: 'D',
            price:   3.22
        },
        {
            goods:  { code: '0023', name: 'x'  },
            maker: 'C',
            price:   2.23
        },
        {
            goods:  { code: '0024', name: 'y'  },
            maker: 'B',
            price:   1.24
        },
        {
            goods:  { code: '0025', name: 'z'  },
            maker: 'A',
            price:   0.25
        }
    ];

    if (req.body.trader_code != '') {
        candidates = candidates.map(function(candidate) {
            candidate.trader = {
                code: req.body.trader_code,
                name: traders[parseInt(req.body.trader_code)].name
            }

            return candidate;
        });
    } else {
        candidates = candidates.map(function(candidate, i) {
            candidate.trader = {
                code: (i % traders.length).toString(),
                name: traders[(i % traders.length)].name
            }

            return candidate;
        });
    }

    res.json(candidates);
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
    res.json([]);
});
        
app.listen(8080);
