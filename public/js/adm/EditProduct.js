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

var Prices = React.createClass({
    propTypes: {
        minPrice:       React.PropTypes.number.isRequired,
        curPrice:       React.PropTypes.number.isRequired,
        maxPrice:       React.PropTypes.number.isRequired,
        isRegistration: React.PropTypes.bool.isRequired,
        onChange:       React.PropTypes.func.isRequired
    },

    render: function() {
        var min_price = this.props.minPrice.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var cur_price = this.props.curPrice.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var max_price = this.props.maxPrice.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        return (
            <div>
              <Notice title="最低価格" className="edit-product-price">
                <div className="edit-product-price-input">
                  <TableFrame.Input
                    key={Math.random()}
                    type="real"
                    placeholder={min_price}
                    disabled={this.props.isRegistration}
                    onChange={this.props.onChange('min_price')} />
                </div>
              </Notice>
              <Notice title="現在価格" className="edit-product-price">
                <div className="edit-product-price-input">
                  <TableFrame.Input
                    key={Math.random()}
                    type="real"
                    placeholder={cur_price}
                    onChange={this.props.onChange('cur_price')} />
                </div>
              </Notice>
              <Notice title="最高価格" className="edit-product-price">
                <div className="edit-product-price-input">
                  <TableFrame.Input
                    key={Math.random()}
                    type="real"
                    placeholder={max_price}
                    disabled={this.props.isRegistration}
                    onChange={this.props.onChange('max_price')} />
                </div>
              </Notice>
            </div>
        );
    }
});

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
        var post     = {};
        var is_checked;

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

            is_checked = this.props.departments.map(function(_) {
                return false;
            });
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

            is_checked = this.props.departments.map(function(d) {
                var checked = false;

                this.props.target.department_codes.forEach(function(code) {
                    if (d.code === code) {
                        checked = true;
                    }
                });

                return checked;
            }.bind(this) );
        }

        return {
            post:       post,
            is_checked: is_checked
        };
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
            var post = this.state.post;

            post[target] = value;

            if (this.props.target == null) {
                post.min_price = post.max_price = value;
            } else {
                if (post.min_price > post.cur_price) {
                    post.min_price = post.cur_price;
                }

                if (post.cur_price > post.max_price) {
                    post.max_price = post.cur_price;
                }
            }

            this.setState({ post: this.state.post });
        }.bind(this);
    },

    onRegister: function() {
        var post = this.state.post;

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

        if (post.department_codes.length == 0) {
            alert('発注元 部門診療科を 1 個以上指定して下さい。');
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

    onRemove: function(index) {
        return function() {
            var head = this.state.post.department_codes.slice(0, index);
            var tail = this.state.post.department_codes.slice(index + 1);

            this.setState({ post: head.concat(tail) });
        }.bind(this);
    },

    onChangeCheckbox: function(index) {
        return function() {
            this.state.is_checked[index] = !this.state.is_checked[index];
            this.setState({ is_checked: this.state.is_checked });
        }.bind(this);
    },

    onClear: function() {
        for (var i = 0; i < this.state.is_checked.length; i++) {
            this.state.is_checked[i] = false;
        }

        this.setState({ is_checked: this.state.is_checked });
    },

    render: function() {
        var title = [{ name: '発注元 部門診療科', type: 'string' }];

        var data = this.props.departments.map(function(department, index) {
            return [
                {
                    value: department.name,
                    view: <div>
                            <span className="edit-product-department-name">
                              <input type="checkbox"
                                     checked={this.state.is_checked[index]}
                                     onChange={this.onChangeCheckbox(index)} />
                            </span>
                            <span className="edit-product-department-name">
                              {department.name}
                            </span>
                          </div>
                },
            ];
        }.bind(this) );

        return (
            <div id="edit-product">
              <div id="edit-product-left">
                <div id="edit-product-name">
                  <Input type="text"
                         bsSize="small"
                         ref="name"
                         onChange={this.onChangeStringOf('name')}
                         value={this.state.post.name}
                         placeholder="品名" />
                </div>
                <div id="edit-product-maker">
                  <Input type="text"
                         bsSize="small"
                         ref="name"
                         onChange={this.onChangeStringOf('maker')}
                         value={this.state.post.maker}
                         placeholder="製造元" />
                </div>
                <div className="edit-product-select">
                  <Select key="品目"
                          placeholder="品目"
                          value={this.state.post.category_code}
                          onSelect={this.onSelect('category_code')}
                          options={this.props.categories} />
                </div>
                <div className="edit-product-select">
                  <Select key="販売元"
                          placeholder="販売元"
                          value={this.state.post.trader_code}
                          onSelect={this.onSelect('trader_code')}
                          options={this.props.traders} />
                </div>
                <Prices minPrice={this.state.post.min_price}
                        curPrice={this.state.post.cur_price}
                        maxPrice={this.state.post.max_price}
                        isRegistration={this.props.target == null}
                        onChange={this.onChangePrice} />
                <div id="edit-product-note">
                  <Input type="text"
                         bsSize="small"
                         ref="name"
                         onChange={this.onChangeStringOf('note')}
                         value={this.state.post.note}
                         placeholder="備考" />
                </div>
              </div>
              <div id="edit-product-right">
                <TableFrame id="edit-product-departments"
                            title={title} data={data} />
                <div id="edit-product-buttons">
                  <Button className="edit-product-button"
                          bsSize="large"
                          bsStyle="primary"
                          onClick={this.onClear}>
                    クリア 
                  </Button>
                  <Button className="edit-product-button"
                          bsSize="large"
                          bsStyle="primary"
                          onClick={this.props.goBack}>
                    戻る
                  </Button>
                  <Button className="edit-product-button"
                          bsSize="large"
                          bsStyle="primary"
                          onClick={this.onRegister}>
                    登録
                  </Button>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = EditProduct;
