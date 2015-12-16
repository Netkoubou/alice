'use strict';
var React          = require('react');
var Input          = require('react-bootstrap').Input;
var Button         = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Popover        = require('react-bootstrap').Popover;
var XHR            = require('superagent');
var EditProduct    = require('./EditProduct');
var Select         = require('../components/Select');
var TableFrame     = require('../components/TableFrame');
var Messages       = require('../lib/Messages');
var Util           = require('../lib/Util');

var ManageProducts = React.createClass({
    getInitialState: function() {
        return {
            next_ope:        null,
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
        XHR.get('/pickMenuItemsToManageProducts').set({
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'
        }).end(function(err, res) {
            var idx = 'MANAGE_PRODUCTS_PICK_MENU_ITEMS_TO_MANAGE_PRODUCTS';

            if (err != null) {
                alert(Messages.ajax[idx]);
                throw 'ajax_pickMenuItemsToSearchPane';
            }

            if (res.body.status != 0) {
                alert(Messages.server[idx]);
                throw 'server_pickMenuItemsToSearchPane';
            }

            this.setState({
                departments: res.body.departments,
                categories:  res.body.categories,
                traders:     res.body.traders
            });
        }.bind(this) );
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

    onSearch: function() {
        XHR.post('/searchProducts').send({
            department_code: this.state.department_code,
            category_code:   this.state.category_code,
            trader_code:     this.state.trader_code,
            search_text:     this.state.search_text
        }).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.MANAGE_PRODUCTS_SEARCH_PRODUCTS);
                throw 'ajax_searchProducts';
            }

            if (res.body.status != 0) {
                alert(Messages.server.MANAGE_PRODUCTS_SEARCH_PRODUCTS);
                throw 'server_searchProducts';
            }

            this.setState({ products: res.body.products });
        }.bind(this) );
    },

    lookupCategoryName: function(code) {
        return Util.lookupName(code, this.state.categories);
    },

    lookupTraderName: function(code) {
        return Util.lookupName(code, this.state.traders);
    },

    backToHere: function() {
        this.onSearch();
        this.setState({ next_ope: null });
    },

    onAddProduct: function() {
        var next_ope = (
            <EditProduct departments={this.state.departments}
                         categories={this.state.categories}
                         traders={this.state.traders}
                         goBack={this.backToHere} />
        );

        this.setState({ next_ope: next_ope });
    },

    render: function() {
        if (this.state.next_ope != null) {
            return this.state.next_ope;
        }

        var title = [
            { name: '+/-',           type: 'void'   },
            { name: '品名',          type: 'string' },
            { name: '品目',          type: 'string' },
            { name: '製造元',        type: 'string' },
            { name: '発注先 販売元', type: 'string' },
            { name: '現在単価',      type: 'number' },
            { name: '!',             type: 'void'   }
        ];

        var data = this.state.products.map(function(p, i) {
            var category_name = this.lookupCategoryName(p.category_code);
            var trader_name   = this.lookupTraderName(p.trader_code);

            return [
                { value: '',            view: '-' },
                { value: p.name,        view: p.name },
                { value: category_name, view: category_name },
                { value: p.maker,       view: p.maker },
                { value: trader_name,   view: trader_name },
                { value: p.cur_price,   view: p.cur_price },
                { value: '',            view: '!' }
            ];
        }.bind(this) );

        data.push([
            {
                value: '',
                view:  <div className="manage-products-add-product"
                            onClick={this.onAddProduct}>
                         +
                       </div>
            },
            { value: '', view: ''  },
            { value: '', view: ''  },
            { value: '', view: ''  },
            { value: '', view: ''  },
            { value: '', view: ''  },
            { value: '', view: ''  }
        ]);

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
                          options={this.state.categories} />
                </div>
                <div className="manage-products-select">
                  <Select key="販売元"
                          placeholder="発注先 販売元"
                          value={this.state.trader_code}
                          onSelect={this.onSelectTrader}
                          options={this.state.traders} />
                </div>
                <div id="manage-products-input">
                  <Input type="text"
                         bsSize="small"
                         placeholder="検索テキスト"
                         value={this.state.search_text}
                         onChange={this.onChangeSearchText} />
                </div>
                <div id="manage-products-buttons">
                  <Button bsSize="large"
                          bsStyle="primary"
                          onClick={this.onSearch}>
                    検索
                  </Button>
                </div>
              </fieldset>
              <TableFrame id="manage-products-products"
                          title={title} data={data} />
            </div>
        );
    }
});

module.exports = ManageProducts;
