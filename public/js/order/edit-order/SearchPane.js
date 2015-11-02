/*
 * 検索ペイン
 */
'use strict';
var React    = require('react');
var Input    = require('react-bootstrap').Input;
var Button   = require('react-bootstrap').Button;
var XHR      = require('superagent');
var Fluxxor  = require('fluxxor');
var Select   = require('../../components/Select');
var Messages = require('../../lib/Messages');

var SelectDepartment = React.createClass({
    propTypes: {
        orderCode:   React.PropTypes.string.isRequired,
        finalTrader: React.PropTypes.object.isRequired,
        onSelect:    React.PropTypes.func.isRequired,

        value: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }).isRequired,

        options: React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    render: function() {
        var options     = this.props.options;
        var placeholder = '選択して下さい';
        var code        = this.props.value.code;


        /*
         * 発注元 部門診療科が決定している (発注確定している物品がある)
         * のなら、選択肢をその発注元 部門診療科が扱う物品に絞る。
         * また、発注に起案番号が付与されている場合も、その発注は既に
         * 発注元 部門診療科に結び付けられているわけで、同様に扱う。
         */
        if (this.props.finalTrader.code != '' || this.props.orderCode != '') {
            options = [ this.props.value ];
        }

        if (options.length == 1) {
            placeholder = options[0].name;
            code        = options[0].code;
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
        finalTrader: React.PropTypes.object.isRequired,
        onSelect:    React.PropTypes.func.isRequired,
        value:       React.PropTypes.string.isRequired,
        options:     React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    render: function() {
        var placeholder, code, options;

        if (this.props.finalTrader.code === '') {
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
 *   this.props.finalTrader.code != ''
 *
 * となる (つまり this.props.finalTrader.code === '' なら発注確定一覧に物品は
 * 1 つも入ていない) ようになっている (はず) なので、
 * this.props.finalTrader は、結構重要なフラグとなっている。
 */
var SearchPane = React.createClass({
    mixins: [ Fluxxor.FluxMixin(React) ],

    propTypes: {
        orderType: React.PropTypes.string.isRequired,
        orderCode: React.PropTypes.string.isRequired,

        department: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }).isRequired,

        finalTrader: React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }).isRequired
    },

    getInitialState: function() {
        return {
            department:    this.props.department,
            category_code: '',
            trader_code:   this.props.finalTrader.code,
            search_text:   '',
            categories:    [],
            departments:   [],
            traders:       []
        };
    },


    /*
     * 部門診療科が選択されたら
     */
    onSelectDepartment: function(e) {
        this.getFlux().actions.clearCandidates();
        this.setState({ department: e });
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
        var department = { code: '', name: '' };

        if (this.state.departments.length == 1) {
            /*
             * そもそも自分の部門診療科の発注しか扱えない場合。
             *
             * 一般の部署は他部署の発注を扱うことができない。
             * つまり、選択の余地はない訳で、クリアする意味がない。
             */
            department = this.state.departments[0];
        } else if (this.props.finalTrader.code != '') {
            /*
             * 発注元 部門診療科が既に決まっているのなら、
             * クリアしちゃいけない
             */
            department = this.props.department;
        }

        this.getFlux().actions.clearCandidates();


        /*
         * 発注確定一覧に物品が一つでも入っている場合、
         * 発注先 販売元をクリアしちゃいけない。
         */
        this.setState({
            department:    department,
            category_code: '',
            trader_code:   this.props.finalTrader.code,
            search_text:   '',
        });
    },


    /*
     * 検索ボタンをクリック
     */
    onSearch: function(e) {
        if (this.state.department.code === '') {
            alert('部門診療科を選択して下さい');
            e.preventDefault();
            return;
        }

        return this.getFlux().actions.updateCandidates({
            order_type:      this.props.orderType,
            category_code:   this.state.category_code,
            department:      this.state.department,
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
            var errmsg_index = 'SEARCH_PANE_PICK_MENU_ITEMS_FOR_SEARCH_PANE';

            if (err) {
                alert(Messages.ajax[errmsg_index]);
                throw 'ajax_pickMenuItemsForSearchPane';
            }

            if (res.body.status != 0) {
                alert(Messages.server[errmsg_index]);
                throw 'server_pickMenuItemsForSearchPane';
            }

            this.setState({
                categories:  res.body.categories,
                departments: res.body.departments,
                traders:     res.body.traders 
            });

            if (this.props.department.code === '') {
                if (res.body.departments.length == 1) {
                    this.setState({ department: res.body.departments[0] });
                }
            }
      }.bind(this) );
    },

    componentWillReceiveProps: function(new_props) {
        if (new_props.finalTrader.code != '') {
            /*
             * 新たに Props を受け取る時、発注元 販売元が確定している、
             * つまり発注確定している商品が一つでもある場合には、
             * 検索条件に (確定した) 発注先 販売元を強制的に加える必要がある。
             * でないと、その販売元が取り扱っていない商品が候補に上がって
             * しまう可能性がある訳で、そうなると最悪発注できないはずの商品
             * を発注確定することができてしまう。
             */
            this.setState({
                trader_code: new_props.finalTrader.code,
                department:  new_props.department
            });
        } else if (this.props.finalTrader.code != '') {
            /*
             * 新たに受け取った finalTrader.code 空文字列で、
             * しかもその直前に受け取った finalTrader.code が空じゃなかった、
             * ということは、発注確定した商品が、全て消去されたか、若しくは
             * リセットされたかして、無くなったということである。
             * その場合、検索条件をまっさらにしてやらなくてはならない。
             */
            var department;

            if (new_props.department.code === '') {
                if (this.state.departments.length == 1) {
                    department = this.state.departments[0];
                } else {
                    department = { code: '', name: '' };
                }
            } else {
                department = new_props.department;
            }

            this.setState({
                department:    department,
                category_code: '',
                trader_code:   '',
                search_text:   ''
            });
        } else if (new_props.department.code === '') {
            if (this.state.department.code != '') {
                if (this.state.departments.length != 1) {
                    /*
                     * ここに来る経路はかなり複雑なので、if 文の条件を順番に
                     * 整理してみる。
                     *
                     * (0) まず、現状の発注先 販売元は確定していない、
                     *     つまり、発注が確定した物品のリストは空である。
                     *
                     * (1) 直前の発注先 販売元も確定していない、
                     *     つまり、前回も発注が確定した物品のリストは空である。
                     *    
                     * (2) 現状、発注元 部門診療科は確定していない
                     *
                     * (3) ただ部門診療科は選択された状態である
                     *
                     * さて、ここに至る条件は何だろうか?
                     * 発注のページを開いた直後だと、(0) 〜 (2) の条件に合致
                     * するが、部門診療科は一度でも検索しないと確定しないため
                     * (EditOrder.js の onSelectDepartment 及び
                     * onSearchDepartment を参照)、(3) の条件には合致しない。
                     *
                     * もったいぶってもしょうがないので、サクっと解答してし
                     * まうと、一旦登録した発注を消去した状態である。
                     * 消去するためには、まず発注が確定した物品を空にしなく
                     * てはならない。
                     * ここで (0) と (1) の条件に合致する。
                     * そして、発注を消去したすると resetOrder() が発行される
                     * (FinalPane.js 参照) ので、発注元 部門診療科は空になり
                     * (EditOrder.js 参照)、(2）の条件にも合致することになる。
                     *
                     * そして、ここがキモなのだが、発注を消去するということは、
                     * 発注が確定していた、ということである。
                     * つまり、発注元 部門診療科が選択されていないと発注を
                     * 確定することはできない訳で、つまりここで (3) の条件にも
                     * 合致するのである。
                     *
                     * 発注を消去した後は、ユーザの利便性を考慮して、新たな
                     * 発注を起案できるようにするのだが、複数の部門診療科に
                     * 所属するユーザは、それを選択できるようにしてあげるのが
                     * 親切というものだ。
                     * かくして、
                     *
                     * (4) ユーザが所属する部門診療科が複数である
                     *
                     * という条件が活きてくる訳である。
                     * 因みに、一つの部門診療科にしか所属していないユーザは、
                     * その選択の余地はないため、確定済みの部門診療科を引き
                     * 続き利用する。
                     *
                     * ふぅ、長かった。
                     */
                    this.setState({ department: { code: '', name: '' } });
                }
            }
        }
    },

    render: function() {
        return (
            <div>
              <fieldset className="order-edit-pane">
                <legend>発注元 部門診療科</legend>
                <div className="order-edit-search-pane-row">
                  <SelectDepartment orderCode={this.props.orderCode}
                                    finalTrader={this.props.finalTrader}
                                    onSelect={this.onSelectDepartment}
                                    value={this.state.department}
                                    options={this.state.departments} />
                </div>
              </fieldset>
              <fieldset className="order-edit-pane">
                <legend>検索</legend>
                <div className="order-edit-search-pane-row">
                  <span className="order-edit-search-pane-menu">
                    <Select placeholder="品目"
                            value={this.state.category_code}
                            onSelect={this.onSelectCategory}
                            options={this.state.categories} />
                  </span>
                  <span className="order-edit-search-pane-menu">
                    <SelectTrader finalTrader={this.props.finalTrader}
                                  value={this.state.trader_code}
                                  onSelect={this.onSelectTrader}
                                  options={this.state.traders} />
                  </span>
                </div>
                <div className="order-edit-search-pane-row">
                  <Input type="text"
                         bsSize="small"
                         placeholder="検索テキスト"
                         value={this.state.search_text}
                         onChange={this.onChangeSearchText} />
                </div>
                <Button bsSize="small"
                        onClick={this.onSearch}
                        className="order-edit-search-pane-button">
                  検索
                </Button>
                <Button bsSize="small"
                        onClick={this.onClear}
                        className="order-edit-search-pane-button">
                  クリア
                </Button>
              </fieldset>
            </div>
        );
    }
});

module.exports = SearchPane;
