'use strict';
var React      = require('react');
var Button     = require('react-bootstrap').Button;
var DatePicker = require('react-datepicker');
var XHR        = require('superagent');
var moment     = require('moment');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Notice     = require('../components/Notice');
var Messages   = require('../lib/Messages');

var AddItem = React.createClass({
    propTypes: { onClick: React.PropTypes.func.isRequired },

    render: function() {
        return (
            <div className="apply-cost-add-item" onClick={this.props.onClick}>
              +
            </div>
        );
    }
});

var RemoveItem = React.createClass({
    propTypes: { onClick: React.PropTypes.func.isRequired },

    render: function() {
        return (
            <div className="apply-cost-remove-item"
                 onClick={this.props.onClick}>
              -
            </div>
        );
    }
});

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

    onAdd: function() {
        this.state.breakdowns.push({
            date:    '',
            article: '',
            quantity: 0,
            price:    0,
            note:    ''
        });

        this.setState({ breakdowns: this.state.breakdowns });
    },

    onRemove: function(index) {
        return function() {
            var a = this.state.breakdowns;
        
            this.setState({
                breakdowns: a.slice(0, index).concat(a.slice(index + 1) )
            });
        }.bind(this);
    },

    onChange: function(index, attribute) {
        return function(value) {
            this.state.breakdowns[index][attribute] = value;
            this.setState({ breakdowns: this.state.breakdowns });
        }.bind(this);
    },

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
            { name: '+/-',         type: 'void' },
            { name: '日付',        type: 'void' },
            { name: '品名',        type: 'void' },
            { name: '数量',        type: 'void' },
            { name: '単価',        type: 'void' },
            { name: '小計',        type: 'void' },
            { name: '摘要 / 備考', type: 'void' }
        ];

        var data = this.state.breakdowns.map(function(b, i) {
            var weekdays = [ '日', '月', '火', '水', '木', '金', '土' ];

            return [
                {
                    value: '',
                    view:  <RemoveItem onClick={this.onRemove(i)} />
                },
                {
                    value: b.date,
                    view:  <DatePicker className="apply-cost-date"
                                       dateFormat="YYYY/MM/DD"
                                       selected={moment()}
                                       weekdays={weekdays}
                                       onChange={function() {} } />
                },
                {
                    value: b.article,
                    view:  <TableFrame.Input key={Math.random()}
                             type="string"
                             placeholder={b.article}
                             ref={'article' + i.toString()}
                             onChange={this.onChange(i, 'article')} />
                },
                {
                    value: b.quantity,
                    view:  <TableFrame.Input key={Math.random()}
                             type="int"
                             placeholder={b.quantity.toLocaleString()}
                             ref={'quantity' + i.toString()}
                             onChange={this.onChange(i, 'quantity')} />
                },
                {
                    value: b.price,
                    view:  <TableFrame.Input key={Math.random()}
                             type="int"
                             placeholder={b.price.toLocaleString()}
                             ref={'price' + i.toString()}
                             onChange={this.onChange(i, 'price')} />
                },
                {
                    value:  b.price * b.quantity,
                    view:  (b.price * b.quantity).toLocaleString()
                },
                {
                    value: b.note,
                    view:  <TableFrame.Input key={Math.random()}
                             type="string"
                             placeholder={b.note}
                             ref={'note' + i.toString()}
                             onChange={this.onChange(i, 'note')} />
                },
            ];
        }.bind(this) );

        data.push([
            { value: '', view: <AddItem onClick={this.onAdd} /> },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
        ]);

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
                          title={title} data={data} />
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
