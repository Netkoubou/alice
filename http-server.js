/*
 * テスト用 HTTP サーバ。
 * 通常の HTTP リクエストに対しては正規のレスポンスを返す。
 * Ajax のリクエストに対しては、適当な (それっぽい)  JSON を返す。
 */
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();


/*
 * 通常の HTTP リクエスト用
 */
app.use(express.static('public') );


/*
 * ダミーデータ
 */


/*
 * 発注画面の SearchPane から発行される品目と販売元の検索リクエスト
 */
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }) );
app.post('/pickMenuItemsForSearchPane', function(req, res) {
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
    
    traders = [
        { code: '0', name: '阿漕商店' },
        { code: '1', name: 'バッタモン市場' },
        { code: '2', name: '贋物マーケット' },
        { code: '3', name: 'エセショップ' },
        { code: '4', name: 'Cwm fjord veg balks nth pyx quiz' }
    ];

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
            maker:  {
                code: '0000',
                name: 'J.Q. Vandz struck my big fox whelp'
            },
            price:  2500000
        },
        {
            goods:  { code: '0001', name: 'b'  },
            maker:  { code: '0001', name: 'Y'  },
            price:  24
        },
        {
            goods:  { code: '0002', name: 'c'  },
            maker:  { code: '0002', name: 'X'  },
            price:  23
        },
        {
            goods:  { code: '0003', name: 'd'  },
            maker:  { code: '0003', name: 'W'  },
            price:  22
        },
        {
            goods:  { code: '0004', name: 'e'  },
            maker:  { code: '0004', name: 'V'  },
            price:  21
        },
        {
            goods:  { code: '0005', name: 'f'  },
            maker:  { code: '0005', name: 'U'  },
            price:  20
        },
        {
            goods:  { code: '0006', name: 'g'  },
            maker:  { code: '0006', name: 'T'  },
            price:  19
        },
        {
            goods:  { code: '0007', name: 'h'  },
            maker:  { code: '0007', name: 'S'  },
            price:  18
        },
        {
            goods:  { code: '0008', name: 'i'  },
            maker:  { code: '0008', name: 'R'  },
            price:  17
        },
        {
            goods:  { code: '0009', name: 'j'  },
            maker:  { code: '0009', name: 'Q'  },
            price:  16
        },
        {
            goods:  { code: '0010', name: 'k'  },
            maker:  { code: '0010', name: 'P'  },
            price:  15
        },
        {
            goods:  { code: '0011', name: 'l'  },
            maker:  { code: '0011', name: 'O'  },
            price:  14
        },
        {
            goods:  { code: '0012', name: 'm'  },
            maker:  { code: '0012', name: 'N'  },
            price:  13
        },
        {
            goods:  { code: '0013', name: 'n'  },
            maker:  { code: '0013', name: 'M'  },
            price:  12
        },
        {
            goods:  { code: '0014', name: 'o'  },
            maker:  { code: '0014', name: 'L'  },
            price:  11
        },
        {
            goods:  { code: '0015', name: 'p'  },
            maker:  { code: '0015', name: 'K'  },
            price:  10
        },
        {
            goods:  { code: '0016', name: 'q'  },
            maker:  { code: '0016', name: 'J'  },
            price:   9
        },
        {
            goods:  { code: '0017', name: 'r'  },
            maker:  { code: '0017', name: 'I'  },
            price:   8
        },
        {
            goods:  { code: '0018', name: 's'  },
            maker:  { code: '0018', name: 'H'  },
            price:   7
        },
        {
            goods:  { code: '0019', name: 't'  },
            maker:  { code: '0019', name: 'G'  },
            price:   6
        },
        {
            goods:  { code: '0020', name: 'u'  },
            maker:  { code: '0020', name: 'F'  },
            price:   5
        },
        {
            goods:  { code: '0021', name: 'v'  },
            maker:  { code: '0021', name: 'E'  },
            price:   4
        },
        {
            goods:  { code: '0022', name: 'w'  },
            maker:  { code: '0022', name: 'D'  },
            price:   3
        },
        {
            goods:  { code: '0023', name: 'x'  },
            maker:  { code: '0023', name: 'C'  },
            price:   2
        },
        {
            goods:  { code: '0024', name: 'y'  },
            maker:  { code: '0024', name: 'B'  },
            price:   1
        },
        {
            goods:  { code: '0025', name: 'z'  },
            maker:  { code: '0025', name: 'A'  },
            price:   0
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

app.listen(8080);
