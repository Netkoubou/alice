var React       = require('react');
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem    = require('react-bootstrap').MenuItem;

var Select = React.createClass({
    getInitialState: function() {
        return {
            keyid: this.props.options[0].keyid,
            desc:  this.props.options[0].desc
        };
    },

    updateState: function(opt) {
        this.setState({
            keyid: opt.keyid,
            desc:  opt.desc
        });
    },

    options: function() {
        return this.props.options.map(function(opt) {
            var onSelect = function() {
                this.updateState(opt);
            }.bind(this);

            return (
                <MenuItem eventKey={opt.keyid}
                          key={opt.desc}
                          onSelect={onSelect}>
                  {opt.desc}
                </MenuItem>
            );
       }.bind(this) );
    },

    render: function() {
        return (
            <SplitButton bsStyle="default" title={this.state.desc}>
              {this.options()}
            </SplitButton>
        );
    }
});

module.exports = Select;
