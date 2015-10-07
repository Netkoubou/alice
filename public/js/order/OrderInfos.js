'use strict';
var React  = require('react');
var Input  = require('react-bootstrap').Input;
var Notice = require('../components/Notice');
var Util   = require('../lib/Util');

var OrderInfos = React.createClass({
    propTypes: {
        legend:         React.PropTypes.string.isRequired,
        order:          React.PropTypes.object.isRequired,
        orderRemark:    React.PropTypes.string.isRequired,
        onChangeRemark: React.PropTypes.func.isRequired
    },

    render: function() {
        return (
            <fieldset id="order-infos">
              <legend>{this.props.legend}</legend>
                <div id="order-infos-notices">
                  <Notice className="order-infos-notice" title="起案番号">
                    {this.props.order.order_code}
                  </Notice>
                  <Notice className="order-infos-notice" title="起案日">
                    {this.props.order.drafting_date}
                  </Notice>
                  <Notice className="order-infos-notice" title="起案者">
                    {this.props.order.drafter_account}
                  </Notice>
                  <Notice className="order-infos-notice" title="発注区分">
                    {Util.toOrderTypeName(this.props.order.order_type)}
                  </Notice>
                  <Notice className="order-infos-notice"
                          title="発注元 部門診療科">
                    {this.props.order.department_name}
                 </Notice>
                 <Notice id="order-infos-trader" title="発注先 販売元">
                   {this.props.order.trader_name}
                 </Notice>
               </div>
               <Input id="order-infos-remark"
                      type="text"
                      bsSize="small"
                      placeholder="備考・連絡"
                      value={this.props.orderRemark}
                      onChange={this.props.onChangeRemark} />
            </fieldset>
        );
    }
});

OrderInfos.Totals = React.createClass({
    propTypes: { order: React.PropTypes.object.isRequired },

    render: function() {
        var order_total   = 0.0;
        var billing_total = 0.0;

        this.props.order.products.forEach(function(product) {
            order_total   += product.cur_price * product.quantity;
            billing_total += product.billing_amount;
        });

        return (
            <div id="order-infos-totals">
              <Notice className="order-infos-total" title="発注総計">
                {Math.round(order_total).toLocaleString()}
              </Notice>
              <Notice className="order-infos-total" title="請求総計">
                {Math.round(billing_total).toLocaleString()}
              </Notice>
           </div>
        );
    }
});

module.exports = OrderInfos;
