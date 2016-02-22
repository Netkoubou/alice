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
            <div id="edit-product-prices">
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

var Buttons = React.createClass({
    propTypes: {
        onClear:        React.PropTypes.func.isRequired,
        goBack:         React.PropTypes.func.isRequired,
        targetAction:   React.PropTypes.func.isRequired,
        isRegistration: React.PropTypes.bool.isRequired
    },

    render: function() {
        var target_action_name;
        var target_action_func;

        if (this.props.isRegistration) {
            target_action_name = '登録';
            target_action_func = this.props.targetAction('register');
        } else {
            target_action_name = '更新';
            target_action_func = this.props.targetAction('update');
        }

        return (
            <div id="edit-product-buttons">
              <Button className="edit-product-button"
                      bsSize="large"
                      bsStyle="primary"
                      onClick={this.props.onClear}>
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
                      onClick={target_action_func}>
                {target_action_name}
              </Button>
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
                is_common_item:   false,
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
            for (var p in this.props.target) {
                if (p != 'department_codes') {
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

    onRegisterOrUpdate: function(action) {
        return function() {
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
    
            if (post.cur_price < 0.0) {
                alert('現在価格に 0 以上を指定して下さい。');
                return;
            }

            var departments = this.props.departments;
    
            post.department_codes = departments.filter(function(_, i) {
                return this.state.is_checked[i];
            }.bind(this) ).map(function(d) { return d.code; });

            var err_msg_index;

            if (action === 'register') {
                err_msg_index = 'EDIT_PRODUCT_REGISTER_PRODUCT';
            } else {
                err_msg_index        = 'EDIT_PRODUCT_UPDATE_PRODUCT';
                this.state.post.code = this.props.target.code;
            }

            XHR.post(action + 'Product').send(post).end(function(err, res) {
                if (err) {
                    alert(Messages.ajax[err_msg_index]);
                    throw 'ajax_' + action + 'Product';
                }
    
                if (res.body.status != 0) {
                    alert(Messages.server[err_msg_index]);
                    throw 'server_' + action + 'Product';
                }
    
                alert('完了しました');
                this.props.goBack();
            }.bind(this) );
        }.bind(this);
    },

    onChangeIsCommonItem: function() {
        this.state.post.is_common_item = !this.state.post.is_common_item;
        this.setState({ post: this.state.post });
    },

    onChangeIsChecked: function(index) {
        return function() {
            this.state.is_checked[index] = !this.state.is_checked[index];
            this.setState({ is_checked: this.state.is_checked });
        }.bind(this);
    },

    onClear: function() {
        this.state.post.is_common_item = false;
        this.setState({
            post:       this.state.post,  
            is_checked: this.state.is_checked.map(function(_) {
                return false;
            })
        });
    },

    composeTableFrameData: function() {
        return this.props.departments.map(function(department, index) {
            return [
                {
                    value: department.name,
                    view: <div>
                            <span className="edit-product-department-name">
                              <input type="checkbox"
                                     disabled={this.state.post.is_common_item}
                                     onChange={this.onChangeIsChecked(index)}
                                     checked={this.state.is_checked[index]} />
                            </span>
                            <span className="edit-product-department-name">
                              {department.name}
                            </span>
                          </div>
                },
            ];
        }.bind(this) );
    },

    isAnyChecked: function() {
        return this.state.is_checked.filter(function(x) {
            return x;
        }).length > 0;
    },

    render: function() {
        var title = [{ name: '発注元 部門診療科', type: 'string' }];
        var data  = this.composeTableFrameData();

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
                <div id="edit-product-note">
                  <Input type="text"
                         bsSize="small"
                         ref="name"
                         onChange={this.onChangeStringOf('note')}
                         value={this.state.post.note}
                         placeholder="備考" />
                </div>
                <Prices minPrice={this.state.post.min_price}
                        curPrice={this.state.post.cur_price}
                        maxPrice={this.state.post.max_price}
                        isRegistration={this.props.target == null}
                        onChange={this.onChangePrice} />
              </div>
              <div id="edit-product-right">
                <input id="edit-product-is-common-item"
                       type="checkbox"
                       disabled={this.isAnyChecked()}
                       checked={this.state.post.is_common_item}
                       onChange={this.onChangeIsCommonItem} />
                <strong>全部門診療科で購入可</strong>
                <TableFrame id="edit-product-departments"
                            title={title} data={data} />
                <Buttons onClear={this.onClear}
                         goBack={this.props.goBack}
                         targetAction={this.onRegisterOrUpdate}
                         isRegistration={this.props.target == null} />
              </div>
            </div>
        );
    }
});

module.exports = EditProduct;
