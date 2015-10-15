'use strict';

var traders = [
    { code: '0', name: '阿漕商店' },
    { code: '1', name: 'バッタモン市場' },
    { code: '2', name: '贋物マーケット' },
    { code: '3', name: 'エセショップ' },
    { code: '4', name: 'Cwm fjord veg balks nth pyx quiz' }
];

module.exports = function(req, res) {
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
};
