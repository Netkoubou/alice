'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var XHR        = require('superagent');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');

var ManageOthers = React.createClass({
    getInitialState: function() {
        return {
            target_code: '',
            table_data:  [],
            key_sfx:     0
        };
    },

    onSelectTarget: function(e) {
        var route  = '';
        var target = '';

        switch (e.code) {
        case 'DEPARTMENTS':
            route  = 'tellAllDepartments';
            break;
        case 'CATEGORIES':
            route  = 'tellAllCategories';
            break;
        case 'TRADERS':
            route = 'tellAllTraders';
            break;
        }

        XHR.get('/' + route).set({
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
            var idx = 'MANAGE_OTHERS_TELL_ALL_' + e.code;

            if (err != null) {
                alert(Messages.ajax[idx]);
                throw 'ajax_' + route;
            }

            if (res.body.status != 0) {
                alert(Messages.server[idx]);
                throw 'server_' + route;
            }

            this.setState({
                target_code: e.code,
                table_data:  res.body[e.code.toLowerCase()]
            });
        }.bind(this) );
    },

    onAddItem: function() {
        var item = {};

        switch (this.state.target_code) {
        case 'DEPARTMENTS':
            item = {
                code: '',
                name: '',
                abbr: '',
                tel:  ''
            };
            break;
        case 'CATEGORIES':
            item = {
                code: '',
                name: ''
            };
            break;
        case 'TRADERS':
            item = {
                code:          '',
                name:          '',
                tel:           '',
                fax:           '',
                email:         '',
                communication: 'fax'
            };
            break;
        }

        this.state.table_data.push(item);
        this.setState({ table_data: this.state.table_data });
    },

    validateDepartment: function(index) {
        var department = this.state.table_data[index];
        var e, is_duplicated;

        if (department.name === '') {
            alert('名前を入力して下さい。');
            e = this.refs['department_name' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        is_duplicated = this.state.table_data.filter(function(d) {
            return d.name === department.name;
        }).length > 1;
        
        if (is_duplicated) {
            alert('名前がユニークではありません。');
            e = this.refs['department_name' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        if (department.abbr === '') {
            alert('略称を入力して下さい。')
            e = this.refs['department_abbr' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        is_duplicated = this.state.table_data.filter(function(d) {
            return d.abbr === department.abbr;
        }).length > 1;

        if (is_duplicated) {
            alert('略称がユニークではありません。');
            e = this.refs['department_abbr' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        return true;
    },

    validateCategory: function(index) {
        var category = this.state.table_data[index];
        var e, is_duplicated;

        if (category.name === '') {
            alert('名前を入力して下さい。');
            e = this.refs['category_name' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        is_duplicated = this.state.table_data.filter(function(d) {
            return d.name === category.name;
        }).length > 1;

        if (is_duplicated) {
            alert('名前がユニークではありません。');
            e = this.refs['category_name' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        return true;
    },

    validateTrader: function(index) {
        var trader = this.state.table_data[index];
        var e, is_duplicated;

        if (trader.name === '') {
            alert('名前を入力して下さい。');
            e = this.refs['trader_name' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        is_duplicated = this.state.table_data.filter(function(d) {
            return d.name === trader.name;
        }).length > 1;

        if (is_duplicated) {
            alert('名前がユニークではありません。');
            e = this.refs['trader_name' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        if (trader.tel === '') {
            alert('電話番号を入力して下さい。');
            e = this.refs['trader_tel' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        if (trader.communication === 'fax' && trader.fax === '') {
            alert('FAX 番号を入力して下さい。');
            e = this.refs['trader_fax' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        if (trader.communication === 'email' && trader.email === '') {
            alert('E-Mail アドレスを入力して下さい。');
            e = this.refs['trader_email' + index.toString()];
            ReactDOM.findDOMNode(e).select();
            return false;
        }

        return true;
    },

    onRegisterOrUpdateItem: function(index) {
        return function() {
            var post = null;
            var item = this.state.table_data[index];

            switch (this.state.target_code) {
            case 'DEPARTMENTS':
                if (!this.validateDepartment(index) ) {
                    return;
                }

                post = {
                    target: this.state.target_code,
                    item: {
                        name: item.name,
                        abbr: item.abbr,
                        tel:  item.tel
                    }
                };

                break;
            case 'CATEGORIES':
                if (!this.validateCategory(index) ) {
                    return;
                }

                post = {
                    target: this.state.target_code,
                    item: {
                        name: item.name
                    }
                };

                break;
            case 'TRADERS':
                if (!this.validateTrader(index) ) {
                    return;
                }

                post = {
                    target: this.state.target_code,
                    item: {
                        name:          item.name,
                        tel:           item.tel,
                        fax:           item.fax,
                        email:         item.email,
                        communication: item.communication
                    }
                }

                break;
            }

            var route;

            if (item.code === '') {
                route = 'registerItem';
            } else {
                route     = 'updateItem';
                post.code = item.code;
            }

            XHR.post('/' + route).send(post).end(function(err, res) {
                var msg_idx;

                if (item.code === '') {
                    msg_idx = 'MANAGE_OTHERS_REGISTER_ITEM';
                } else {
                    msg_idx = 'MANAGE_OTHERS_UPDATE_ITEM';
                }

                if (err != null) {
                    alert(Messages.ajax[msg_idx]);
                    throw 'ajax_' + route;
                }

                if (res.body.status != 0) {
                    alert(Messages.server[msg_idx]);
                    throw 'server_' + route;
                }

                if (item.code === '') {
                    alert('登録しました。');
                    this.state.table_data[index].code = res.body.code;
                    this.setState({ table_data: this.state.table_data });
                }
            }.bind(this) );
        }.bind(this);
    },

    onRemoveItem: function(index) {
        return function() {
            var item_name = this.state.table_data[index].name;

            if (!confirm(item_name + ' を削除します。よろしいですか?') ) {
                return;
            }

            XHR.post('/eraseItem').send({
                target: this.state.target_code,
                code:   this.state.table_data[index].code
            }).end(function(err, res) {
                if (err != null) {
                    alert(Messages.ajax.MANAGE_OTHERS_ERASE_ITEM);
                    throw 'ajax_eraseItem';
                }

                if (res.body.status != 0) {
                    alert(Messages.server.MANAGE_OTHERS_ERASE_ITEM);
                    throw 'server_eraseItem';
                }

                alert('削除しました。');

                var head = this.state.table_data.slice(0, index);
                var tail = this.state.table_data.slice(index + 1);

                this.setState({
                    table_data: head.concat(tail),
                    key_sfx:    this.state.key_sfx + 1
                });
            }.bind(this) );
        }.bind(this);
    },

    onChangeItem: function(index, attribute) {
        return function(value) {
            this.state.table_data[index][attribute] = value;
            this.setState({ table_data: this.state.table_data });

            if (this.state.table_data[index].code != '') {
                (this.onRegisterOrUpdateItem(index))();
            }
        }.bind(this);
    },

    onSelectTraderCommunication: function(index) {
        return function(e) {
            this.state.table_data[index].communication = e.target.value;
            this.setState({ table_data: this.state.table_data });

            if (this.state.table_data[index].code != '') {
                (this.onRegisterOrUpdateItem(index))();
            }
        }.bind(this);
    },

    decideOperator: function(code, index) {
        if (code === '') {
            return (
                <div className="manage-others-update-item"
                     onClick={this.onRegisterOrUpdateItem(index)}>
                  !
                </div>
            );
        } else {
            return (
                <div className="manage-others-remove-item"
                     onClick={this.onRemoveItem(index)}>
                  -
                </div>
            );
        }
    },

    composeTableDataOfDepartments: function() {
        var data = this.state.table_data.map(function(d, i) {
            var key_sfx = i.toString() + '_' + this.state.key_sfx.toString();

            return [
                { value: '', view: this.decideOperator(d.code, i) },
                {
                    value: d.name,
                    view:  <TableFrame.Input
                             key={"department_name" + key_sfx}
                             ref={"department_name" + i.toString()}
                             placeholder={d.name}
                             onChange={this.onChangeItem(i, 'name')}
                             type="string" />
                },
                {
                    value: d.abbr, 
                    view:  <TableFrame.Input
                             key={"department_abbr" + key_sfx}
                             ref={"department_abbr" + i.toString()}
                             placeholder={d.abbr}
                             onChange={this.onChangeItem(i, 'abbr')}
                             type="string" />
                },
                {
                    value: d.tel,
                    view:  <TableFrame.Input
                             key={"department_tel" + key_sfx}
                             ref={"department_tel" + i.toString()}
                             placeholder={d.tel}
                             onChange={this.onChangeItem(i, 'tel')}
                             type="string" />
                }

            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view:  <div className="manage-others-add-item"
                            onClick={this.onAddItem}>
                         +
                       </div>
            },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

        return data;
    },

    composeTableDataOfCategories: function() {
        var data = this.state.table_data.map(function(c, i) {
            var key_sfx = i.toString() + '_' + this.state.key_sfx.toString();

            return [
                { value: '', view: this.decideOperator(c.code, i) },
                {
                    value: c.name,
                    view:  <TableFrame.Input
                             key={"category_name" + key_sfx}
                             ref={"category_name" + i.toString()}
                             placeholder={c.name}
                             onChange={this.onChangeItem(i, 'name')}
                             type="string" />
                }
            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view:  <div className="manage-others-add-item"
                            onClick={this.onAddItem}>
                         +
                       </div>
            },
            { value: '', view: '' }
        ]);

        return data;
    },

    composeTableDataOfTraders: function() {
        var data = this.state.table_data.map(function(t, i) {
            var key_sfx = i.toString() + '_' + this.state.key_sfx.toString();

            return [
                { value: '', view: this.decideOperator(t.code, i) },
                {
                    value: t.name,
                    view:  <TableFrame.Input
                             key={"trader_name" + key_sfx}
                             ref={"trader_name" + i.toString()}
                             placeholder={t.name}
                             onChange={this.onChangeItem(i, 'name')}
                             type="string" />
                },
                {
                    value: t.tel,
                    view:  <TableFrame.Input
                             key={"trader_tel" + key_sfx}
                             ref={"trader_tel" + i.toString()}
                             placeholder={t.tel}
                             onChange={this.onChangeItem(i, 'tel')}
                             type="string" />
                },
                {
                    value: t.fax,
                    view:  <TableFrame.Input
                             key={"trader_fax" + key_sfx}
                             ref={"trader_fax" + i.toString()}
                             placeholder={t.fax}
                             onChange={this.onChangeItem(i, 'fax')}
                             type="string" />
                },
                {
                    value: t.email,
                    view:  <TableFrame.Input
                             key={"trader_email" + key_sfx}
                             ref={"trader_email" + i.toString()}
                             placeholder={t.email}
                             onChange={this.onChangeItem(i, 'email')}
                             type="string" />
                },
                {
                    value: t.communication,
                    view:  <TableFrame.Select
                             initialSelected={t.communication}
                             onSelect={this.onSelectTraderCommunication(i)}>
                             <TableFrame.Option value="fax">
                               FAX
                             </TableFrame.Option>
                             <TableFrame.Option value="email">
                               E-Mail
                             </TableFrame.Option>
                             <TableFrame.Option value="tel">
                               電話
                             </TableFrame.Option>
                             <TableFrame.Option value="none">
                               不要
                             </TableFrame.Option>
                           </TableFrame.Select>
                }
            ];
        }.bind(this) );

        data.push([
            {
                value: '+',
                view:  <div className="manage-others-add-item"
                            onClick={this.onAddItem}>
                         +
                       </div>
            },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' },
            { value: '', view: '' }
        ]);

        return data;
    },

    render: function() {
        var targets = [
            { code: 'DEPARTMENTS', name: '部門診療科' },
            { code: 'CATEGORIES',  name: '品目' },
            { code: 'TRADERS',     name: '販売元' }
        ];

        var table_title;
        var table_data;
        var table;

        switch (this.state.target_code) {
        case 'DEPARTMENTS':
            table_title = [
                { name: '+/!/-',  type: 'void'   },
                { name: '名前',   type: 'string' },
                { name: '略称',   type: 'string' },
                { name: 'TEL',    type: 'string' }
            ];

            table_data = this.composeTableDataOfDepartments();
            table      = <TableFrame id="manage-others-departments"
                                     className="manage-others-table"
                                     title={table_title}
                                     data={table_data} />;
            break;
        case 'CATEGORIES':
            table_title = [
                { name: '+/-',  type: 'void'   },
                { name: '名前', type: 'string' }
            ];

            table_data = this.composeTableDataOfCategories();
            table      = <TableFrame id="manage-others-categories"
                                     className="manage-others-table"
                                     title={table_title}
                                     data={table_data} />;
            break;
        case 'TRADERS':
            table_title = [
                { name: '+/-',      type: 'void'   },
                { name: '名前',     type: 'string' },
                { name: 'TEL',      type: 'string' },
                { name: 'FAX',      type: 'string' },
                { name: 'E-Mail',   type: 'string' },
                { name: '発注方法', type: 'string' }
            ];

            table_data = this.composeTableDataOfTraders();
            table      = <TableFrame id="manage-others-traders"
                                     className="manage-others-table"
                                     title={table_title}
                                     data={table_data} />;
            break;
        default:
            table = null;
        }

        return (
            <div id="manage-others">
              <div id="manage-others-select-target">
                <Select key="管理対象"
                        placeholder="管理対象を選んで下さい"
                        value={this.state.target_code}
                        onSelect={this.onSelectTarget}
                        options={targets} />
              </div>
              {table}
            </div>
        );
    }
});

module.exports = ManageOthers;
