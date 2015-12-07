'use strict';
var ObjectID = require('mongodb').ObjectID;
var bcrypt   = require('bcrypt');
var log4js   = require('log4js');
var util     = require('./util');

var log_info = log4js.getLogger('info');
var log_warn = log4js.getLogger('warning');
var log_crit = log4js.getLogger('critical');

module.exports = function(req, res) {
    if (req.session.user == null) {
        res.json({ status: 255 });
        log_warn.warn('[bookCost] invalid session.');
        return;
    }

    var user = req.body;

    user.hash     = bcrypt.hashSync(user.passphrase, bcrypt.genSaltSync() );
    user.is_alive = true;
    user.departments.forEach(function(d) { d.code = new ObjectID(d.code) });
    delete user.passphrase;

    util.query(function(db) {
        db.collection('users').insertOne(user, function(err, result) {
            var msg;

            db.close();

            if (err == null) {
                res.json({ status: 0 });

                msg = '[registerUser] registered user: "' + user.account +
                      '" by "' + req.session.user.account + '".';

                log_info.info(msg);
            } else {
                /*
                 * ここに来るということは、insertOne 操作でエラーが発生した、
                 * ということなのだが、残念ながら
                 *
                 *   0. 既に存在するアカウントで登録しようとして失敗したのか、
                 *   1. MongoDB に何らかの不具合が発生したのか、
                 *
                 * を判別することができない。
                 * そのため、ここでは「後者のようなエラーが発生する確率は
                 * かなり低いが、前者のエラーは十分発生しうる」と思い込む
                 * ことにして、前者のエラーが発生したことにしちゃう。
                 */
                res.json({ status: 1 });

                log_warn.warn(err);

                msg = '[registerUser] ' + 
                      'failed to register user: "' + user.account +
                      '" by "' + req.session.user.account + '".';

                log_warn.warn(msg);
            }                
        });
    });
};
