// 部門診療科
db.departments.insert({
    name:     '小児歯科',
    abbr:     'KID',
    tel:      '046-822-8886',
    is_alive: true
});

db.departments.insert({
    name:     '総合診療科Ⅰ',
    abbr:     'SGO',
    tel:      '046-822-8884',
    is_alive: true
});

db.departments.insert({
    name:     '矯正科',
    abbr:     'ORT',
    tel:      '046-822-8885',
    is_alive: true
});

db.departments.insert({
    name:     'ﾍﾟﾘｵｹｱ外来',
    abbr:     'PER',
    tel:      '046-822-8873',
    is_alive: true
});

db.departments.insert({
    name:     '口腔外科',
    abbr:     'ORA',
    tel:      '046-822-8895',
    is_alive: true
});

db.departments.insert({
    name:     '障害者歯科',
    abbr:     'SYG',
    tel:      '046-822-8874',
    is_alive: true
});

db.departments.insert({
    name:     '薬剤科',
    abbr:     'MED',
    tel:      '046-822-8875',
    is_alive: true
});

db.departments.insert({
    name:     '薬剤科 (薬剤発注専用)',
    abbr:     'MED',
    tel:      '046-822-8875',
    is_alive: true
});

db.departments.insert({
    name:     '病棟',
    abbr:     'HOS',
    tel:      '046-822-8890',
    is_alive: true
});

db.departments.insert({
    name:     '歯科麻酔科',
    abbr:     'TXC',
    tel:      '046-822-8897',
    is_alive: true
});

db.departments.insert({
    name:     '手術室',
    abbr:     'OPE',
    tel:      '046-822-9696',
    is_alive: true
});

db.departments.insert({
    name:     '院長室',
    abbr:     'GOD',
    tel:      '046-822-4126',
    is_alive: true
});

db.departments.insert({
    name:     'SPD',
    abbr:     'SPD',
    tel:      '046-822-9640',
    is_alive: true
});


// 販売元
db.traders.insert({
    name:          '田中歯科器械店',
    tel:           '0120-4126',
    fax:           '0120-4126',
    email:         'dummy-firm@example.com',
    communication: 'tel',
    is_alive:      true
});

db.traders.insert({
    name:          '歯愛メディカル',
    tel:           '0120-1818',
    fax:           '0120-1919',
    email:         'imitation-bazaar@example.net',
    communication: 'fax',
    is_alive:      true
});

db.traders.insert({
    name:          'アスクル',
    tel:           '0120-4219',
    fax:           '0120-4219',
    email:         'fake-market@example.org',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          'サガラ印刷所',
    tel:           '0120-8818',
    fax:           '0120-15',
    email:         'cheat-shop@example.jp',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          'サシンリョウ',
    tel:           '0120-794-1192',
    fax:           '0120-1333-1336',
    email:         'suprising-donkey@example.co.jp',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          '協和医科器械',
    tel:           '0120-794-1192',
    fax:           '0120-1333-1336',
    email:         'suprising-donkey@example.co.jp',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          'ﾏﾏｼｮｯﾌﾟ加納',
    tel:           '0120-794-1192',
    fax:           '0120-1333-1336',
    email:         'suprising-donkey@example.co.jp',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          'サンメデックス',
    tel:           '0120-794-1192',
    fax:           '0120-1333-1336',
    email:         'suprising-donkey@example.co.jp',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          'ＦＥＥＤ',
    tel:           '0120-794-1192',
    fax:           '0120-1333-1336',
    email:         'suprising-donkey@example.co.jp',
    communication: 'email',
    is_alive:      true
});

db.traders.insert({
    name:          'オーラルケア',
    tel:           '0120-794-1192',
    fax:           '0120-1333-1336',
    email:         'suprising-donkey@example.co.jp',
    communication: 'email',
    is_alive:      true
});


// 品目
db.categories.insert({
    name:     '医療用材料',
    is_alive: true
});

db.categories.insert({
    name:     '医療用消耗品',
    is_alive: true
});

db.categories.insert({
    name:     '医療用機器',
    is_alive: true
});

db.categories.insert({
    name:     '医薬品',
    is_alive: true
});

db.categories.insert({
    name:     '事務用品',
    is_alive: true
});

db.categories.insert({
    name:     'メンテナンス',
    is_alive: true
});

db.categories.insert({
    name:     '修理営繕',
    is_alive: true
});

db.categories.insert({
    name:     '建築土木営繕',
    is_alive: true
});

db.categories.insert({
    name:     '業務委託費',
    is_alive: true
});

db.categories.insert({
    name:     '印刷物',
    is_alive: true
});

db.categories.insert({
    name:     '備品(機械)',
    is_alive: true
});

db.categories.insert({
    name:     '備品(器具)',
    is_alive: true
});

db.categories.insert({
    name:     '被服費',
    is_alive: true
});

db.categories.insert({
    name:     'レンタル',
    is_alive: true
});

db.categories.insert({
    name:     'リーズ',
    is_alive: true
});

db.categories.insert({
    name:     'その他',
    is_alive: true
});


// 物品
// ***小児歯科***
db.products.insert({
    name:          'ﾋﾞｭｰﾃｨﾌｨﾙﾌﾛｰ F02 A1',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '松風',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   350.99,
    cur_price:   382.22,
    max_price:   395.50,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾌｫｲﾙﾒｯｼｭ ﾘﾝｶﾞﾙﾎﾞﾀﾝ',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'ﾄﾐｰ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   50.99,
    cur_price:   82.22,
    max_price:   95.50,
    note:        'ｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾕｰｼﾞﾀﾞｲﾝ 液 20ml',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '昭和',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   999.99,
    cur_price:   2212.00,
    max_price:   3200.25,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ｶﾘｴｽﾃﾞﾃｸﾀｰ #220',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'サンメディカル',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'ＦＥＥＤ' })[0]._id,
    min_price:   2124.55,
    cur_price:   2212.00,
    max_price:   2330.25,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '122-19683ﾘｾﾗ 咬合紙 赤【ｾｰﾙ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'Ｃi',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   999.99,
    cur_price:   1002.00,
    max_price:   1033.25,
    note:        'ｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '10207 ｱｸｾｻﾘｰﾎﾟｲﾝﾄmax(細大)',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'Ｃi',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   543.99,
    cur_price:   554.00,
    max_price:   588.25,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '425-7485 ﾃﾞｨｽﾎﾟｰｻﾞﾌﾞﾙｷﾄﾞﾆｰﾄﾚｲ100入',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'xxx',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'ＦＥＥＤ' })[0]._id,
    min_price:   543.99,
    cur_price:   554.00,
    max_price:   588.25,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'NT-653 016×022 ｽﾑｰｽｱｰﾁﾌｫｰﾑ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'オーラルケア',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'オーラルケア' })[0]._id,
    min_price:   543.99,
    cur_price:   554.00,
    max_price:   588.25,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ｱﾅﾄﾑ乳歯冠 右上 #34 10入',
    category_code: db.categories.find({ name: '医療用機器' })[0]._id,
    maker:         'ｻﾝｷﾝ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   543.99,
    cur_price:   554.00,
    max_price:   588.25,
    note:        'ｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾗﾊﾞｰﾀﾞﾑｸﾗﾝﾌﾟ  ST12A',
    category_code: db.categories.find({ name: '医療用機器' })[0]._id,
    maker:         'ﾃﾞﾝﾃｯｸ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   543.99,
    cur_price:   554.00,
    max_price:   588.25,
    note:        'ｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '189-639 ｲﾝｸｼﾞｪｯﾄｶｰﾄﾘｯｼﾞ lCC50',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'エプソン',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   100.25,
    cur_price:   120.50,
    max_price:   145.25,
    note:        'ｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '436-373 ｲﾝｸ ﾏｾﾞﾝﾀ BCI-321M',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'キャノン',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   350.75,
    cur_price:   375.00,
    max_price:   381.25,
    note:        'ｘｘｘｘｘ',
    is_alive:    true
});


//総合診療科Ⅰ

db.products.insert({
    name:          'ADﾎﾟｽﾄⅡ 2S 12入 #1902',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'クラレ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '総合診療科Ⅰ' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   100.00,
    cur_price:   117.25,
    max_price:   123.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾚｼﾞｾﾑ用ﾐｷｼﾝｸﾞｾｯﾄ',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '松風',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '総合診療科Ⅰ' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   1530.00,
    cur_price:   1617.25,
    max_price:   1723.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾚｼﾞﾝ充填形成器DLC P式 #2B 3入 23426',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'YDM',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '総合診療科Ⅰ' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   1530.00,
    cur_price:   1617.25,
    max_price:   1723.75,
    note:        'ｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾎﾟﾘｶｰﾎﾞｸﾗｳﾝ 上顎右 1L #3',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'D.ｻﾝｷﾝ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '総合診療科Ⅰ' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   1530.00,
    cur_price:   1617.25,
    max_price:   1723.75,
    note:        'ｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});


//矯正科

db.products.insert({
    name:          '7422 Ciﾚｼﾞﾝｸﾘｰﾅｰ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'Ci',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '矯正科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   150.00,
    cur_price:   180.00,
    max_price:   200.00,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '189-639 ｲﾝｸｼﾞｪｯﾄｶｰﾄﾘｯｼﾞ lCC50',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'エプソン',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '矯正科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   3500.75,
    cur_price:   3750.50,
    max_price:   4000.00,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ｵｻﾀﾞ ﾊﾝﾄﾞﾋﾟｰｽｽﾌﾟﾚｰ補充用(ﾉｽﾞﾙﾅｼ)',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'ｵｻﾀﾞ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '矯正科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   370.99,
    cur_price:   420.35,
    max_price:   450.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});


//ﾍﾟﾘｵｹｱ外来

db.products.insert({
    name:          '18359Ciﾊﾞｷｭｰﾑｸﾘｰﾅｰ ｴﾝﾘｯﾁⅡ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'Ci',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'ﾍﾟﾘｵｹｱ外来' })[0]._id
    ],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   12345.67,
    cur_price:   13000.75,
    max_price:   15000.99,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '切手 120円',
    category_code: db.categories.find({ name: '業務委託費' })[0]._id,
    maker:         'AAA',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'ﾍﾟﾘｵｹｱ外来' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   120.00,
    cur_price:   120.00,
    max_price:   120.00,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});


//口腔外科

db.products.insert({
    name:          'ﾖｼﾀﾞｽﾌﾟﾚｰ',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'ヨシダ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '口腔外科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   450.75,
    cur_price:   500.00,
    max_price:   515.23,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    
    name:          '7422 Ciﾚｼﾞﾝｸﾘｰﾅｰ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'Ci',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '口腔外科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   650.00,
    cur_price:   680.00,
    max_price:   700.00,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

//障害者歯科

db.products.insert({
    name:          'ｵｻﾀﾞ ﾊﾝﾄﾞﾋﾟｰｽｽﾌﾟﾚｰ補充用(ﾉｽﾞﾙﾅｼ)',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'ｵｻﾀﾞ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '障害者歯科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   869.50,
    cur_price:   875.00,
    max_price:   880.99,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

//薬剤科
db.products.insert({
    name:          'ﾄﾗﾊﾞｰｾﾞC号 30×30 300枚',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '竹虎',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '協和医科器械' })[0]._id,
    min_price:   123.53,
    cur_price:   186.32,
    max_price:   251.99,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '1741 Good Choice ｺｯﾄﾝ入ｶﾞｰｾﾞ (N)',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '歯愛ﾒﾃﾞｨｶ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   23.55,
    cur_price:   36.00,
    max_price:   421.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'へﾊﾟｰﾙ3 ﾏｽｸ M  ﾋﾟﾝｸ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         '',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   321.55,
    cur_price:   325.00,
    max_price:   330.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'SUSｺﾆｶﾙﾌﾞﾗｼ 5個入 小 ③ｺﾆｶﾘｰ型ﾌﾞﾗｼ小',
    category_code: db.categories.find({ name: '医療用機器' })[0]._id,
    maker:         'ﾖｼﾀﾞ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   100.55,
    cur_price:   105.00,
    max_price:   112.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'SUSｺﾆｶﾙﾌﾞﾗｼ 5個入 大 ④ｺﾆｶﾘｰﾌﾞﾗｼ大',
    category_code: db.categories.find({ name: '医療用機器' })[0]._id,
    maker:         'ﾖｼﾀﾞ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   181.55,
    cur_price:   182.00,
    max_price:   185.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ｵﾗﾌﾞﾘｽ洗口用顆粒11ﾊﾟｰｾﾝﾄ 1.5g',
    category_code: db.categories.find({ name: '医薬品' })[0]._id,
    maker:         '昭和薬品化工',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   181.55,
    cur_price:   182.00,
    max_price:   185.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾌﾟﾛﾈｽﾊﾟｽﾀｱﾛﾏ 20g',
    category_code: db.categories.find({ name: '医薬品' })[0]._id,
    maker:         '日本歯科薬品',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   1801.55,
    cur_price:   182.00,
    max_price:   185.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾄﾘｺｰﾑNo.14 004132',
    category_code: db.categories.find({ name: '医薬品' })[0]._id,
    maker:         '竹虎',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '協和医科器械' })[0]._id,
    min_price:   1801.55,
    cur_price:   182.00,
    max_price:   185.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '523-076 ｸﾘｯﾌﾟｲﾝﾌｧｲﾙ A4 縦316×横227mm ﾌﾞﾙｰ',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'ｾｷｾｲ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   1801.55,
    cur_price:   182.00,
    max_price:   185.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});


db.products.insert({
    name:          'マスク',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'abcdefg',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '小児歯科' })[0]._id,
        db.departments.find({ name: '総合診療科Ⅰ' })[0]._id,
        db.departments.find({ name: '矯正科' })[0]._id,
        db.departments.find({ name: 'ﾍﾟﾘｵｹｱ外来' })[0]._id,
        db.departments.find({ name: '口腔外科' })[0]._id,
        db.departments.find({ name: '障害者歯科' })[0]._id,
        db.departments.find({ name: 'SPD' })[0]._id,
        db.departments.find({ name: '薬剤科' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   6.04,
    cur_price:   6.45,
    max_price:   7.10,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'グローブ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'ｘｘ株式会社',
    is_common_item: true,
    department_codes: [],
    trader_code: db.traders.find({ name: '歯愛メディカル' })[0]._id,
    min_price:   155.04,
    cur_price:   165.00,
    max_price:   170.75,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '切手 120円',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'xxxxx',
    is_common_item: true,
    department_codes: [],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   120.00,
    cur_price:   120.00,
    max_price:   120.00,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          '切手 82円',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'xxxxx',
    is_common_item: true,
    department_codes: [],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   82.00,
    cur_price:   82.00,
    max_price:   82.00,
    note:        'ｘｘｘｘｘｘｘｘｘｘｘ',
    is_alive:    true
});

db.products.insert({
    name:          'ﾎﾟｰﾙﾒﾝⅡ S 20本×4束',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '竹虎',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科 (薬剤発注専用)' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   180.15,
    cur_price:   183.50,
    max_price:   195.00,
    note:        '用法容量を守って正しくお使い下さい',
    is_alive:    true
});

db.products.insert({
    name:          'ﾍﾟﾘｵﾄﾞﾝ 2g',
    category_code: db.categories.find({ name: '医薬品' })[0]._id,
    maker:         'ﾈｵ製薬',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '薬剤科 (薬剤発注専用)' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   180.15,
    cur_price:   183.50,
    max_price:   195.00,
    note:        '用法容量を守って正しくお使い下さい',
    is_alive:    true
});


// 手術室

db.products.insert({
    name:          'ﾛｰﾌﾟﾛﾌｧｲﾙﾐﾆﾌﾟﾚｰﾄ  ﾀﾞﾌﾞﾙ Y型 6穴S',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         '日本ﾏｰﾁﾝ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '手術室' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'サンメデックス' })[0]._id,
    min_price:   18.18,
    cur_price:   18.19,
    max_price:   19.19,
    note:        'xxxxx',
    is_alive:    true
});

db.products.insert({
    name:          'ﾌﾟﾘﾌｫｰﾑﾄﾞ ﾘｶﾞﾁｬ―ﾜｲﾔｰ 0.3ﾐﾘ 506-04',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'TOMY',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '手術室' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   18.18,
    cur_price:   18.19,
    max_price:   19.19,
    note:        'xxxxxx',
    is_alive:    true
});

db.products.insert({
    name:          'JMS ｶﾞﾒｯｸｽﾊﾟｳﾀﾞｰﾌﾘｰAF ﾏｲｸﾛ 7.5',
    category_code: db.categories.find({ name: '医療用機器' })[0]._id,
    maker:         'JMS',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '手術室' })[0]._id
    ],
    trader_code: db.traders.find({ name: '協和医科器械' })[0]._id,
    min_price:   855.50,
    cur_price:   856.00,
    max_price:   871.25,
    note:        'xxxxxx',
    is_alive:    true
});


// 病棟

db.products.insert({
    name:          'ｳﾛｶﾞｰﾄﾞﾌﾟﾗｽ閉鎖式導尿ﾊﾞｯｸﾞ UD-BE3112P',
    category_code: db.categories.find({ name: 'その他' })[0]._id,
    maker:         'テルモ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '病棟' })[0]._id
    ],
    trader_code: db.traders.find({ name: '協和医科器械' })[0]._id,
    min_price:   55555.55,
    cur_price:   55555.55,
    max_price:   55555.55,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          'ｽﾃﾘO2 ﾋｭｰﾐﾃﾞｨﾌｧｲｱｰ 0352 350ml',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         '村中医療機器',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '病棟' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'サンメデックス' })[0]._id,
    min_price:   18.18,
    cur_price:   18.19,
    max_price:   19.19,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          'ｿﾌﾄｯﾌﾟ ﾊﾞｷｭｰﾑﾁｯﾌﾟ ｻﾏｰｲｴﾛｰ',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'ヨシダ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: '病棟' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   180.25,
    cur_price:   182.75,
    max_price:   194.00,
    note:        '',
    is_alive:    true
});


// SPD

db.products.insert({
    name:          'AD-90100 一重四角布 青 90×90',
    category_code: db.categories.find({ name: '医療用材料' })[0]._id,
    maker:         'ﾅｶﾞｲﾚｰﾍﾞﾝ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   350.18,
    cur_price:   357.75,
    max_price:   407.25,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          'ﾙｼｪﾛ歯ﾌﾞﾗｼ B-10 M',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'GC',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: '田中歯科器械店' })[0]._id,
    min_price:   138.15,
    cur_price:   141.75,
    max_price:   147.25,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          '注射針 22G',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         'JMS',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: '協和医科器械' })[0]._id,
    min_price:   138.15,
    cur_price:   141.75,
    max_price:   147.25,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          '716-9769 ﾌﾟﾛｴﾝﾄﾞⅡ #25G',
    category_code: db.categories.find({ name: '医療用消耗品' })[0]._id,
    maker:         '山八',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'ＦＥＥＤ' })[0]._id,
    min_price:   138.15,
    cur_price:   141.75,
    max_price:   147.25,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          '361-961 大型ﾏｼﾞｯｸｲﾝｷ 赤',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'ｱｽｸﾙ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   138.15,
    cur_price:   141.75,
    max_price:   147.25,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          '399-707 ﾏｯｷ極細 MO-120-MC 緑',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         'ｾﾞﾌﾞﾗ',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   138.15,
    cur_price:   141.75,
    max_price:   147.25,
    note:        '',
    is_alive:    true
});

db.products.insert({
    name:          '589-7103 小判ぞうきん 200×150mm',
    category_code: db.categories.find({ name: '事務用品' })[0]._id,
    maker:         '丸眞',
    is_common_item: false,
    department_codes: [
        db.departments.find({ name: 'SPD' })[0]._id
    ],
    trader_code: db.traders.find({ name: 'アスクル' })[0]._id,
    min_price:   138.15,
    cur_price:   141.75,
    max_price:   147.25,
    note:        '',
    is_alive:    true
});


// ユーザ
db.users.insert({
    account: 'ord0',
    hash:    '$2a$10$bhHirIDV1cu9nROVKG45z.DaaNOMDacUx8T7lMTAdd.gIcK9svcEu',
    name:    '普通 太郎',
    email:   'ord0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '小児歯科' })[0]._id,
        administrate:     false,
        draft_ordinarily: true,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    }],
    is_alive: true
});

db.users.insert({
    account: 'ord1',
    hash:    '$2a$10$bR0wrdlmYgAkB5y39AQkhui25dyOp1LG7WD58qILunT4h5StcVi6q',
    name:    '通常 花子',
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
            code: db.departments.find({ name: '総合診療科Ⅰ' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '矯正科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: 'ﾍﾟﾘｵｹｱ外来' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '口腔外科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '障害者歯科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        }
    ],
    is_alive: true
});

db.users.insert({
    account: 'med',
    hash:    '$2a$10$yBKKtP1f9HZ40n5hgQRMn.Hds5a1.h2c.w1DydzIPioDDXfTXZfQC',
    name:    '薬剤 二郎',
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
    ],
    is_alive: true
});

db.users.insert({
    account: 'spd',
    hash:    '$2a$10$uZ0GoMnUNGIeyhmFrmeFzOKDoYHz2LBa9ZI.T9/DPNHj.R5cbDUgK',
    name:    '何でも でき太',
    email:   'spd@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: true,
        draft_urgently:   true,
        process_order:    true,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: 'SPD' })[0]._id,
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    }],
    is_alive: true
});

db.users.insert({
    account: 'spdadm',
    hash:    '$2a$10$UCVQuW3fwXjiVzIgfGi6P.HsyxjbtPEYX9fi6gMB30HTEy9jzwBWm',
    name:    '管理者 一郎',
    email:   'spdadm@example.jp',
    privileged: {
        administrate:     true,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: 'SPD' })[0]._id,
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          true
    }],
    is_alive: true
});

db.users.insert({
    account: 'dir',
    hash:    '$2a$10$oGmaZbxpIv4qnGvu/ou2h.bzfY3PaSEyyw5LNtQRbEKaec7iPWK4G',
    name:    '管理者 です代',
    email:   'dir@example.jp',
    privileged: {
        administrate:     true,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          true
    },
    departments: [{
        code: db.departments.find({ name: '院長室' })[0]._id,
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    }],
    is_alive: true
});

db.users.insert({
    account: 'chief0',
    hash:    '$2a$10$0IsbDoLZpIiwmeLLt32cW.EmlpAsxBbLDPPDsOASTTswr9EMxafAK',
    name:    '小児歯科 課長',
    email:   'chief0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '小児歯科' })[0]._id,
        administrate:     true,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          true
    }],
    is_alive: true
});

db.users.insert({
    account: 'chief1',
    hash:    '$2a$10$MKWRHmZaQsHre.PTQx457.cNLnl29aL8hCOloOiV7ja.SfMDEgzXy',
    name:    'マルチ 部長',
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
            code: db.departments.find({ name: '小児歯科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '総合診療科Ⅰ' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '矯正科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: 'ﾍﾟﾘｵｹｱ外来' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '口腔外科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
        {
            code: db.departments.find({ name: '障害者歯科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        }
    ],
    is_alive: true
});

db.users.insert({
    account: 'irr',
    hash:    '$2a$10$6jDTHoY10z95J9jjS3PA6.A0X/iLT.t2FX/we3UkDbYYDGSFeDpSq',
    name:    '例外 三郎',
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
            code: db.departments.find({ name: '小児歯科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   false,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '口腔外科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '障害者歯科' })[0]._id,
            administrate:     true,
            draft_ordinarily: false,
            draft_urgently:   false,
            process_order:    false,
            approve:          true
        },
    ],
    is_alive: true
});

db.users.insert({
    account: 'urg0',
    hash:    '$2a$10$SWlN1Vf/jsxEOe3Q6ZEN5.Ca9OedtK6oiGWsdSYX2Y7zZBtHz1p1S',
    name:    '緊急 次郎',
    email:   'urg0@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '病棟' })[0]._id,
        administrate:     false,
        draft_ordinarily: true,
        draft_urgently:   true,
        process_order:    false,
        approve:          false
    }],
    is_alive: true
});

db.users.insert({
    account: 'urg1',
    hash:    '$2a$10$q7bE.djIHz7JZjeO5Br/e.OO8zSlt6DAb0cvEKIPtxRITt2mV8Gq6',
    name:    '緊急 優子',
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
            code: db.departments.find({ name: '病棟' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '歯科麻酔科' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        },
        {
            code: db.departments.find({ name: '手術室' })[0]._id,
            administrate:     false,
            draft_ordinarily: true,
            draft_urgently:   true,
            process_order:    false,
            approve:          false
        }
    ],
    is_alive: true
});

db.users.insert({
    account: 'appmed',
    hash:    '$2a$10$T6J/T0f8yTBD4iXFHJV96eRrL7Syq/ACVptdj5Xvm6S1Tx3cpgaoy',
    name:    '薬 新太郎',
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
    ],
    is_alive: true
});

db.users.insert({
    account: 'void',
    hash:    '$2a$10$2662AL.7FbIdD6.t9CrExuISX7kbdH.k7i8pT.5MPxibsqNwZJ3Vm',
    name:    'パート ハナコ',
    email:   'void@example.jp',
    privileged: {
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    },
    departments: [{
        code: db.departments.find({ name: '矯正科' })[0]._id,
        administrate:     false,
        draft_ordinarily: false,
        draft_urgently:   false,
        process_order:    false,
        approve:          false
    }],
    is_alive: true
});


// アカウントでユニークな index を作成する (重複アカウントが許可されなくなる)
db.users.createIndex({ account: 1 }, { unique: true });


// 勘定科目
db.account_titles.insert({
    name:     '旅費・交通費',
    is_alive: true
});

db.account_titles.insert({
    name:     '消耗品費',
    is_alive: true
});

db.account_titles.insert({
    name:     '検査などの業務委託費',
    is_alive: true
});

db.account_titles.insert({
    name:     '修理費',
    is_alive: true
});

db.account_titles.insert({
    name:     '医薬品材料費',
    is_alive: true
});

db.account_titles.insert({
    name:     '消耗備品費',
    is_alive: true
});

db.account_titles.insert({
    name:     '給食材料費',
    is_alive: true
});

db.account_titles.insert({
    name:     '備品費',
    is_alive: true
});

db.account_titles.insert({
    name: 'その他'
});
