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

var SearchPane = React.createClass({
    mixins:    [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        account:      React.PropTypes.string.isRequired,
        order_type:   React.PropTypes.string.isRequired,
        final_trader: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        var trader_code = '';

        if (this.props.final_trader != null) {
            trader_code = this.props.final_trader.code;
        }

        return {
            class_code:      '',
            category_code:   '',
            department_code: '',
            trader_code:     trader_code,
            search_text:     '',
            classes:         [],
            categories:      [],
            departments:     [],
            traders:         []
        };
    },


    /*
     * 分類が選択されたら
     */
    onSelectClass: function(e) {
        this.setState({ class_code: e.code });
    },


    /*
     * 品目が選択されたら
     */
    onSelectCategory: function(e) {
        this.setState({ category_code: e.code });
    },


    /*
     * 診療科が選択されたら
     */
    onSelectDepartment: function(e) {
        this.setState({ department_code: e.code });
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
             * 自分の部署の発注しか扱えないのなら
             *
             * 一般の部署は他部署の発注を扱うことができない。
             * つまり、選択の余地はない訳で、クリアする意味がない。
             */
            department_code = this.state.departments[0].code;
        } else {
            /*
             * 他部署の発注も扱うことができるなら
             *
             * 一部の部署は、他部署の発注を扱う (肩代わりする)
             * ことが許されている。
             */
            department_code = '';
        }


        /*
         * 発注元が確定している場合、発注元をクリアしちゃいけない
         */
        if (this.props.final_trader != null) {
            trader_code = this.props.final_trader.code;
        } else {
            trader_code = '';
        }

        this.setState({
            class_code:      '',
            category_code:   '',
            department_code: department_code,
            trader_code:     trader_code,
            search_text:     '',
        });
    },


    /*
     * 検索ボタンをクリック
     */
    onSearch: function() {
        return this.getFlux().actions.updateCandidates({
            account:         this.props.account,
            order_type:      this.props.order_type,
            class_code:      this.state.class_code,
            category_code:   this.state.category_code,
            department_code: this.state.department_code,
            trader_code:     this.state.trader_code,
            search_text:     this.state.search_text
        });
    },


    /*
     * コンポーネントとして最初に表示される時、プルダウンメニューに表示する
     * 項目をサーバに問い合わせる。
     */
    componentDidMount: function() {
        XHR.post("pickMenuItemsForSearchPane").send({
            account: this.props.account,
        }).end(function(err, res) {
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
                classes:     res.body.classes,
                categories:  res.body.categories,
                departments: res.body.departments,
                traders:     res.body.traders 
            });
        }.bind(this) );
    },


    render: function() {
        var department_placeholder, department_code;
        var trader_placeholder, trader_code, trader_options;

        if (this.state.departments.length == 1) {
            department_placeholder = this.state.departments[0].name;
            department_code        = this.state.departments[0].code;
        } else {
            department_placeholder = '診療科';
            department_code        = this.state.department_code;
        }

        if (this.props.final_trader === null) {
            trader_placeholder = '販売元';
            trader_code        = this.state.trader_code;
            trader_options     = this.state.traders;
        } else {
            trader_placeholder = this.props.final_trader.name;
            trader_code        = this.props.final_trader.code;
            trader_options     = [ this.props.final_trader ];
        }

        return (
            <fieldset className="order-pane">
              <legend>検索</legend>
              <div className="order-search-pane-row">
                <Select placeholder="分類"
                        onSelect={this.onSelectClass}
                        value={this.state.class_code}
                        options={this.state.classes} />
                <Select placeholder="品目"
                        onSelect={this.onSelectCategory}
                        value={this.state.category_code}
                        options={this.state.categories} />
              </div>
              <div className="order-search-pane-row">
                <Select placeholder={trader_placeholder}
                        onSelect={this.onSelectTrader}
                        value={trader_code}
                        options={trader_options} />
                <Select placeholder={department_placeholder}
                        onSelect={this.onSelectDepartment}
                        value={department_code}
                        options={this.state.departments} />
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
        );
    }
});

module.exports = SearchPane;
