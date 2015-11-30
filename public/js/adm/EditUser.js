'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var TableFrame = require('../components/TableFrame');

var EditUser = React.createClass({
    propTypes: {
        user: React.PropTypes.shape({
            account:    React.PropTypes.string.isRequired,
            name:       React.PropTypes.string.isRequired,
            tel:        React.PropTypes.string.isRequired,
            email:      React.PropTypes.string.isRequired,
            privileged: React.PropTypes.shape({
                administrate:     React.PropTypes.bool.isRequired,
                draft_ordinarily: React.PropTypes.bool.isRequired,
                draft_urgently:   React.PropTypes.bool.isRequired,
                process_order:    React.PropTypes.bool.isRequired,
                approve:          React.PropTypes.bool.isRequired
            }).isRequired,
            departments: React.PropTypes.arrayOf(React.PropTypes.shape({
                code: React.PropTypes.string.isRequired,
                administrate:     React.PropTypes.bool.isRequired,
                draft_ordinarily: React.PropTypes.bool.isRequired,
                draft_urgently:   React.PropTypes.bool.isRequired,
                process_order:    React.PropTypes.bool.isRequired,
                approve:          React.PropTypes.bool.isRequired
            }) ).isRequired
        }),

        departments: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired,

        goBack: React.PropTypes.func.isRequired
    },

    render: function() {
        var title = [
            { name: '+/-',             type: 'void' },
            { name: '所属 部門診療科', type: 'string' },
            { name: 'システム管理',    type: 'void' },
            { name: '通常発注起案',    type: 'void' },
            { name: '緊急発注起案',    type: 'void' },
            { name: '発注処理',        type: 'void' },
            { name: '承認',            type: 'void' },
        ];

        var data = [];

        return (
            <div id="edit-user">
              <fieldset>
                <legend>基本情報</legend>
                <div id="edit-user-inputs">
                  <div className="edit-user-input">
                    <Input type="text"
                           bsSize="small"
                           maxLength="32"
                           ref="account"
                           placeholder="アカウント"/>
                  </div>
                  <div id="edit-user-name">
                    <Input type="text"
                           bsSize="small"
                           maxLength="32"
                           ref="name"
                           placeholder="氏名"/>
                  </div>
                  <div className="edit-user-input">
                    <Input type="text"
                           bsSize="small"
                           maxLength="32"
                           ref="passphrase"
                           placeholder="暫定パスワード"/>
                  </div>
                  <div id="edit-user-tel">
                    <Input type="text"
                           bsSize="small"
                           maxLength="8"
                           ref="tel"
                           placeholder="内線番号"/>
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <legend>全部門診療科に跨がる権限</legend>
                <div id="edit-user-checkboxes">
                  <div className="edit-user-checkbox">
                    <Input type="checkbox"
                           label="システム管理"
                           ref="privileged-administrate" />
                  </div>
                  <div className="edit-user-checkbox">
                    <Input type="checkbox"
                           label="通常発注起案"
                           ref="privileged-draft-ordinarily" />
                  </div>
                  <div className="edit-user-checkbox">
                    <Input type="checkbox"
                           label="緊急発注起案"
                           ref="privileged-draft-urgently" />
                  </div>
                  <div className="edit-user-checkbox">
                    <Input type="checkbox"
                           label="発注処理"
                           ref="privileged-process-order" />
                  </div>
                  <div className="edit-user-checkbox">
                    <Input type="checkbox"
                           label="承認"
                           ref="privileged-approve" />
                  </div>
                </div>
              </fieldset>
              <fieldset id="edit-user-table-frame">
                <legend>所属する部門診療科とそれに対する権限</legend>
                <TableFrame id="edit-user-departments"
                            title={title}
                            data={data} />
              </fieldset>
              <div id="edit-user-buttons">
                <Button bsSize="small" onClick={function() {} }>
                  登録
                </Button>
              </div>
            </div>
        );
    }
});

module.exports = EditUser;
