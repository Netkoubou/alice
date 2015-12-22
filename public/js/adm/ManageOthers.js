'use strict';
var React      = require('react');
var XHR        = require('superagent');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');

var ManageOthers = React.createClass({
    getInitialState: function() {
        return {
            target_code: '',
            table_data:  []
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
        var new_row = {};

        switch (this.state.target_code) {
        case 'DEPARTMENTS':
            new_row = {
                code: '',
                name: '',
                abbr: '',
                tel:  ''
            };
            break;
        case 'CATEGORIES':
            new_row = {
                code: '',
                name: ''
            };
            break;
        case 'TRADERS':
            new_row = {
                code:          '',
                tel:           '',
                fax:           '',
                email:         '',
                communication: ''
            };
            break;
        }

        this.state.table_data.push(new_row);
        this.setState({ table_data: this.state.table_data });
    },

    onRemoveItem: function(index) {
        return function() {
        }.bind(this);
    },

    onChangeDepartmentName: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeDepartmentAbbr: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeDepartmentTel: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeCategoryName: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeTraderName: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeTraderTel: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeTraderFax: function(index) {
        return function(e) {
        }.bind(this);
    },

    onChangeTraderEmail: function(index) {
        return function(e) {
        }.bind(this);
    },

    onSelectTraderCommunication: function(index) {
        return function(e) {
        }.bind(this);
    },

    decideOperator: function(code) {
        if (code === '') {
            return (
                <div className="manage-others-update-item"
                     onClick={this.props.onUpdate}>
                  !
                </div>
            );
        } else {
            return (
                <div className="manage-others-remove-item"
                     onClick={this.props.onUpdate}>
                  -
                </div>
            );
        }
    },

    composeTableDataOfDepartments: function() {
        var data = this.state.table_data.map(function(d, i) {
            return [
                { value: '', view: this.decideOperator(d.code) },
                {
                    value: d.name,
                    view: <TableFrame.Input
                            placeholder={d.name}
                            onChange={this.onChangeDepartmentName(i)}
                            type="string" />
                },
                {
                    value: d.abbr, 
                    view:  <TableFrame.Input
                             placeholder={d.abbr}
                             onChange={this.onChangeDepartmentAbbr(i)}
                             type="string" />
                },
                {
                    value: d.tel,
                    view:  <TableFrame.Input
                             placeholder={d.tel}
                             onChange={this.onChangeDepartmentTel(i)}
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
            return [
                { value: '', view: this.decideOperator(c.code) },
                {
                    value: c.name,
                    view:  <TableFrame.Input
                             placeholder={c.name}
                             onChange={this.onChangeCategoryName(i)}
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
            return [
                { value: '', view: this.decideOperator(t.code) },
                {
                    value: t.name,
                    view:  <TableFrame.Input
                             placeholder={t.name}
                             onChange={this.onChangeTraderName(i)}
                             type="string" />
                },
                {
                    value: t.tel,
                    view:  <TableFrame.Input
                             placeholder={t.tel}
                             onChange={this.onChangeTraderTel(i)}
                             type="string" />
                },
                {
                    value: t.fax,
                    view:  <TableFrame.Input
                             placeholder={t.fax}
                             onChange={this.onChangeTraderFax(i)}
                             type="string" />
                },
                {
                    value: t.email,
                    view:  <TableFrame.Input
                             placeholder={t.email}
                             onChange={this.onChangeTraderEmail(i)}
                             type="string" />
                },
                {
                    value: t.communication,
                    view:  <TableFrame.Select
                             initialSelected="fax"
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
