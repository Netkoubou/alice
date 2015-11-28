'use strict';
var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var XHR    = require('superagent');

var RegisterMessage = React.createClass({
    registerMessage: function() {
        XHR.post('registerFooterMessage').send({
            message: this.refs.message.getValue()
        }).end(function(err, res) {
            var errmsg_index = 'REGISTER_MESSAGE_REGISTER_FOOTER_MESSAGE';

            if (err) {
                alert(Messages.ajax[errmsg_index]);
                throw 'ajax_regsiterFooterMessage';
            }

            if (res.body.status != 0) {
                alert(Messages.server[errmsg_index]);
                throw 'server_regsiterFooterMessage';
            }

            alert('登録しました。');
        });
    },

    render: function() {
        return (
            <fieldset id="register-message">
              <Input type="text"
                     ref="message"
                     maxLength="128"
                     placeholder="メッセージ" />
              <Button onClick={this.registerMessage}>登録</Button>
            </fieldset>
        );
    }
});

module.exports = RegisterMessage;
