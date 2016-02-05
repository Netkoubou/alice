'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');

var CostInfos = React.createClass({
    render: function() {
        return (
            <div id="infos">
              <table id="left-infos">
                <tbody>
                  <tr>
                    <td className="info-name">起案者</td>
                    <td className="info-data">
                      {window.opener.info.user}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">起案番号</td>
                    <td className="info-data">
                      {window.opener.info.cost_code}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">起案日</td>
                    <td className="info-data">
                      {window.opener.info.drafting_date}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table id="right-infos">
                <tbody>
                  <tr>
                    <td className="info-name">申請元 部門診療科</td>
                    <td className="info-data">
                      {window.opener.info.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">勘定科目</td>
                    <td className="info-data">
                      {window.opener.info.account_title}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
        );
    }
});

var Breakdowns = React.createClass({
    render: function() {
        var total = 0.0;

        var breakdowns = window.opener.info.breakdowns.map(function(b, i) {
            var subtotal        = b.price * b.quantity;
            var price_string    = b.price.toLocaleString();
            var quantity_string = b.quantity.toLocaleString();
            var subtotal_string = subtotal.toLocaleString();

            total += subtotal;

            return (
                <tr key={i}>
                  <td className="breakdowns-data-number">{i + 1}</td>
                  <td className="breakdowns-data-string">{b.date}</td>
                  <td className="breakdowns-data-string">{b.article}</td>
                  <td className="breakdowns-data-string">{quantity_string}</td>
                  <td className="breakdowns-data-number">{price_string}</td>
                  <td className="breakdowns-data-number">{subtotal_string}</td>
                  <td className="breakdowns-data-string">{b.note}</td>
                </tr>
            );
        });

        breakdowns.push(
            <tr key={breakdowns.length}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="breakdowns-data-number">合計</td>
              <td className="breakdowns-data-number">
                {total.toLocaleString()}
              </td>
              <td></td>
            </tr>
        );

        return (
            <table id="breakdowns">
              <thead>
                <tr>
                  <td className="breakdowns-header">No.</td>
                  <td className="breakdowns-header">購入日</td>
                  <td className="breakdowns-header">品名</td>
                  <td className="breakdowns-header">数量</td>
                  <td className="breakdowns-header">単価</td>
                  <td className="breakdowns-header">小計</td>
                  <td className="breakdowns-header">摘要 / 概要</td>
                </tr>
              </thead>
              <tbody>
                {breakdowns}
              </tbody>
            </table>
        );
    }
});

var PreviewCostApplication = React.createClass({
    render: function() {
        return (
            <div>
              <CostInfos />
              <Breakdowns />
            </div>
        );
    }
});

ReactDOM.render(
    <PreviewCostApplication />,
    document.getElementById('contents-area')
);
