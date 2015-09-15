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
        onSelect:    React.PropTypes.func.isRequired,
        value:       React.PropTypes.string.isRequired,
        options:     React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    onSelect: function(e) { this.props.onSelect(e); },

    render: function() {
        var title   = this.props.placeholder;
        var options = this.props.options.map(function(o) {
            return (
                <MenuItem eventKey={o}
                          key={o.code}
                          onSelect={this.onSelect}>
                  {o.name}
                </MenuItem>
            );
        }.bind(this) );

        if (this.props.value != '') {
            title = this.props.options.filter(function(o) {
                return o.code === this.props.value;
            }.bind(this) )[0].name;
        }

        return (
            <SplitButton bsSize="small" bsStyle="default" title={title}>
              {options}
            </SplitButton>
        );
    }
});

module.exports = Select;
