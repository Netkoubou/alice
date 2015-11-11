'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Notice     = require('../components/Notice');
var Messages   = require('../lib/Messages');

var ApplyCost = React.createClass({
    getInitialState: function() {
        return {
            departments:    [],
            account_titles: [],
            department:     { code: '', name: '' },
            account_title:  { code: '', name: '' },
            breakdowns:     []
        };
    },

    onSelectDepartment:   function(e) { this.setState({ department: e }); },
    onSelectAccountTitle: function(e) { this.setState({ account_title: e }); },
    onClear:              function()  { this.setState({ breakdowns: [] }); },

    onRegister: function() {
        XHR.post('applyCost').send({
            breakdowns: breakdowns
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.APPLY_COST_APPLY_COST);
                throw 'ajax_applyCost';
            }

            if (res.body.status != 0) {
                alert(Messages.server.APPLY_COST_APPLY_COST);
                throw 'server_applyCost';
            }

            alert('申請しました。')

        });
    },

    render: function() {
        var department_placeholder = '申請元 部門診療科';

        if (this.state.departments.length == 1) {
            department_placeholder = this.state.departments[0].name;
        }

        var title = [
            { name: '日付',        type: 'string' },
            { name: '品名',        type: 'string' },
            { name: '数量',        type: 'number' },
            { name: '単価',        type: 'number' },
            { name: '小計',        type: 'number' },
            { name: '摘要 / 備考', type: 'string' }
        ];

        return (
            <div id="apply-cost">
              <div id="apply-cost-selects"> 
                <span className="apply-cost-select">
                  <Select placeholder={department_placeholder}
                          value={this.state.department.code}
                          onSelect={this.onSelectDepartment}
                          options={this.state.departments} />
                </span>
                <span className="apply-cost-select">
                  <Select placeholder="勘定科目"
                          value={this.state.account_title.code}
                          onSelect={this.onSelectAccountTitle}
                          options={this.state.account_titles} />
                </span>
              </div>
              <TableFrame id="apply-cost-breakdowns"
                          title={title} data={this.state.breakdowns} />
              <div id="apply-cost-total">
                <Notice title="合計">100</Notice>
              </div>
              <div id="apply-cost-buttons">
                <Button bsSize="small" onClick={this.onClear}>クリア</Button>
                <Button bsSize="small" onClick={this.onRegister}>登録</Button>
              </div>
            </div>
        );
    }
});

module.exports = ApplyCost;
