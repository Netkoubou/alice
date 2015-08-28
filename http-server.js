var express = require('express');
var app = express();

app.use(express.static('public') );

app.post('/searchCategoriesAndTraders', function(req, res) {
    res.json({
        categories: [
            { keyid: '0', desc: '凄いアレ' },
            { keyid: '1', desc: '驚きのナニ' },
            { keyid: '2', desc: 'ありえないソレ' },
            { keyid: '3', desc: '感動のコレ' }
        ],

        traders: [
            { keyid: '0', desc: '阿漕商店' },
            { keyid: '1', desc: 'バッタモン市場' },
            { keyid: '2', desc: '贋物マーケット' }
        ]
    });
});

app.post('/pickCandidates', function(req, res) {
    res.json([
        ['a', 'Z', 'あ', 25],
        ['b', 'Y', 'い', 24],
        ['c', 'X', 'う', 23],
        ['d', 'W', 'え', 22],
        ['e', 'V', 'お', 21],
        ['f', 'U', 'か', 20],
        ['g', 'T', 'き', 19],
        ['h', 'S', 'く', 18],
        ['i', 'R', 'け', 17],
        ['j', 'Q', 'こ', 16],
        ['k', 'P', 'さ', 15],
        ['l', 'O', 'し', 14],
        ['m', 'N', 'す', 13],
        ['n', 'M', 'せ', 12],
        ['o', 'L', 'そ', 11],
        ['p', 'K', 'た', 10],
        ['q', 'J', 'ち',  9],
        ['r', 'I', 'つ',  8],
        ['s', 'H', 'て',  7],
        ['t', 'G', 'と',  6],
        ['u', 'F', 'な',  5],
        ['v', 'E', 'に',  4],
        ['w', 'D', 'ぬ',  3],
        ['x', 'C', 'ね',  2],
        ['y', 'B', 'の',  1],
        ['z', 'A', 'は',  0]
    ]);
});

app.listen(8080);
