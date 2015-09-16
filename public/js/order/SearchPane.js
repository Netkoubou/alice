/*
 * 検索ペイン
 */
'use strict';
var React    = require('react');
var Input    = require('react-bootstrap').Input;
var Button   = require('react-bootstrap').Button;
var XHR      = require('superagent');
var Fluxxor  = require('fluxxor');
var Select   = require('../components/Select');
var Messages = require('../lib/Messages');

var SelectDepartment = React.createClass({
    propTypes: {
        isFixed:  React.PropTypes.bool.isRequired,
        value:    React.PropTypes.string.isRequired,
        onSelect: React.PropTypes.func.isRequired,
        options:  React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    render: function() {
        var options, placeholder, code;


        /*
         * 発注元 部門診療科が決定している (発注確定している物品がある)
         * のなら、選択肢をその発注元 部門診療科が扱う物品に絞る。
         */
        if (this.props.isFixed) {
            options = this.props.options.filter(function(o) {
                return o.code === this.props.value;
            }.bind(this) );
        } else {
            options = this.props.options;
        }

        if (options.length == 1) {
            placeholder = options[0].name;
            code        = options[0].code;
        } else {
            placeholder = '選択して下さい';
            code        = this.props.value;
        }

        return (
            <Select key={placeholder}
                    placeholder={placeholder}
                    onSelect={this.props.onSelect}
                    value={code}
                    options={options} />
        );
    }
});

var SelectTrader = React.createClass({
    propTypes: {
        finalTrader: React.PropTypes.object,
        onSelect:    React.PropTypes.func.isRequired,
        value:       React.PropTypes.string.isRequired,
        options:     React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    render: function() {
        var placeholder, code, options;

        if (this.props.finalTrader === null) {
            placeholder = '発注先 販売元';
            code        = this.props.value;
            options     = this.props.options;
        } else {
            placeholder = this.props.finalTrader.name;
            code        = this.props.finalTrader.code;
            options     = [ this.props.finalTrader ];
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


/*
 * 発注元 部門診療科の選択は、UI の配置としても意味的にも、
 * 検索ペインの外にあるべきなのだが、
 * コード上は検索ペインの一部として扱っている。
 * 発注元 部門診療科も、結局は検索条件の一部なので、
 * その方が、コーディング上何かと都合が良かったりするためである。
 *
 * 発注元 部門診療科と発注先 販売元の扱いは以下のように意外と複雑。
 *
 *   - (ログインしている) ユーザの所属している、若しくは発注代行できる
 *     部門診療科が
 *
 *     * 1 つだけ: 発注元 部門診療科としてそれを無条件に選択 (選択の余地なし)
 *     * 複数ある: ユーザに選択させる (選択必須)
 *
 *   - 発注元 部門診療科が選択されていないと発注候補の検索不可
 *   - 発注確定候補一覧に物品が 1 つでも入っていれば
 *
 *     * 発注元 部門診療科の変更不可
 *     * 発注先 販売元は、その物品を扱うそれに固定 (選択 / 変更不可)
 *
 *   - 発注確定した物品数が 0 になったら、発注元 部門診療科及び発注先 販売元を
 *     選択 / 変更できるようになる
 *
 * 発注確定一覧に物品が (1 つでも) 入っていれば、
 *
 *   this.props.finalTrader != null
 *
 * となる (つまり this.props.finalTrader == 0 なら発注確定一覧に物品は
 * 1 つも入ていない) ようになっている (はず) なので、
 * this.props.finalTrader は、結構重要なフラグとなっている。
 */
var SearchPane = React.createClass({
    mixins:    [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        orderType:      React.PropTypes.string.isRequired,
        departmentCode: React.PropTypes.string,
        finalTrader:    React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        })
    },

    getInitialState: function() {
        var trader_code     = '';

        if (this.props.finalTrader != null) {
            trader_code = this.props.finalTrader.code;
        }

        return {
            category_code:   '',
            trader_code:     trader_code,
            search_text:     '',
            categories:      [],
            departments:     [],
            traders:         []
        };
    },


    getDefaultProps: function() {
        return {
            departmentCode: '',
            finalTrader:    null
        };
    },


    /*
     * 診療科が選択されたら
     */
    onSelectDepartment: function(e) {
        return this.getFlux().actions.setDepartmentCode({ code: e.code });
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
     *
     * 
     */
    onClear: function() {
        var department_code, trader_code;

        if (this.state.departments.length == 1) {
            /*
             * そもそも自分の部門診療科の発注しか扱えない場合。
             *
             * 一般の部署は他部署の発注を扱うことができない。
             * つまり、選択の余地はない訳で、クリアする意味がない。
             */
            department_code = this.state.departments[0].code;
        } else if (this.props.finalTrader != null) {
            /*
             * 発注元 部門診療科が既に決まっているのなら、
             * クリアしちゃいけない
             */
            department_code = this.props.departmentCode;
        } else {
            /*
             * 発注元 部門診療科が未だ決まっていないのなら
             */
            department_code = '';
        }

        this.getFlux().actions.setDepartmentCode({ code: department_code });


        /*
         * 発注確定一覧に物品が一つでも入っている場合、
         * 発注先 販売元をクリアしちゃいけない。
         */
        if (this.props.finalTrader == null) {
            trader_code = '';
        } else {
            trader_code = this.props.finalTrader.code;
        }

        this.setState({
            category_code: '',
            trader_code:   trader_code,
            search_text:   '',
        });
    },


    /*
     * 検索ボタンをクリック
     */
    onSearch: function(e) {
        if (this.props.departmentCode === '') {
            alert('部門診療科を選択して下さい');
            e.preventDefault();
            return;
        }

        return this.getFlux().actions.updateCandidates({
            order_type:      this.props.orderType,
            department_code: this.props.departmentCode,
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
                alert(Messages.SEARCH_PANE_PICK_MENU_ITEMS_FOR_SEARCH_PANE);
                throw 'pickMenuItemsForSearchPane';
            }

            this.setState({
                categories:  res.body.categories,
                departments: res.body.departments,
                traders:     res.body.traders 
            });

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

            this.getFlux().actions.setDepartmentCode({
                code: department_code
            });
        }.bind(this) );
    },

    componentWillReceiveProps: function(new_props) {
        if (new_props.finalTrader != null) {
            this.setState({ trader_code: new_props.finalTrader.code });
        } else if (this.props.finalTrader != null) {
            this.setState({ trader_code: '' });
        }
    },

    render: function() {
        return (
            <div>
              <fieldset className="order-pane">
                <legend>発注元 部門診療科</legend>
                <div className="order-search-pane-row">
                  <SelectDepartment isFixed={this.props.finalTrader != null}
                                    value={this.props.departmentCode}
                                    onSelect={this.onSelectDepartment}
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
                    <SelectTrader finalTrader={this.props.finalTrader}
                                  value={this.state.trader_code}
                                  onSelect={this.onSelectTrader}
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
