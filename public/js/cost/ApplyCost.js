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
    propTypes: {
        userName: React.PropTypes.string.isRequired,
        cost:     React.PropTypes.object,
        goBack:   React.PropTypes.func
    },

    getInitialState: function() {
        var department    = { code: '', name: '' };
        var account_title = { code: '', name: '' };
        var remark        = '';
        var breakdowns    = [];

        if (this.props.cost != undefined) {
            department = {
                code: this.props.cost.department_code,
                name: this.props.cost.department_name
            };

            account_title = {
                code: this.props.cost.account_title_code,
                name: this.props.cost.account_title_name
            };

            remark = this.props.cost.cost_remark;

            breakdowns = this.props.cost.breakdowns.map(function(b) {
                var match = b.article.match(/^(([^:]+):)?(.*)$/);

                var trader  = match[2] || '';
                var article = match[3] || '';

                return {
                    date:     b.date,
                    trader:   trader,
                    article:  article,
                    quantity: b.quantity,
                    price:    b.price,
                    note:     b.note
                };
            });
        }

        return {
            departments:    [],
            traders:        [],
            account_titles: [],
            department:     department,
            account_title:  account_title,
            remark:         remark,
            breakdowns:     breakdowns,
            key_sfx:        0
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
            trader:   '',
            article:  '',
            quantity: 1,
            price:    0,
            note:     ''
        });

        this.setState({ breakdowns: this.state.breakdowns });
    },

    onRemove: function(index) {
        return function() {
            var a = this.state.breakdowns;
        
            this.setState({
                breakdowns: a.slice(0, index).concat(a.slice(index + 1) ),
                key_sfx:    this.state.key_sfx + 1
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

            if (row.quantity < 0) {
                alert('数量には 0 以上の値を指定して下さい。');
                e = this.refs["quantity" + i.toString()];
                ReactDOM.findDOMNode(e).select();
                return;
            }
        }

        XHR.post('bookCost').send({
            department_code:    this.state.department.code,
            account_title_code: this.state.account_title.code,
            cost_remark:        this.state.remark,
            breakdowns:         this.composeBreakdowns()
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.APPLY_COST_BOOK_COST);
                throw 'ajax_bookCost';
            }

            if (res.body.status != 0) {
                alert(Messages.server.APPLY_COST_BOOK_COST);
                throw 'server_bookCost';
            }

            alert('申請しました。')

            this.print(res.body.cost_code);

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

    composeBreakdowns: function() {
        return this.state.breakdowns.map(function(b) {
            var article;

            if (b.trader === '') {
                article = b.article;
            } else {
                article = b.trader + ':' + b.article;
            }

            return {
                article:  article,
                date:     b.date,
                quantity: b.quantity,
                price:    b.price,
                note:     b.note
            };
        });
    },

    onUpdate() {
        for (var i = 0; i < this.state.breakdowns.length; i++) {
            var row = this.state.breakdowns[i];
            var e;

            if (row.article === '') {
                alert('品名を入力して下さい。');
                e = this.refs["article" + i.toString()];
                ReactDOM.findDOMNode(e).focus();
                return;
            }

            if (row.quantity < 0) {
                alert('数量には 0 以上の値を指定して下さい。');
                e = this.refs["quantity" + i.toString()];
                ReactDOM.findDOMNode(e).select();
                return;
            }

            if (row.price < 0) {
                alert('単価には 0 以上の値を指定して下さい。');
                e = this.refs["price" + i.toString()];
                ReactDOM.findDOMNode(e).select();
                return;
            }
        }

        XHR.post('updateCost').send({
            cost_code:          this.props.cost.cost_code,
            account_title_code: this.state.account_title.code,
            cost_remark:        this.state.remark,
            breakdowns:         this.composeBreakdowns()
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.APPLY_COST_UPDATE_COST);
                throw 'ajax_updateCost';
            }

            if (res.body.status != 0) {
                alert(Messages.server.APPLY_COST_UPDATE_COST);
                throw 'server_updateCost';
            }

            alert('更新しました。');
        }.bind(this) );
    },

    print: function(cost_code) {
        var drafting_date;

        if (this.props.cost == null) {
            drafting_date = moment().format('YYYY/MM/DD'); 
        } else {
            drafting_date = this.props.cost.drafting_date;
        }

        window.info = {
            drafter:       this.props.userName,
            cost_code:     cost_code,
            drafting_date: drafting_date,
            department:    this.state.department.name,
            account_title: this.state.account_title.name,
            breakdowns:    this.composeBreakdowns()
        };

        window.open(
            'preview-cost-application.html',
            '経費精算申請書 印刷プレビュー'
        );
    },

    onPrint: function() { this.print(this.props.cost.cost_code); },

    componentDidMount: function() {
        XHR.get('pickMenuItemsToApplyCost').set({
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
            var errmsg_index = 'APPLY_COST_PICK_MENU_ITEMS_TO_APPLY_COST';

            if (err) {
                alert(Messages.ajax[errmsg_index]);
                throw 'ajax_pickMenuItemsToApplyCost';
            }

            if (res.body.status != 0) {
                alert(Messages.server[errmsg_index]);
                throw 'server_pickMenuItemsToApplyCost';
            }

            var departments;


            /*
             * 申請後の経費精算の編集で、部門診療科を変更させないための処理。
             * 申請すると、部門診療科の略号が入った起案番号が付与されるのだが、
             * その後で部門診療科を変更してしまうと、起案番号の略号と異なっ
             * てしまう。
             * 以下はそれを防止するためのコード。
             */
            if (this.state.department.code == '') {
                if (res.body.departments.length == 1) {
                    this.state.department = {
                        code: res.body.departments[0].code,
                        name: res.body.departments[0].name
                    }
                }

                departments = res.body.departments;
            } else {
                departments = [ this.state.department ];
            }

            var account_titles = res.body.account_titles;
            

            /*
             * 品名に販売元の名称を選択形式で入力できるようにするため、
             * 販売元名の一覧を作成する。
             */
            XHR.get('tellAllTraders').set({
                'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
            }).end(function(err, res) {
                var errmsg_index = 'APPLY_COST_TELL_ALL_TRADERS';

                if (err) {
                    alert(Messages.ajax[errmsg_index]);
                    throw 'ajax_tellAllTraders';
                }

                if (res.body.status != 0) {
                    alert(Messages.server[errmsg_index]);
                    throw 'server_pickMenuItemsToApplyCost';
                }

                var traders = res.body.traders.map(function(t) {
                    return t.name;
                });

                this.setState({
                    departments:    departments,
                    traders:        traders,  
                    account_titles: account_titles,
                    department:     this.state.department
                });
            }.bind(this) );
        }.bind(this) );
    },

    makeTableFrameTitle: function() {
        return [
            { name: '+/-',         type: 'void' },
            { name: '購入日',      type: 'void' },
            { name: '業者',        type: 'void' },
            { name: '品名',        type: 'void' },
            { name: '数量',        type: 'void' },
            { name: '単価',        type: 'void' },
            { name: '小計',        type: 'void' },
            { name: '摘要 / 備考', type: 'void' }
        ];
    },

    composeTableFrameDataRow: function(breakdown, index) {
        var weekdays = [ '日', '月', '火', '水', '木', '金', '土' ];
        var key_sfx  = index.toString() + '_' + this.state.key_sfx.toString();

        return [
            {
                value: '',
                view:  <RemoveItem onClick={this.onRemove(index)} />
            },
            {
                value: breakdown.date,
                view:  <DatePicker
                         className="apply-cost-date table-frame-input"
                         dateFormat="YYYY/MM/DD"
                         dateFormatCalendar="YYYY/MM/DD"
                         selected={moment(breakdown.date, 'YYYY/MM/DD')}
                         weekdays={weekdays}
                         weekStart='0'
                         onChange={this.onChangeDate(index)} />
            },
            {
                value: breakdown.trader,
                view:  <TableFrame.Input
                         type="string"
                         placeholder={breakdown.trader}
                         key={'trader' + key_sfx}
                         ref={'trader' + index.toString()}
                         options={this.state.traders}
                         onChange={this.onChange(index, 'trader')} />
            },
            {
                value: breakdown.article,
                view:  <TableFrame.Input
                         type="string"
                         placeholder={breakdown.article}
                         key={'article' + key_sfx}
                         ref={'article' + index.toString()}
                         onChange={this.onChange(index, 'article')} />
            },
            {
                value: breakdown.quantity,
                view:  <TableFrame.Input
                         type="int"
                         placeholder={breakdown.quantity.toLocaleString()}
                         key={'quantity' + key_sfx}
                         ref={'quantity' + index.toString()}
                         onChange={this.onChange(index, 'quantity')} />
            },
            {
                value: breakdown.price,
                view:  <TableFrame.Input
                         type="int"
                         placeholder={breakdown.price.toLocaleString()}
                         key={'price' + key_sfx}
                         ref={'price' + index.toString()}
                         onChange={this.onChange(index, 'price')} />
            },
            {
                value:  breakdown.price * breakdown.quantity,
                view:  (breakdown.price * breakdown.quantity).toLocaleString()
            },
            {
                value: breakdown.note,
                view:  <TableFrame.Input
                         type="string"
                         placeholder={breakdown.note}
                         key={'note' + key_sfx}
                         ref={'note' + index.toString()}
                         onChange={this.onChange(index, 'note')} />
            },
        ];
    },

    render: function() {
        var department_placeholder = '申請元 部門診療科';

        if (this.state.departments.length == 1) {
            department_placeholder = this.state.departments[0].name;
        }

        var total = 0;
        var title = this.makeTableFrameTitle();
        var data  = this.state.breakdowns.map(function(b, i) {
            total += b.price * b.quantity;
            return this.composeTableFrameDataRow(b, i);
        }.bind(this) );

        data.push([
            { value: '', view: <AddItem onClick={this.onAdd} /> },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
        ]);

        var go_back_button = null;

        if (this.props.goBack != undefined) {
            go_back_button = (
                <Button onClick={this.props.goBack}
                        bsSize="large"
                        bsStyle="primary"
                        className="apply-cost-button">
                  戻る
                </Button>
            )
        }

        var print_button = null
        var register_or_update_button;

        if (this.props.cost == undefined) {
            register_or_update_button = (
                <Button onClick={this.onRegister}
                        bsSize="large"
                        bsStyle="primary"
                        className="apply-cost-button">
                  登録
                </Button>
            );
        } else {
            print_button = (
                <Button onClick={this.onPrint}
                        bsSize="large"
                        bsStyle="primary"
                        className="apply-cost-button">
                  印刷
                </Button>
            );

            register_or_update_button = (
                <Button onClick={this.onUpdate}
                        bsSize="large"
                        bsStyle="primary"
                        className="apply-cost-button">
                  更新
                </Button>
            );
        }

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
                {print_button}
                {go_back_button}
                <Button onClick={this.onClear}
                        bsSize="large"
                        bsStyle="primary"
                        className="apply-cost-button">
                  クリア
                </Button>
                {register_or_update_button}
              </div>
            </div>
        );
    }
});

module.exports = ApplyCost;
