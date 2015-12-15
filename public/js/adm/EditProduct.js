'use strict';
var React      = require('react');
var ReactDOM   = require('react-dom');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');
var TableFrame = require('../components/TableFrame');
var Select     = require('../components/Select');
var Notice     = require('../components/Notice');

var EditProduct = React.createClass({
    propTypes: {
        target: React.PropTypes.shape({
            code:          React.PropTypes.string.isRequired,
            name:          React.PropTypes.string.isRequired,
            category_code: React.PropTypes.string.isRequired,
            department_codes: React.PropTypes.arrayOf(
                React.PropTypes.string.isRequired
            ).isRequired,
            trader_code: React.PropTypes.string.isRequired,
            min_price:   React.PropTypes.number.isRequired,
            cur_price:   React.PropTypes.number.isRequired,
            max_price:   React.PropTypes.number.isRequired,
            note:        React.PropTypes.string.isRequired
        }),

        departments: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired,

        categories: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired,

        traders: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired,

        goBack: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        var post = {};

        if (this.props.target == null) {
            post = {
                name:             '',
                category_code:    '',
                maker:            '',
                department_codes: [],
                trader_code:      '',
                min_price:        0,
                cur_price:        0,
                max_price:        0,
                note:             ''
            };
        } else {
            /*
             * props は変更不可なので、その値をシコシコとコピー
             */
            for (p in this.props.target) {
                if (p ===' department_codes') {
                    post[p] = this.props.target[p].map(function(d) {
                        return d;
                    });
                } else {
                    post[p] = this.props.target[p];
                }
            }
        }

        return { post: post };
    },

    onChangeName:  function(e) { this.setState({ name:  e.target.value }); },
    onChangeMaker: function(e) { this.setState({ maker: e.target.value }); },
    onChangeNote:  function(e) { this.setState({ note:  e.target.value }); },

    onSelectCategory: function(e) {
        this.setState({ category_code: e.code });
    },

    onSelectTrader: function(e) {
        this.setState({ trader_code: e.code });
    },

    validate: function(type, string, callback) {
        var result;

        if (type === 'int') {
            result = string.match(/^-?(\d+)?$/)? string: '0';
        } else {
            result = string.match(/&-?(\d+\.?\d*)?$/)? string: '0.00';
        }

        callback(result);
    },

    finalize: function(type, string, callback) {
        var view, value;

        if (type === 'int') {
        } else {
        }
    },

    onChangeMinPrice: function() {
    },

    onChangeCurPrice: function() {
    },

    onChangeMaxPrice: function() {
    },

    render: function() {
        var title = [
            { name: '+/-',               type: 'void'   },
            { name: '発注元 部門診療科', type: 'string' }
        ];
        var data  = [];

        return (
            <fieldset id="edit-products">
              <div id="edit-products-name">
                <Input type="text"
                       bsSize="small"
                       ref="name"
                       onChange={this.onChangeName}
                       value={this.state.post.name}
                       placeholder="品名" />
              </div>
              <div id="edit-products-maker">
                <Input type="text"
                       bsSize="small"
                       ref="name"
                       onChange={this.onChangeMaker}
                       value={this.state.post.maker}
                       placeholder="製造元" />
              </div>
              <div id="edit-products-selects">
                <div className="edit-products-select">
                  <Select key="品目"
                          placeholder="品目"
                          value={this.state.post.category_code}
                          onSelect={this.onSelectCategory}
                          options={this.props.categories} />
                </div>
                <div className="edit-products-select">
                  <Select key="販売元"
                          placeholder="販売元"
                          value={this.state.post.trader_code}
                          onSelect={this.onSelectTrader}
                          options={this.props.traders} />
                </div>
              </div>
              <div id="edit-products-prices">
                <Notice title="最低価格" className="edit-products-price">
                  <input type="text"
                         className="edit-products-price-input"
                         ref="min-price"
                         onChange={this.onChangeMinPrice}
                         value={this.state.post.min_price} />
                </Notice>
                <Notice title="現在価格" className="edit-products-price">
                  <input type="text"
                         className="edit-products-price-input"
                         ref="cur-price"
                         onChange={this.onChangeCurPrice}
                         value={this.state.post.cur_price} />
                </Notice>
                <Notice title="最高価格" className="edit-products-price">
                  <input type="text"
                         className="edit-products-price-input"
                         ref="max-price"
                         onChange={this.onChangeMaxPrice}
                         value={this.state.post.max_price} />
                </Notice>
              </div>
              <div id="edit-products-note">
                <Input type="text"
                       bsSize="small"
                       ref="name"
                       onChange={this.onChangeNote}
                       value={this.state.post.note}
                       placeholder="備考" />
              </div>
              <TableFrame id="edit-products-department-codes"
                          title={title} data={data} />
            </fieldset>
        );
    }
});

module.exports = EditProduct;
