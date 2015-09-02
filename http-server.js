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
        { code: '0000', name: 'a', maker: 'Z', trader: 'あ', price: 25 },
        { code: '0001', name: 'b', maker: 'Y', trader: 'い', price: 24 },
        { code: '0002', name: 'c', maker: 'X', trader: 'う', price: 23 },
        { code: '0003', name: 'd', maker: 'W', trader: 'え', price: 22 },
        { code: '0004', name: 'e', maker: 'V', trader: 'お', price: 21 },
        { code: '0005', name: 'f', maker: 'U', trader: 'か', price: 20 },
        { code: '0006', name: 'g', maker: 'T', trader: 'き', price: 19 },
        { code: '0007', name: 'h', maker: 'S', trader: 'く', price: 18 },
        { code: '0008', name: 'i', maker: 'R', trader: 'け', price: 17 },
        { code: '0009', name: 'j', maker: 'Q', trader: 'こ', price: 16 },
        { code: '0010', name: 'k', maker: 'P', trader: 'さ', price: 15 },
        { code: '0011', name: 'l', maker: 'O', trader: 'し', price: 14 },
        { code: '0012', name: 'm', maker: 'N', trader: 'す', price: 13 },
        { code: '0013', name: 'n', maker: 'M', trader: 'せ', price: 12 },
        { code: '0014', name: 'o', maker: 'L', trader: 'そ', price: 11 },
        { code: '0015', name: 'p', maker: 'K', trader: 'た', price: 10 },
        { code: '0016', name: 'q', maker: 'J', trader: 'ち', price:  9 },
        { code: '0017', name: 'r', maker: 'I', trader: 'つ', price:  8 },
        { code: '0018', name: 's', maker: 'H', trader: 'て', price:  7 },
        { code: '0019', name: 't', maker: 'G', trader: 'と', price:  6 },
        { code: '0020', name: 'u', maker: 'F', trader: 'な', price:  5 },
        { code: '0021', name: 'v', maker: 'E', trader: 'に', price:  4 },
        { code: '0022', name: 'w', maker: 'D', trader: 'ぬ', price:  3 },
        { code: '0023', name: 'x', maker: 'C', trader: 'ね', price:  2 },
        { code: '0024', name: 'y', maker: 'B', trader: 'の', price:  1 },
        { code: '0025', name: 'z', maker: 'A', trader: 'は', price:  0 }
    ]);
});

app.listen(8080);
