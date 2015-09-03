/*
 * テスト用 HTTP サーバ。
 * 通常の HTTP リクエストに対しては正規のレスポンスを返す。
 * Ajax のリクエストに対しては、適当な (それっぽい)  JSON を返す。
 */
var express = require('express');
var app = express();


/*
 * 通常の HTTP リクエスト用
 */
app.use(express.static('public') );


/*
 * 発注画面の SearchPane から発行される品目と販売元の検索リクエスト
 */
app.post('/searchCategoriesAndTraders', function(req, res) {
    res.json({
        categories: [
            { code: '0', desc: '凄いアレ' },
            { code: '1', desc: '驚きのナニ' },
            { code: '2', desc: 'ありえないソレ' },
            { code: '3', desc: '感動のコレ' }
        ],

        traders: [
            { code: '0', desc: '阿漕商店' },
            { code: '1', desc: 'バッタモン市場' },
            { code: '2', desc: '贋物マーケット' }
        ]
    });
});


/*
 * 発注画面の SearchPane から発行される品名候補の検索リクエスト
 */
app.post('/pickCandidates', function(req, res) {
    res.json([
        {
            goods:  { code: '0000', name: 'a'  },
            maker:  { code: '0000', name: 'Z'  },
            trader: { code: '0000', name: 'あ' },
            price:  25
        },
        {
            goods:  { code: '0001', name: 'b'  },
            maker:  { code: '0001', name: 'Y'  },
            trader: { code: '0001', name: 'い' },
            price:  24
        },
        {
            goods:  { code: '0002', name: 'c'  },
            maker:  { code: '0002', name: 'X'  },
            trader: { code: '0002', name: 'う' },
            price:  23
        },
        {
            goods:  { code: '0003', name: 'd'  },
            maker:  { code: '0003', name: 'W'  },
            trader: { code: '0003', name: 'え' },
            price:  22
        },
        {
            goods:  { code: '0004', name: 'e'  },
            maker:  { code: '0004', name: 'V'  },
            trader: { code: '0004', name: 'お' },
            price:  21
        },
        {
            goods:  { code: '0005', name: 'f'  },
            maker:  { code: '0005', name: 'U'  },
            trader: { code: '0005', name: 'か' },
            price:  20
        },
        {
            goods:  { code: '0006', name: 'g'  },
            maker:  { code: '0006', name: 'T'  },
            trader: { code: '0006', name: 'き' },
            price:  19
        },
        {
            goods:  { code: '0007', name: 'h'  },
            maker:  { code: '0007', name: 'S'  },
            trader: { code: '0007', name: 'く' },
            price:  18
        },
        {
            goods:  { code: '0008', name: 'i'  },
            maker:  { code: '0008', name: 'R'  },
            trader: { code: '0008', name: 'け' },
            price:  17
        },
        {
            goods:  { code: '0009', name: 'j'  },
            maker:  { code: '0009', name: 'Q'  },
            trader: { code: '0009', name: 'こ' },
            price:  16
        },
        {
            goods:  { code: '0010', name: 'k'  },
            maker:  { code: '0010', name: 'P'  },
            trader: { code: '0010', name: 'さ' },
            price:  15
        },
        {
            goods:  { code: '0011', name: 'l'  },
            maker:  { code: '0011', name: 'O'  },
            trader: { code: '0011', name: 'し' },
            price:  14
        },
        {
            goods:  { code: '0012', name: 'm'  },
            maker:  { code: '0012', name: 'N'  },
            trader: { code: '0012', name: 'す' },
            price:  13
        },
        {
            goods:  { code: '0013', name: 'n'  },
            maker:  { code: '0013', name: 'M'  },
            trader: { code: '0013', name: 'せ' },
            price:  12
        },
        {
            goods:  { code: '0014', name: 'o'  },
            maker:  { code: '0014', name: 'L'  },
            trader: { code: '0014', name: 'そ' },
            price:  11
        },
        {
            goods:  { code: '0015', name: 'p'  },
            maker:  { code: '0015', name: 'K'  },
            trader: { code: '0015', name: 'た' },
            price:  10
        },
        {
            goods:  { code: '0016', name: 'q'  },
            maker:  { code: '0016', name: 'J'  },
            trader: { code: '0016', name: 'ち' },
            price:   9
        },
        {
            goods:  { code: '0017', name: 'r'  },
            maker:  { code: '0017', name: 'I'  },
            trader: { code: '0017', name: 'つ' },
            price:   8
        },
        {
            goods:  { code: '0018', name: 's'  },
            maker:  { code: '0018', name: 'H'  },
            trader: { code: '0018', name: 'て' },
            price:   7
        },
        {
            goods:  { code: '0019', name: 't'  },
            maker:  { code: '0019', name: 'G'  },
            trader: { code: '0019', name: 'と' },
            price:   6
        },
        {
            goods:  { code: '0020', name: 'u'  },
            maker:  { code: '0020', name: 'F'  },
            trader: { code: '0020', name: 'な' },
            price:   5
        },
        {
            goods:  { code: '0021', name: 'v'  },
            maker:  { code: '0021', name: 'E'  },
            trader: { code: '0021', name: 'に' },
            price:   4
        },
        {
            goods:  { code: '0022', name: 'w'  },
            maker:  { code: '0022', name: 'D'  },
            trader: { code: '0022', name: 'ぬ' },
            price:   3
        },
        {
            goods:  { code: '0023', name: 'x'  },
            maker:  { code: '0023', name: 'C'  },
            trader: { code: '0023', name: 'ね' },
            price:   2
        },
        {
            goods:  { code: '0024', name: 'y'  },
            maker:  { code: '0024', name: 'B'  },
            trader: { code: '0024', name: 'の' },
            price:   1
        },
        {
            goods:  { code: '0025', name: 'z'  },
            maker:  { code: '0025', name: 'A'  },
            trader: { code: '0025', name: 'は' },
            price:   0
        }
    ]);
});

app.listen(8080);
