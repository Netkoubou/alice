'use strict';
var React = require('react');

var SelectAC = React.createClass({
    propTypes: {
        placeholder: React.PropTypes.string.isRequired,
        onSelect:    React.PropTypes.func.isRequired,
        value:       React.PropTypes.string.isRequired,
        options:     React.PropTypes.arrayOf(React.PropTypes.shape({
            code: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired
        }) ).isRequired
    },

    getInitialState: function() {
        var value = '';

        if (this.props.value != '') {
            this.props.options.forEach(function(o) {
                if (this.props.value == o.code) {
                    value = o.name;
                }
            }.bind(this) );
        }

        return { value: value };
    },

    onChange: function(e) {
        this.setState({ value: e.target.value });

        var matched = null;

        this.props.options.forEach(function(o) {
            if (e.target.value === o.name) {
                matched = o;
            }
        });

        if (matched == null) {
            this.props.onSelect({ code: '', name: '' });
        } else {
            this.props.onSelect(matched);
        }
    },

    onBlur: function() {
        var matched = null;

        this.props.options.forEach(function(o) {
            if (this.state.value === o.name) {
                matched = o;
            }
        }.bind(this) );

        if (matched == null) {
            this.setState({ value: '' });
        }
    },

    render: function() {
        var id      = "traders" + Math.random().toString();
        var traders = this.props.options.map(function(o, i) {
            return <option value={o.name} key={i} />;
        });

        return (
            <div className="selectac">
              <input className="selectac-input"
                     placeholder={this.props.placeholder}
                     type="text"
                     autoComplete="on"
                     onChange={this.onChange}
                     onBlur={this.onBlur}
                     value={this.state.value}
                     list={id} />
              <datalist id={id}>
                {traders}
              </datalist>
            </div>
        );
    }
});

module.exports = SelectAC;
