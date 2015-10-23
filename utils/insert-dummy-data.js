// 部門診療科
db.departments.insert({
    name: '外科',
    abbr: 'SUR',
    tel:  '3210'
});

db.departments.insert({
    name: '中科',
    abbr: 'MID',
    tel:  '3211'
});

db.departments.insert({
    name: '内科',
    abbr: 'IM',
    tel:  '3212'
});

db.departments.insert({
    name: '歯科',
    abbr: 'DENT',
    tel:  '3213'
});

db.departments.insert({
    name: '小児科',
    abbr: 'PED',
    tel:  '3213'
});

db.departments.insert({
    name: '眼科',
    abbr: 'OPH',
    tel:  '3214'
});

db.departments.insert({
    name: 'べつに減るもんじゃなし、ちょっとくらいええじゃない科',
    abbr: 'OK',
    tel:  '3215'
});

db.departments.insert({
    name: '薬剤科',
    abbr: 'MED',
    tel:  '3216'
});

db.departments.insert({
    name: '薬剤科 (薬剤発注専用)',
    abbr: 'MED',
    tel:  '3216'
});



// 販売元
db.traders.insert({
    name:  '阿漕商会',
    tel:   '0120-4126',
    fax:   '0120-4126',
    email: 'dummy-firm@example.com',
    communication: 'tel',
});

db.traders.insert({
    name:  'バッタモン市場',
    tel:   '0120-1818',
    fax:   '0120-1919',
    email: 'imitation-bazaar@example.net',
    communication: 'fax',
});

db.traders.insert({
    name:  '贋物マーケット',
    tel:   '0120-4219',
    fax:   '0120-4219',
    email: 'fake-market@example.org',
    communication: 'email',
});

db.traders.insert({
    name:  'エセショップ',
    tel:   '0120-8818',
    fax:   '0120-15',
    email: 'cheat-shop@example.jp',
    communication: 'email',
});

db.traders.insert({
    name:  'あっとおどろくためごろうのお店',
    tel:   '0120-794-1192',
    fax:   '0120-1333-1336',
    email: 'suprising-donkey@example.co.jp',
    communication: 'email',
});



// 品目
db.categories.insert({ name: 'すごいアレ' });
db.categories.insert({ name: 'しょぼいナニ' });
db.categories.insert({ name: 'とても想像できないくらいアレでナニなソレ' });
db.categories.insert({ name: 'まぁまぁなコレ' });


// 物品
db.products.insert({
    name:     'タイガーマスク',
    category: db.categories.find({ name: 'すごいアレ' })[0]._id,
    maker:    '虎の穴',
    departments: [
        db.departments.find({ name: '外科' })[0]._id,
        db.departments.find({ name: '中科' })[0]._id,
        db.departments.find({ name: '歯科' })[0]._id,
        db.departments.find({ name: '小児科' })[0]._id,
        db.departments.find({ name: '眼科' })[0]._id,
        db.departments.find({ name: 'べつに減るもんじゃなし、ちょっとくらいええじゃない科' })[0]._id,
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader:    db.traders.find({ name: '阿漕商会' })[0]._id,
    min_price: 6.04,
    cur_price: 6.45,
    max_price: 7.10,
    note:      '誰なのかはヒ ミ ツ'
});

db.products.insert({
    name:     'マングローブ',
    category: db.categories.find({ name: 'しょぼいナニ' })[0]._id,
    maker:    '熱帯/亜熱帯地域の河口気水域の塩性湿地',
    departments: [
        db.departments.find({ name: '外科' })[0]._id,
        db.departments.find({ name: '中科' })[0]._id,
        db.departments.find({ name: '歯科' })[0]._id,
        db.departments.find({ name: '小児科' })[0]._id,
        db.departments.find({ name: '眼科' })[0]._id,
        db.departments.find({ name: 'べつに減るもんじゃなし、ちょっとくらいええじゃない科' })[0]._id,
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader: db.traders.find({ name: '贋物マーケット' })[0]._id,
    min_price:  7.94,
    cur_price: 11.92,
    max_price: 13.33,
    note: '紅樹林または海漂林とも言うらしいよ'
});

db.products.insert({
    name:     'おすメス',
    category: db.categories.find({ name: 'とても想像できないくらいアレでナニなソレ' })[0]._id,
    maker:    '大自然?',
    departments: [
        db.departments.find({ name: '外科' })[0]._id
    ],
    trader: db.traders.find({ name: 'エセショップ' })[0]._id,
    min_price: 15.43,
    cur_price: 16.03,
    max_price: 18.53,
    note: 'かたつむりは雌雄同体'
});

db.products.insert({
    name:     'デンジャー薬',
    category: db.categories.find({ name: 'まぁまぁなコレ' })[0]._id,
    maker:    'ちょっとイっちゃった人々',
    departments: [
        db.departments.find({ name: '薬剤科 (薬剤発注専用)' })[0]._id
    ],
    trader: db.traders.find({ name: 'あっとおどろくためごろうのお店' })[0]._id,
    min_price: 18.18,
    cur_price: 18.19,
    max_price: 19.19,
    note: '用法容量を守って正しくお使い下さい'
});

db.products.insert({
    name:     '鉄人2?号',
    category: db.categories.find({ name: 'すごいアレ' })[0]._id,
    maker:    '敷島博士と愉快な仲間達',
    departments: [
        db.departments.find({ name: '歯科' })[0]._id
    ],
    trader: db.traders.find({ name: '阿漕商会' })[0]._id,
    min_price: 9999999.99,
    cur_price: 9999999.99,
    max_price: 9999999.99,
    note: '別途正太郎君を雇うこと (車付きで)'
});



// ユーザ
db.users.insert({
    account: 'ord0',
    hash:    '$2a$10$bhHirIDV1cu9nROVKG45z.DaaNOMDacUx8T7lMTAdd.gIcK9svcEu',
    name:    '普通 太郎',
    tel:     '0000',
    email:   'ord0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '外科' })[0]._id,
        administrate:     false,
        draft_ordinarily: true,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    }]
});

db.users.insert({
    account: 'ord1',
    hash:    '$2a$10$bR0wrdlmYgAkB5y39AQkhui25dyOp1LG7WD58qILunT4h5StcVi6q',
    name:    '通常 花子',
    tel:     '0001',
    email:   'ord1@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [
        {
            code: db.departments.find({ name: '中科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '内科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '歯科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '小児科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '眼科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: 'べつに減るもんじゃなし、ちょっとくらいええじゃない科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        }
    ]
});

db.users.insert({
    account: 'med',
    hash:    '$2a$10$yBKKtP1f9HZ40n5hgQRMn.Hds5a1.h2c.w1DydzIPioDDXfTXZfQC',
    name:    '薬剤 命実',
    tel:     '0002',
    email:   'med@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [
        {
            code: db.departments.find({ name: '薬剤科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '薬剤科 (薬剤発注専用)' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        }
    ]
});

db.users.insert({
    account: 'spd',
    hash:    '$2a$10$uZ0GoMnUNGIeyhmFrmeFzOKDoYHz2LBa9ZI.T9/DPNHj.R5cbDUgK',
    name:    '何でも でき太',
    tel:     '0003',
    email:   'spd@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: true,
        draft_urgently:   true,
        process_order:    true,
        approve:          false
    },
    departments: []
});

db.users.insert({
    account: 'spdadm',
    hash:    '$2a$10$UCVQuW3fwXjiVzIgfGi6P.HsyxjbtPEYX9fi6gMB30HTEy9jzwBWm',
    name:    'やれば できる夫',
    tel:     '0004',
    email:   'spdadm@example.jp',
    privileged: {
        administrate:     true,
        draft_ordinarily: true,
        draft_urgently:   true,
        process_order:    true,
        approve:          false
    },
    departments: []
});

db.users.insert({
    account: 'dir',
    hash:    '$2a$10$oGmaZbxpIv4qnGvu/ou2h.bzfY3PaSEyyw5LNtQRbEKaec7iPWK4G',
    name:    '院長 です代',
    tel:     '0005',
    email:   'dir@example.jp',
    privileged: {
        administrate:     true,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          true
    },
    departments: []
});

db.users.insert({
    account: 'chief0',
    hash:    '$2a$10$0IsbDoLZpIiwmeLLt32cW.EmlpAsxBbLDPPDsOASTTswr9EMxafAK',
    name:    '次長 課長',
    tel:     '0006',
    email:   'chief0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '外科' })[0]._id,
        administrate:     true,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          true
    }]
});

db.users.insert({
    account: 'chief1',
    hash:    '$2a$10$MKWRHmZaQsHre.PTQx457.cNLnl29aL8hCOloOiV7ja.SfMDEgzXy',
    name:    '芋洗い坂 係長',
    tel:     '0007',
    email:   'chief1@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [
        {
            code: db.departments.find({ name: '中科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '内科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '歯科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '小児科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '眼科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: 'べつに減るもんじゃなし、ちょっとくらいええじゃない科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        }
    ]
});

db.users.insert({
    account: 'irr',
    hash:    '$2a$10$6jDTHoY10z95J9jjS3PA6.A0X/iLT.t2FX/we3UkDbYYDGSFeDpSq',
    name:    '例外 ですね',
    tel:     '0008',
    email:   'irr0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [
        {
            code: db.departments.find({ name: '中科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '内科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '歯科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
    ]
});

db.users.insert({
    account: 'urg0',
    hash:    '$2a$10$SWlN1Vf/jsxEOe3Q6ZEN5.Ca9OedtK6oiGWsdSYX2Y7zZBtHz1p1S',
    name:    '緊急 次郎',
    tel:     '0009',
    email:   'urg0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '外科' })[0]._id,
        administrate:     false,
        draft_ordinarily: true,
        draft_urgently:   true,
        process_order:    false,
        approve:          false
    }]
});

db.users.insert({
    account: 'urg1',
    hash:    '$2a$10$q7bE.djIHz7JZjeO5Br/e.OO8zSlt6DAb0cvEKIPtxRITt2mV8Gq6',
    name:    '緊急 優子',
    tel:     '0010',
    email:   'urg1@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [
        {
            code: db.departments.find({ name: '中科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '内科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '歯科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '小児科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '眼科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: 'べつに減るもんじゃなし、ちょっとくらいええじゃない科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        }
    ]
});

db.users.insert({
    account: 'appmed',
    hash:    '$2a$10$T6J/T0f8yTBD4iXFHJV96eRrL7Syq/ACVptdj5Xvm6S1Tx3cpgaoy',
    name:    '薬 漬雄',
    tel:     '0011',
    email:   'appmed@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [
        {
            code: db.departments.find({ name: '薬剤科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '薬剤科 (薬剤発注専用)' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        }
    ]
});

db.users.insert({
    account: 'void',
    hash:    '$2a$10$2662AL.7FbIdD6.t9CrExuISX7kbdH.k7i8pT.5MPxibsqNwZJ3Vm',
    name:    '丸出 ダメ夫',
    tel:     '0012',
    email:   'void@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '歯科' })[0]._id,
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    }],
});
