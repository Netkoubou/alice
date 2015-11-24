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

        if (user.account != cost.drafter_account) {
            if (user.privileged.approve) {
                permission = 'APPROVE';
            } else {
                user.departments.forEach(function(d) {
                    if (d.code === cost.department_code && d.approve) {
                        permission = 'APPROVE';
                    }
                });
            }
        }

        return (
            <div id="process-cost">
              {this.props.user.name}
            </div>
        );
    }
});

module.exports = ProcessCost;
