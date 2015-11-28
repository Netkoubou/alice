'use strict';
var React    = require('react');
var ReactDOM = require('react-dom');

var PreviewOrder = React.createClass({
    render: function() {
        var stamp_row = null;

        if (window.opener.info.purpose === 'APPROVAL') {
            stamp_row = (
                <table id="stamp">
                  <thead>
                    <tr>
                      <th>病院長</th>
                      <th>部長</th>
                      <th></th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
            );
        }

        var total    = 0.0;
        var products = window.opener.info.products.map(function(p, i) {
            var subtotal = p.price * p.quantity;

            total += subtotal;

            var price_string = p.price.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            var quantity_string = p.quantity.toLocaleString();
            var subtotal_string = subtotal.toLocaleString('ja-JP', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            return (
                <tr key={i}>
                  <td className="products-data-number">{i + 1}</td>
                  <td className="products-data-string">{p.name}</td>
                  <td className="products-data-string">{p.maker}</td>
                  <td className="products-data-number">{price_string}</td>
                  <td className="products-data-number">{quantity_string}</td>
                  <td className="products-data-number">{subtotal_string}</td>
                  <td></td>
                </tr>  
            );
        });

        products.push(
            <tr key={Math.random()}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="products-data-number">合計</td>
              <td className="products-data-number">
                {Math.floor(total).toLocaleString()}
              </td>
              <td></td>
            </tr>
        );

        return (
            <div id="preview-order">
              <fieldset>
                <h1>神奈川歯科大学 附属病院 発注書</h1>
                {stamp_row} 
                <div id="infos">
                  <table id="left-infos">
                    <tbody>
                      <tr>
                        <td className="info-name">発注先 販売元</td>
                        <td className="info-data">
                          {window.opener.info.trader} 様
                        </td>
                      </tr>
                      <tr>
                        <td className="info-name">発注元 部門診療科</td>
                        <td className="info-data">
                          {window.opener.info.department}
                        </td>
                      </tr>
                      <tr>
                        <td className="info-name">起案番号</td>
                        <td className="info-data">
                          {window.opener.info.order_code}
                        </td>
                      </tr>
                    </tbody>
                  </table>
  
                  <table id="right-infos">
                    <tbody>
                      <tr>
                        <td className="info-name">起案日</td>
                        <td className="info-data">
                          {window.opener.info.drafting_date}
                        </td>
                      </tr>
                      <tr>
                        <td className="info-name">発注日</td>
                        <td className="info-data">
                          {window.opener.info.order_date}
                        </td>
                      </tr>
                      <tr>
                        <td className="info-name">連絡先</td>
                        <td className="info-data">TEL & FAX: 046-822-9640</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
  
                <table id="products">
                  <thead>
                    <tr>
                      <td className="products-header">No.</td>
                      <td className="products-header">品名</td>
                      <td className="products-header">製造元</td>
                      <td className="products-header">単価</td>
                      <td className="products-header">数量</td>
                      <td className="products-header">小計</td>
                      <td className="products-header">済み</td>
                    </tr>
                  </thead>
                  <tbody>
                    {products}
                  </tbody>
                </table>
              </fieldset>
              <button onClick={window.print}>印刷</button>
            </div>
        );
    }
});

ReactDOM.render(<PreviewOrder />, document.getElementById('contents-area') );
