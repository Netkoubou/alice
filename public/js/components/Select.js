/*
 * Look & Feel を統一するため、React-Bootstrap で <select> を再実装。
 * デフォルトの <select> と異なり、本実装では
 *
 *   <Select options={[...]} />
 *
 * のように、一連の option を配列で、しかも options 属性として渡す。
 */
'use strict';
var React       = require('react');
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem    = require('react-bootstrap').MenuItem;

var Select = React.createClass({
    propTypes: {
        placeholder: React.PropTypes.string.isRequired,
        options:     React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            desc: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    getInitialState: function() {
        return({ title: this.props.placeholder });
    },

    onSelect: function(e) {
        this.setState({ title: e.desc });
        this.props.onSelect(e);
    },

    options: function(list) {
        return list.map(function(opt) {
            return (
                <MenuItem eventKey={opt}
                          key={opt.code}
                          onSelect={this.onSelect}>
                  {opt.desc}
                </MenuItem>
            );
       }.bind(this) );
    },

    render: function() {
        var title;

        if (this.props.value !== '') {
            title = this.state.title;
        } else {
            title = this.props.placeholder;
        }

        return (
            <SplitButton bsSize="small" bsStyle="default" title={title}>
              {this.options(this.props.options)}
            </SplitButton>
        );
    }
});

module.exports = Select;
