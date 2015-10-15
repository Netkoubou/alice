'use strict';

var traders = [
    { code: '0', name: '阿漕商店' },
    { code: '1', name: 'バッタモン市場' },
    { code: '2', name: '贋物マーケット' },
    { code: '3', name: 'エセショップ' },
    { code: '4', name: 'Cwm fjord veg balks nth pyx quiz' }
];

module.exports = function(req, res) {
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
};
