var React       = require('react');
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem    = require('react-bootstrap').MenuItem;

var Select = React.createClass({
    getInitialState: function() {
        return ({
            title: this.props.placeholder
        });
    },

    onSelect: function(e) {
        this.setState({ title: e.desc });
        this.props.onSelect(e);
    },

    options: function(list) {
        return list.map(function(opt) {
            return (
                <MenuItem eventKey={opt}
                          key={opt.keyid}
                          onSelect={this.onSelect}>
                  {opt.desc}
                </MenuItem>
            );
       }.bind(this) );
    },

    render: function() {
        return (
            <SplitButton bsSize="small"
                         bsStyle="default"
                         title={this.state.title}>
              {this.options(this.props.options)}
            </SplitButton>
        );
    }
});

module.exports = Select;
