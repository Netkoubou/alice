/*
 * 検索ペイン
 */
'use strict';
var React   = require('react');
var Input   = require('react-bootstrap').Input;
var Button  = require('react-bootstrap').Button;
var XHR     = require('superagent');
var Fluxxor = require('fluxxor');
var Select  = require('../components/Select');

var SelectDepartment = React.createClass({
    propTypes: {
        onSelect: React.PropTypes.func.isRequired,
        options:  React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    render: function() {
        var placeholder, code;

        if (this.props.options.length == 1) {
            placeholder = this.props.options[0].name;
            code        = this.props.options[0].code;
        } else {
            placeholder = '選択して下さい';
            code        = this.props.value;
        }

        return (
            <Select key={placeholder}
                    placeholder={placeholder}
                    onSelect={this.props.onSelect}
                    value={code}
                    options={this.props.options} />
        );
    }
});

var SelectTrader = React.createClass({
    propTypes: {
        department:   React.PropTypes.object,
        final_trader: React.PropTypes.object,
        onSelect:     React.PropTypes.func.isRequired,
        value:        React.PropTypes.string.isRequired,
        options:      React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    render: function() {
        var placeholder, code, options;

        if (this.props.final_trader === null) {
            placeholder = '発注先 販売元';
            code        = this.props.value;
            options     = this.props.options;
        } else {
            placeholder = this.props.final_trader.name;
            code        = this.props.final_trader.code;
            options     = [ this.props.final_trader ];
        }

        return (
            <Select key={placeholder}
                    placeholder={placeholder}
                    value={code}
                    onSelect={this.props.onSelect}
                    options={options} />
        );
    }
});

var SearchPane = React.createClass({
    mixins:    [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        order_type:   React.PropTypes.string.isRequired,
        final_trader: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        var department_code = '';
        var trader_code     = '';

        if (this.props.department != null) {
            department_code = this.props.department_code;
        }

        if (this.props.final_trader != null) {
            trader_code = this.props.final_trader.code;
        }

        return {
            department_code: department_code,
            category_code:   '',
            trader_code:     trader_code,
            search_text:     '',
            categories:      [],
            departments:     [],
            traders:         []
        };
    },


    /*
     * 診療科が選択されたら
     */
    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
    },


    /*
     * 品目が選択されたら
     */
    onSelectCategory: function(e) {
        this.setState({ category_code: e.code });
    },


    /*
     * 販売元が選択されたら
     */
    onSelectTrader: function(e) {
        this.setState({ trader_code: e.code });
    },


    /*
     * 検索テキストが変更されたら
     */
    onChangeSearchText: function(e) {
        this.setState({ search_text: e.target.value });
    },


    /*
     * クリアボタンをクリック
     */
    onClear: function() {
        var department_code, trader_code;

        if (this.state.departments.length == 1) {
            /*
             * そもそも自分の部門診療科の発注しか扱えないのなら
             *
             * 一般の部署は他部署の発注を扱うことができない。
             * つまり、選択の余地はない訳で、クリアする意味がない。
             */
            department_code = this.state.departments[0].code;
        } else if (this.props.department != null) {
            /*
             * 発注元 (部門診療科) が既に決まっているのなら
             *
             * 一部の部署は、他部署 (部門診療科) の発注を肩代わりできるのだが、
             * 既に何処の肩代わりするかが決まっている場合。
             */
            department_code = this.props.department.code;
        } else {
            /*
             * 発注元が未だ決まっていないのなら
             */
            department_code = '';
        }


        /*
         * 発注する商品が一つでも確定している場合、
         * 販売元をクリアしちゃいけない
         */
        if (this.props.final_trader == null) {
            trader_code = '';
        } else {
            trader_code = this.props.final_trader.code;
        }

        this.setState({
            department_code: department_code,
            category_code:   '',
            trader_code:     trader_code,
            search_text:     '',
        });
    },


    /*
     * 検索ボタンをクリック
     */
    onSearch: function(e) {
        if (this.state.department_code === '') {
            alert('部門診療科を選択して下さい');
            e.preventDefault();
            return;
        }

        return this.getFlux().actions.updateCandidates({
            order_type:      this.props.order_type,
            department_code: this.state.department_code,
            category_code:   this.state.category_code,
            trader_code:     this.state.trader_code,
            search_text:     this.state.search_text
        });
    },


    /*
     * コンポーネントとして最初に表示される直前、プルダウンメニューに表示する
     * 項目をサーバに問い合わせる。
     */
    componentDidMount: function() {
        XHR.get('pickMenuItemsForSearchPane').end(function(err, res) {
            if (err) {
                alert('ERROR! pickMenuItemsForSearchPane');
                throw 'pickMenuItemsForSearchPane';
            }

            var department_code;

            if (res.body.departments.length == 1) {
                /*
                 * 自分の部署の発注しか扱えない
                 */
                department_code = res.body.departments[0].code;
            } else {
                /*
                 * 他部署の発注も扱うことができる
                 */
                department_code = '';
            }

            this.setState({
                department_code: department_code,
                categories:      res.body.categories,
                departments:     res.body.departments,
                traders:         res.body.traders 
            });
        }.bind(this) );
    },

    componentWillReceiveProps: function(new_props) {
        if (new_props.final_trader != null) {
            this.setState({ trader_code: new_props.final_trader.code });
        } else if (this.props.final_trader != null) {
            this.setState({ trader_code: '' });
        }
    },

    render: function() {
        return (
            <div>
              <fieldset className="order-pane">
                <legend>発注元 部門診療科</legend>
                <div className="order-search-pane-row">
                  <SelectDepartment onSelect={this.onSelectDepartment}
                                    value={this.state.department_code}
                                    options={this.state.departments} />
                </div>
              </fieldset>
              <fieldset className="order-pane">
                <legend>検索</legend>
                <div className="order-search-pane-row">
                  <span className="order-search-pane-menu">
                    <Select placeholder="品目"
                            value={this.state.category_code}
                            onSelect={this.onSelectCategory}
                            options={this.state.categories} />
                  </span>
                  <span className="order-search-pane-menu">
                    <SelectTrader final_trader={this.props.final_trader}
                                  onSelect={this.onSelectTrader}
                                  value={this.state.trader_code}
                                  options={this.state.traders} />
                  </span>
                </div>
                <div className="order-search-pane-row">
                  <Input type="text"
                         bsSize="small"
                         placeholder="検索テキスト"
                         value={this.state.search_text}
                         onChange={this.onChangeSearchText} />
                </div>
                <Button bsSize="small"
                        onClick={this.onSearch}
                        className="order-search-pane-button">
                  検索
                </Button>
                <Button bsSize="small"
                        onClick={this.onClear}
                        className="order-search-pane-button">
                  クリア
                </Button>
              </fieldset>
            </div>
        );
    }
});

module.exports = SearchPane;
