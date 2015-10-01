'use strict';
var React      = require('react');
var Input      = require('react-bootstrap').Input;
var TableFrame = require('../components/TableFrame');
var Notice     = require('../components/Notice');

var Approve = React.createClass({
    propTypes: { order: React.PropTypes.object.isRequired },

    getInitialState: function() {
        return { order_remark: this.props.order.order_remark }
    },

    onChangeRemark: function(e) {
        this.setState({ order_remark: e.target.value });
    },

    render: function() {
        return (
            <fieldset id="order-approve">
              <legend>発注の承認</legend>
              <Notice id="order-approve-order-code" title="起案番号">
                {this.props.order.order_code}
              </Notice>
              <Notice id="order-approve-drafting-date" title="起案日">
                {this.props.order.drafting_date}
              </Notice>
              <Notice id="order-approve-drafter" title="起案者">
                {this.props.order.drafter_account}
              </Notice>
              <Notice id="order-approve-order-type" title="発注区分">
                {this.props.order.order_type}
              </Notice>
              <Notice id="order-approve-department" title="発注元 部門診療科">
                {this.props.order.department_name}
              </Notice>
              <Notice id="order-approve-trader" title="発注先 販売元">
                {this.props.order.trader_name}
              </Notice>
              <Input id="order-approve-remark"
                     type="text"
                     bsSize="small"
                     placeholder="備考・連絡"
                     value={this.state.order_remark}
                     onChange={this.onChangeRemark} />
                     
            </fieldset>
        );
    }
});

module.exports = Approve;
