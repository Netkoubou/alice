'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var Button     = require('react-bootstrap').Button;
var XHR        = require('superagent').Button;
var TableFrame = require('../components/TableFrame');
var Messages   = require('../lib/Messages');
var Util       = require('../lib/Util');

var ProcessCost = React.createClass({
    propTypes: {
        user:   React.PropTypes.object.isRequired,
        cost:   React.PropTypes.object.isRequired,
        goBack: React.PropTypes.func.isRequired
    },

    render: function() {
        var permission = 'REFER_ONLY';

        return (
            <div id="process-cost">
              {this.props.user.name}
            </div>
        );
    }
});

module.exports = ProcessCost;
