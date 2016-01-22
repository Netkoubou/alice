'use strict';
var express    = require('express');
var session    = require('express-session');
var https      = require('https');
var fs         = require('fs');
var bodyParser = require('body-parser');
var log4js     = require('log4js');

var logout                        = require('./logout');
var pickMenuItemsForSearchPane    = require('./pickMenuItemsForSearchPane');
var pickMenuItemsToApplyCost      = require('./pickMenuItemsToApplyCost');
var pickMenuItemsToManageProducts = require('./pickMenuItemsToManageProducts');
var tellAvailableDepartments      = require('./tellAvailableDepartments');
var tellAll                       = require('./tellAll');
var getFooterMessage              = require('./getFooterMessage');

var authenticateUser         = require('./authenticateUser');
var searchCandidates         = require('./searchCandidates');
var registerOrder            = require('./registerOrder');
var updateOrder              = require('./updateOrder');
var eraseOrder               = require('./eraseOrder');
var changeOrderState         = require('./changeOrderState');
var searchOrders             = require('./searchOrders');
var changePassword           = require('./changePassword');
var registerFooterMessage    = require('./registerFooterMessage');
var bookCost                 = require('./bookCost');
var lookupCosts              = require('./lookupCosts');
var fixCost                  = require('./fixCost');
var listUsers                = require('./listUsers');
var registerUser             = require('./registerUser');
var updateUser               = require('./updateUser');
var eraseUser                = require('./eraseUser');
var searchProducts           = require('./searchProducts');
var registerProduct          = require('./registerProduct');
var updateProduct            = require('./updateProduct');
var eraseProduct             = require('./eraseProduct');
var registerItem             = require('./registerItem');
var updateItem               = require('./updateItem');
var eraseItem                = require('./eraseItem');
var collectBudgetsAndIncomes = require('./collectBudgetsAndIncomes');
var computeOutgoes           = require('./computeOutgoes');
var bookBudgetsAndIncomes    = require('./bookBudgetsAndIncomes');

var $ = express();


/*
 * SSL 証明書
 */
https.createServer({
    key:  fs.readFileSync('local/certs/key.pem'),
    cert: fs.readFileSync('local/certs/cert.pem')
}, $).listen(8080);


/*
 * ユーザセッション
 */
$.use(session({
    secret:            'keyboard cat',
    resave:            false,
    saveUninitialized: false,
    cookie: { secure: true }
}) );


/*
 * ログ
 */
log4js.configure({
    appenders: [
        {
            /*
             * システムの動作記録。
             * 誰それがログインしたとか、これこれの API が発行された、など。
             * いわゆるトレーサビリティのためのログ。
             */
            type:     'file',
            category: 'info',
            filename: 'local/log/info.log',
        },
        {
            /*
             * とりあえず継続動作可能だが、何らかの対策が必要なエラーのログ。
             * DB にデータの不整合が発生しているとか、ネットワーク障害など。
             */
            type:     'file',
            category: 'warning',
            filename: 'local/log/warning.log',
        },
        {
            /*
             * 継続動作が危ぶまれる若しくは不可能なエラーのログ。
             * システム資源の枯渇 (メモリとかストレージとか) など。
             * node でそんなエラーを検知できるとは思えないので、
             * まぁかたちだけ用意してみました、って感じ。
             */
            type:     'file',
            category: 'ctitical',
            filename: 'local/log/critical.log',
        }
    ]
});


/*
 * 通常の HTTP リクエスト用
 */
$.use(express.static('public') );


/*
 * POST されてきた JSON のデコード用
 */
$.use(bodyParser.json() );
$.use(bodyParser.urlencoded({ extended: true }) );


/*
 * ルーティング
 */
$.get('/logout',                        logout);
$.get('/pickMenuItemsForSearchPane',    pickMenuItemsForSearchPane);
$.get('/pickMenuItemsToApplyCost',      pickMenuItemsToApplyCost);
$.get('/pickMenuItemsToManageProducts', pickMenuItemsToManageProducts);
$.get('/tellAvailableDepartments',      tellAvailableDepartments);
$.get('/tellAllDepartments',            tellAll('departments') );
$.get('/tellAllCategories',             tellAll('categories') );
$.get('/tellAllTraders',                tellAll('traders') );
$.get('/getFooterMessage',              getFooterMessage);

$.post('/authenticateUser',         authenticateUser);
$.post('/searchCandidates',         searchCandidates);
$.post('/registerOrder',            registerOrder);
$.post('/updateOrder',              updateOrder);
$.post('/eraseOrder',               eraseOrder);
$.post('/changeOrderState',         changeOrderState);
$.post('/searchOrders',             searchOrders);
$.post('/changePassword',           changePassword);
$.post('/registerFooterMessage',    registerFooterMessage);
$.post('/bookCost',                 bookCost);
$.post('/lookupCosts',              lookupCosts);
$.post('/fixCost',                  fixCost);
$.post('/listUsers',                listUsers);
$.post('/registerUser',             registerUser);
$.post('/updateUser',               updateUser);
$.post('/eraseUser',                eraseUser);
$.post('/searchProducts',           searchProducts);
$.post('/registerProduct',          registerProduct);
$.post('/updateProduct',            updateProduct);
$.post('/eraseProduct',             eraseProduct);
$.post('/registerItem',             registerItem);
$.post('/updateItem',               updateItem);
$.post('/eraseItem',                eraseItem);
$.post('/collectBudgetsAndIncomes', collectBudgetsAndIncomes);
$.post('/computeOutgoes',           computeOutgoes);
$.post('/bookBudgetsAndIncomes',    bookBudgetsAndIncomes);
