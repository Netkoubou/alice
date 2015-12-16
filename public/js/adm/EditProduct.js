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
                min_price:        0.0,
                cur_price:        0.0,
                max_price:        0.0,
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

    

    onChangeStringOf: function(attribute) {
        return function(e) {
            this.state.post[attribute] = e.target.value;
            this.setState({ post: this.state.post });
        }.bind(this);
    },

    onSelect: function(target) {
        return function(e) {
            this.state.post[target] = e.code;
            this.setState({ post: this.state.post });
        }.bind(this);
    },

    onChangePrice: function(target) {
        return function(value) {
            this.state.post[target] = value;

            if (this.state.post.min_price > this.state.post.cur_price) {
                this.state.post.min_price = this.state.post.cur_price;
            }

            if (this.state.post.cur_price > this.state.post.max_price) {
                this.state.post.max_price = this.state.post.cur_price;
            }

            this.setState({ post: this.state.post });
        }.bind(this);
    },

    onRegister: function() {
        var post = this.props.post;

        if (post.name === '') {
            alert('品名を入力して下さい。');
            return;
        }

        if (post.maker === '') {
            alert('製造元を入力して下さい。');
            return;
        }

        if (post.category_code === '') {
            alert('品目を選択して下さい。');
            return;
        }

        if (post.trader_code === '') {
            alert('販売元を選択して下さい。');
            return;
        }

        if (post.min_price < 0.0) {
            alert('最低価格には 0 以上を指定して下さい。');
            return;
        }

        if (post.cur_price <= 0.0) {
            alert('現在価格に 0 より大きな値を指定して下さい。');
            return;
        }

        XHR.post('/registerProduct').send(post).end(function(err, res) {
            if (err) {
                alert(Messages.ajax.EDIT_PRODUCT_REGISTER_PRODUCT);
                throw 'ajax_registerProduct';
            }

            if (res.body.status != 0) {
                alert(Messages.server.EDIT_PRODUCT_REGISTER_PRODUCT);
                throw 'server_registerProduct';
            }

            alert('登録しました');
            this.props.goBack();
        });
    },

    render: function() {
        var title = [
            { name: '+/-',               type: 'void'   },
            { name: '発注元 部門診療科', type: 'string' }
        ];
        var data  = [];

        var min_price = this.state.post.min_price.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var cur_price = this.state.post.cur_price.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var max_price = this.state.post.max_price.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        return (
            <fieldset id="edit-products">
              <div id="edit-products-name">
                <Input type="text"
                       bsSize="small"
                       ref="name"
                       onChange={this.onChangeStringOf('name')}
                       value={this.state.post.name}
                       placeholder="品名" />
              </div>
              <div id="edit-products-maker">
                <Input type="text"
                       bsSize="small"
                       ref="name"
                       onChange={this.onChangeStringOf('maker')}
                       value={this.state.post.maker}
                       placeholder="製造元" />
              </div>
              <div id="edit-products-selects">
                <div className="edit-products-select">
                  <Select key="品目"
                          placeholder="品目"
                          value={this.state.post.category_code}
                          onSelect={this.onSelect('category_code')}
                          options={this.props.categories} />
                </div>
                <div className="edit-products-select">
                  <Select key="販売元"
                          placeholder="販売元"
                          value={this.state.post.trader_code}
                          onSelect={this.onSelect('trader_code')}
                          options={this.props.traders} />
                </div>
              </div>
              <div id="edit-products-prices">
                <Notice title="最低価格" className="edit-products-price">
                  <div className="edit-products-price-input">
                    <TableFrame.Input
                      type="real"
                      placeholder={min_price}
                      disabled={this.props.target == null}
                      onChange={this.onChangePrice('min_price')} />
                  </div>
                </Notice>
                <Notice title="現在価格" className="edit-products-price">
                  <div className="edit-products-price-input">
                    <TableFrame.Input
                      type="real"
                      placeholder={cur_price}
                      onChange={this.onChangePrice('cur_price')} />
                  </div>
                </Notice>
                <Notice title="最高価格" className="edit-products-price">
                  <div className="edit-products-price-input">
                    <TableFrame.Input
                      type="real"
                      placeholder={max_price}
                      disabled={this.props.target == null}
                      onChange={this.onChangePrice('max_price')} />
                  </div>
                </Notice>
              </div>
              <div id="edit-products-note">
                <Input type="text"
                       bsSize="small"
                       ref="name"
                       onChange={this.onChangeStringOf('note')}
                       value={this.state.post.note}
                       placeholder="備考" />
              </div>
              <TableFrame id="edit-products-department-codes"
                          title={title} data={data} />
              <div id="edit-products-buttons">
                <Button className="edit-products-button"
                        bsSize="large"
                        bsStyle="primary"
                        onClick={this.props.goBack}>
                  戻る
                </Button>
                <Button className="edit-products-button"
                        bsSize="large"
                        bsStyle="primary"
                        onClick={this.onRegister}>
                  登録
                </Button>
              </div>
            </fieldset>
        );
    }
});

module.exports = EditProduct;
