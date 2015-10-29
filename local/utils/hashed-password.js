#!/usr/bin/node

var bcrypt     = require('bcrypt');
var passphrase = process.argv[2];
var hash       = (bcrypt.hashSync(passphrase, bcrypt.genSaltSync() ) );

if (bcrypt.compareSync(passphrase, hash) ) {
    console.log(hash);
} else {
    console.log('OOPS! hash does NOT match passphrase input.');
}
