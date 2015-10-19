'use strict';
var express    = require('express');
var https      = require('https');
var fs         = require('fs');
var bodyParser = require('body-parser');
var session    = require('express-session');

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
