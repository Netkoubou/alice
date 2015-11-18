'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var Button     = require('react-bootstrap').Button;
var Input      = require('react-bootstrap').Input;
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
            remark:         '',
            breakdowns:     []
        };
    },

    onSelectDepartment:   function(e) { this.setState({ department: e }); },
    onSelectAccountTitle: function(e) { this.setState({ account_title: e }); },
    onClear:              function()  { this.setState({ breakdowns: [] }); },

    onChangeRemark: function (e) {
        this.setState({ remark: e.target.value })
    },

    onAdd: function() {
        this.state.breakdowns.push({
            date:     moment().format('YYYY/MM/DD'),
            article:  '',
            quantity: 0,
            price:    0,
            note:     ''
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

    onChangeDate: function(index) {
        return function(date) {
            this.state.breakdowns[index].date = date.format('YYYY/MM/DD');
            this.setState({ breakdowns: this.state.breakdowns });
        }.bind(this);
    },

    onChange: function(index, attribute) {
        return function(value) {
            this.state.breakdowns[index][attribute] = value;
            this.setState({ breakdowns: this.state.breakdowns });
        }.bind(this);
    },

    onRegister: function() {
        if (this.state.department.code === '') {
            alert('部門診療科を選択して下さい。');
            return;
        }

        if (this.state.account_title.code === '') {
            alert('勘定科目を選択して下さい。');
            return;
        }

        if (this.state.breakdowns.length == 0) {
            alert('経費の詳細を入力して下さい。');
            return;
        }

        for (var i = 0; i < this.state.breakdowns.length; i++) {
            var row = this.state.breakdowns[i];
            var e;

            if (row.article === '') {
                alert('品名を入力して下さい。');
                e = this.refs["article" + i.toString()];
                ReactDOM.findDOMNode(e).focus();
                return;
            }

            if (row.quantity <= 0) {
                alert('数量には 0 より大きな値を指定して下さい。');
                e = this.refs["quantity" + i.toString()];
                ReactDOM.findDOMNode(e).focus();
                return;
            }

            if (row.price <= 0) {
                alert('単価には 0 より大きな値を指定して下さい。');
                e = this.refs["price" + i.toString()];
                ReactDOM.findDOMNode(e).focus();
                return;
            }

            if (row.note === '') {
                alert('摘要 / 備考を入力して下さい。');
                e = this.refs["article" + i.toString()];
                ReactDOM.findDOMNode(e).focus();
                return;
            }
        }

        XHR.post('bookCost').send({
            department_code:    this.state.department.code,
            account_title_code: this.state.account_title.code,
            remark:             this.state.remark,
            breakdowns:         this.state.breakdowns
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.APPLY_COST_BOOK_COST);
                throw 'ajax_applyCost';
            }

            if (res.body.status != 0) {
                alert(Messages.server.APPLY_COST_BOOK_COST);
                throw 'server_applyCost';
            }

            alert('申請しました。')

            var department = { code: '', name: '' };

            if (this.state.departments.length == 1) {
                department = this.state.department;
            }

            this.setState({
                department:     department,
                account_title:  { code: '', name: '' },
                remark:         '',
                breakdowns:     []
            });
        }.bind(this) );
    },

    componentDidMount: function() {
        XHR.get('pickMenuItemsToApplyCost').end(function(err, res) {
            var errmsg_index = 'APPLY_COST_PICK_MENU_ITEMS_TO_APPLY_COST';
            if (err) {
                alert(Messages.ajax[errmsg_index]);
                throw 'ajax_pickMenuItemsToApplyCost';
            }

            if (res.body.status != 0) {
                alert(Messages.server[errmsg_index]);
                throw 'server_pickMenuItemsToApplyCost';
            }

            if (res.body.departments.length == 1) {
                this.state.department = {
                    code: res.body.departments[0].code,
                    name: res.body.departments[0].name
                }
            }

            this.setState({
                departments:    res.body.departments,
                account_titles: res.body.account_titles,
                department:     this.state.department
            });
        }.bind(this) );
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

        var weekdays = [ '日', '月', '火', '水', '木', '金', '土' ];
        var total    = 0;
        var data     = this.state.breakdowns.map(function(b, i) {
            total += b.price * b.quantity;

            return [
                {
                    value: '',
                    view:  <RemoveItem onClick={this.onRemove(i)} />
                },
                {
                    value: b.date,
                    view:  <DatePicker className="apply-cost-date"
                                       dateFormat="YYYY/MM/DD"
                                       dateFormatCalendar="YYYY/MM/DD"
                                       selected={moment(b.date, 'YYYY/MM/DD')}
                                       weekdays={weekdays}
                                       weekStart='0'
                                       onChange={this.onChangeDate(i)} />
                },
                {
                    value: b.article,
                    view:  <TableFrame.Input
                             key={Math.random()}
                             type="string"
                             placeholder={b.article}
                             ref={'article' + i.toString()}
                             onChange={this.onChange(i, 'article')} />
                },
                {
                    value: b.quantity,
                    view:  <TableFrame.Input
                             key={Math.random()}
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
              <Input id="apply-cost-remark"
                     type="text"
                     bsSize="small"
                     placeholder="備考・連絡"
                     value={this.state.remark}
                     onChange={this.onChangeRemark} />
              <TableFrame id="apply-cost-breakdowns"
                          title={title} data={data} />
              <div id="apply-cost-total">
                <Notice title="合計">{total.toLocaleString()}</Notice>
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
