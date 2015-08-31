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
    propTypes: { user: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return {
            category_keyid: '',
            trader_keyid:   '',
            search_text:    '',
            categories:     [],
            traders:        []
        };
    },


    /*
     * 品目が選択されたら
     */
    onCategorySelect: function(e) {
        this.searchCategoriesAndTraders(e.keyid, this.state.trader_keyid);
    },


    /*
     * 販売元が選択されたら
     */
    onTraderSelect: function(e) {
        this.searchCategoriesAndTraders(this.state.category_keyid, e.keyid);
    },


    /*
     * 検索テキストが変更されたら
     */
    onSearchTextChange: function(e) {
        this.setState({ search_text: e.target.value });
    },


    /*
     * クリアボタンをクリック
     */
    onClear: function() {
        XHR.post("searchCategoriesAndTraders").send({
            user:           this.props.user,
            category_keyid: '',
            trader_keyid:   ''
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! searchCategoriesAndTraders');
                throw 'searchCategoriesAndTraders';
            }

            this.setState({
                category_keyid: '',
                trader_keyid:   '',
                search_text:    '',
                categories:     res.body.categories,
                traders:        res.body.traders 
            });
        }.bind(this) );
    },


    /*
     * 検索ボタンをクリック
     */
    onSearch: function() {
        return this.getFlux().actions.updateCandidates({
            category_keyid: this.state.category_keyid,
            trader_keyid:   this.state.trader_keyid,
            search_text:    this.state.search_text
        });
    },


    /*
     * 品目と販売元のプルダウンメニューに表示する項目をサーバに問い合わせる
     * 関数。
     * 品目を選択すればそれを扱う販売元のみが表示され、販売元を選択すればそ
     * の販売元が扱う品目のみが表示される、という動作を実現するために、品
     * 目 / 販売元が変更されると、本関数が呼び出され、その結果がプルダウン
     * メニューの項目に反映される。
     */
    searchCategoriesAndTraders: function(category_id, trader_id) {
        XHR.post("searchCategoriesAndTraders").send({
            user:           this.props.user,
            category_keyid: category_id,
            trader_keyid:   trader_id
        }).end(function(err, res) {
            if (err) {
                alert('ERROR! searchCategoriesAndTraders');
                throw 'searchCategoriesAndTraders';
            }

            this.setState({
                category_keyid: category_id,
                trader_keyid:   trader_id,
                categories:     res.body.categories,
                traders:        res.body.traders 
            });
        }.bind(this) );
    },


    /*
     * 最初に表示された時
     */
    componentDidMount: function() {
        this.searchCategoriesAndTraders('', '');
    },

    render: function() {
        return (
            <fieldset className="order-pane">
              <legend>検索</legend>
              <div className="order-search-pane-input">
                <Select placeholder="品目"
                        onSelect={this.onCategorySelect}
                        value={this.state.category_keyid}
                        options={this.state.categories} />
              </div>
              <div className="order-search-pane-input">
                <Select placeholder="販売元"
                        onSelect={this.onTraderSelect}
                        value={this.state.trader_keyid}
                        options={this.state.traders} />
              </div>
              <div className="order-search-pane-input">
                <Input type="text"
                       bsSize="small"
                       placeholder="検索テキスト"
                       value={this.state.search_text}
                       onChange={this.onSearchTextChange} />
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
