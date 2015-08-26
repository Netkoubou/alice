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

app.listen(8080);
