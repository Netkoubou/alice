'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var Select     = require('../components/Select');
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');

var ManageProducts = React.createClass({
    getInitialState: function() {
        return {
            department_code: '',
            category_code:   '',
            trader_code:     '',
            departments:     [],
            categories:      [],
            traders:         [],
            products:        [],
            search_text:     ''
        };
    },

    componentDidMount: function() {
        XHR.get('pickMenuItemsForManageProducts').end(function(err, res) {
            var idx = 'MANAGE_PRODUCTS_PICK_MENU_ITEMS_FOR_MANAGE_PRODUCTS';

            if (err) {
                alert(Messages.ajax[idx]);
                throw 'ajax_pickMenuItemsForSearchPane';
            }

            if (res.body.status != 0) {
                alert(Messages.server[idx]);
                throw 'server_pickMenuItemsForSearchPane';
            }

            this.setState({
                departments: res.body.departments,
                categories:  res.body.categories,
                traders:     res.body.traders
            }.bind(this) );
        });
    },

    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
    },

    onSelectCategory: function(e) {
        this.setState({ category_code: e.code });
    },

    onSelectTrader: function(e) {
        this.setState({ trader_code: e.code });
    },

    onChangeSearchText: function(e) {
        this.setState({ search_text: e.target.value });
    },

    render: function() {
        var title = [
            { name: '品名',              type: 'string' },
            { name: '品目',              type: 'string' },
            { name: '製造元',            type: 'string' },
            { name: '発注元 部門診療科', type: 'string' },
            { name: '発注先 販売元',     type: 'string' },
            { name: '現在単価',          type: 'number' },
            { name: '!',                 type: 'void'   }
        ];

        var data  = [];

        return (
            <div id="manage-products">
              <fieldset id="manage-products-search">
                <div className="manage-products-select">
                  <Select key="部門診療科"
                          placeholder="発注元 部門診療科"
                          value={this.state.department_code}
                          onSelect={this.onSelectDepartment}
                          options={this.state.departments} />
                </div>
                <div className="manage-products-select">
                  <Select key="品目"
                          placeholder="品目"
                          value={this.state.category_code}
                          onSelect={this.onSelectCategory}
                          options={this.state.departments} />
                </div>
                <div className="manage-products-select">
                  <Select key="販売元"
                          placeholder="発注先 販売元"
                          value={this.state.trader_code}
                          onSelect={this.onSelectTrader}
                          options={this.state.departments} />
                </div>
                <div id="manage-products-input">
                  <Input type="text"
                         bsSize="small"
                         placeholder="検索テキスト"
                         value={this.state.search_text}
                         onChange={this.onChangeSearchText} />
                </div>
                <div id="manage-products-buttons">
                  <Button bsSize="small" onClick={function() {} }>検索</Button>
                </div>
              </fieldset>
              <TableFrame id="manage-products-products"
                          title={title} data={data} />
            </div>
        );
    }
});

module.exports = ManageProducts;
