'use strict';
var express    = require('express');
var https      = require('https');
var fs         = require('fs');
var bodyParser = require('body-parser');
var session    = require('express-session');
var log4js     = require('log4js');

var logout                     = require('./logout');
var pickMenuItemsForSearchPane = require('./pickMenuItemsForSearchPane');

var authenticateUser = require('./authenticateUser');
var searchCandidates = require('./searchCandidates');
var registerOrder    = require('./registerOrder');
var updateOrder      = require('./updateOrder');
var eraseOrder       = require('./eraseOrder');
var changeOrderState = require('./changeOrderState');
var searchOrders     = require('./searchOrders');

var $ = express();


/*
 * SSL 証明書
 */
https.createServer({
    key:  fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
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
            filename: 'log/info.log',
        },
        {
            /*
             * とりあえず継続動作可能だが、何らかの対策が必要なエラーのログ。
             * DB にデータの不整合が発生しているとか、ネットワーク障害など。
             */
            type:     'file',
            category: 'warning',
            filename: 'log/warning.log',
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
            filename: 'log/critical.log',
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
$.get('/logout',                     logout);
$.get('/pickMenuItemsForSearchPane', pickMenuItemsForSearchPane);

$.post('/authenticateUser', authenticateUser);
$.post('/searchCandidates', searchCandidates);
$.post('/registerOrder',    registerOrder);
$.post('/updateOrder',      updateOrder);
$.post('/eraseOrder',       eraseOrder);
$.post('/changeOrderState', changeOrderState);
$.post('/searchOrders',     searchOrders);
