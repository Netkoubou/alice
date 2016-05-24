'use strict';

var React = require('react');

var StampRow = React.createClass({
    render: function() {
        return (
            <div>
              <table className="stamp left-stamp">
                <thead>
                  <tr>
                    <th colSpan="5">発注書承認印欄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>院長</td>
                    <td>部長</td>
                    <td>院務担当</td>
                    <td>室長</td>
                    <td>SPD 担当</td>
                  </tr>
                </tbody>
              </table>

              <table className="stamp right-stamp">
                <thead>
                  <tr>
                    <th colSpan="6">納品書処理印欄</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>確定</td>
                    <td>請求処理</td>
                    <td>確認</td>
                    <td>院務担当</td>
                    <td>確認</td>
                    <td>SPD 担当</td>
                  </tr>
                </tbody>
              </table>
            </div>
        );
    }
});

var OrderInfos = React.createClass({
    PropTypes: { info: React.PropTypes.object.isRequired },

    render: function() {
        var submission_name;
        
        if (this.props.info.purpose === 'FAX') {
            submission_name = '発注日';
        } else {
            submission_name = '提出日';
        }

        return (
            <div className="infos">
              <table className="left-infos">
                <tbody>
                  <tr>
                    <td className="info-name">発注先 販売元</td>
                    <td className="info-data">
                      {this.props.info.trader} 様
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">発注元 部門診療科</td>
                    <td className="info-data">
                      {this.props.info.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">起案番号</td>
                    <td className="info-data">
                      {this.props.info.order_code}
                    </td>
                  </tr>
                </tbody>
              </table>
  
              <table className="right-infos">
                <tbody>
                  <tr>
                    <td className="info-name">起案日</td>
                    <td className="info-data">
                      {this.props.info.drafting_date}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">{submission_name}</td>
                    <td className="info-data">
                      {this.props.info.submission_date}
                    </td>
                  </tr>
                  <tr>
                    <td className="info-name">連絡先</td>
                    <td className="info-data">TEL & FAX: 046-822-9640</td>
                  </tr>
                </tbody>
              </table>
            </div>
        );
    }
});

var OrderProducts = React.createClass({
    propTypes: {
        purpose:       React.PropTypes.string.isRequired,
        products:      React.PropTypes.array.isRequired,
        startOfNumber: React.PropTypes.number.isRequired,
        total:         React.PropTypes.number
    },

    composeProduct: function(product, index) {
        var price_string = product.price.toLocaleString('ja-JP', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        var quantity_string = product.quantity.toLocaleString();
        var subtotal;

        if (this.props.purpose === 'FAX') {
            subtotal = Math.round(product.price * product.quantity);
        } else {
            subtotal = product.billing_amount;
        }

        var subtotal_string = subtotal.toLocaleString();
        var delivered_date  = '';

        if (product.delivered_date) {
            delivered_date = product.delivered_date.substr(2);
        }

        var maker = product.maker;
        var name  = product.name;
        
        if (product.state === 'CANCELED') {
            name = <del>{product.name}</del>;
        }

        return (
            <tr key={index}>
              <td className="products-data-number">
                {this.props.startOfNumber + index}
              </td>
              <td className="products-data-string">{name}</td>
              <td className="products-data-string">{maker}</td>
              <td className="products-data-number">{price_string}</td>
              <td className="products-data-number">{quantity_string}</td>
              <td className="products-data-number">{subtotal_string}</td>
              <td>{delivered_date}</td>
            </tr>  
        );
    },

    render: function() {
        var products = this.props.products.map(function(p, i) {
            return this.composeProduct(p, i);
        }.bind(this) );

        if (this.props.total != null) {
            products.push(
                <tr key={Math.random()}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="products-data-number">合計</td>
                  <td className="products-data-number">
                    {Math.round(this.props.total).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
            );
        }

        return (
            <table className="products">
              <thead>
                <tr>
                  <td className="products-header">No.</td>
                  <td className="products-header">品名</td>
                  <td className="products-header">製造元</td>
                  <td className="products-header">単価</td>
                  <td className="products-header">数量</td>
                  <td className="products-header">小計</td>
                  <td className="products-header">納品日</td>
                </tr>
              </thead>
              <tbody>
                {products}
              </tbody>
            </table>
        );
    }
});

var NUMBER_OF_PRODUCTS_PER_PAGE = 12;

var SuborderSheet = React.createClass({
    propTypes: {
        info:          React.PropTypes.object.isRequired,
        page:          React.PropTypes.number.isRequired,
        numberOfPages: React.PropTypes.number.isRequired,
        total:         React.PropTypes.number.isRequired
    },

    render: function() {
        var title     = '神奈川歯科大学 附属病院 ';
        var stamp_row = null;
        var ordered   = null;

        if (this.props.info.order_type === 'URGENCY_ORDER') {
            ordered = <p className="ordered">発注済</p>;
        }

        if (this.props.info.purpose === 'APPROVAL') {
            title    += '発注依頼書';
            stamp_row = <StampRow />;
        } else {
            title += '注文書';
        }

        var N               = NUMBER_OF_PRODUCTS_PER_PAGE;
        var page            = this.props.page;
        var number_of_pages = this.props.numberOfPages;
        var total           = this.props.total;

        return(
            <fieldset>
              <div>
                <p className="title">{title}</p>
                {ordered}
              </div>
              {stamp_row}
              <OrderInfos info={this.props.info} />
              <OrderProducts purpose={this.props.info.purpose}
                             products={this.props.info.products}
                             startOfNumber={(page - 1) * N + 1}
                             total={page == number_of_pages? total: null} />
              <div className="page">
                {'-' + page + '/' + number_of_pages + '-'}
              </div>
            </fieldset>
        );
    }
});

var OrderSheet = React.createClass({
    propTypes: {
        info: React.PropTypes.shape({
            purpose: React.PropTypes.oneOf([
                'APPROVAL',
                'FAX'
            ]).isRequired,

            order_code:    React.PropTypes.string.isRequired,
            order_type:    React.PropTypes.oneOf([
                'ORDINARY_ORDER',
                'URGENCY_ORDER'
            ]).isRequired,

            department:      React.PropTypes.string.isRequired,
            trader:          React.PropTypes.string.isRequired,
            drafting_date:   React.PropTypes.string.isRequired,
            submission_date: React.PropTypes.string.isRequired,

            products:      React.PropTypes.arrayOf(React.PropTypes.shape({
                name:     React.PropTypes.string.isRequired,
                maker:    React.PropTypes.string.isRequired,
                quantity: React.PropTypes.number.isRequired,
                price:    React.PropTypes.number.isRequired,

                billing_amount: React.PropTypes.number,
                state:          React.PropTypes.string,
                delivered_date: React.PropTypes.string
            }) ).isRequired
        }).isRequired
    },

    render: function() {
        var sheets          = [];
        var N               = NUMBER_OF_PRODUCTS_PER_PAGE;
        var number_of_pages = Math.ceil(this.props.info.products.length / N);
        var total           = 0;
        var products;

        this.props.info.products.forEach(function(p, i) {
            if (i % N == 0) {
                products = [];
            }

            products.push(p);

            if (this.props.info.purpose === 'FAX') {
                total += Math.round(p.price * p.quantity)
            } else {
                total += p.billing_amount;
            }

            if (i % N == N - 1 || i == this.props.info.products.length - 1) {
                var info = {
                    purpose:         this.props.info.purpose,
                    order_code:      this.props.info.order_code,
                    order_type:      this.props.info.order_type,
                    department:      this.props.info.department,
                    trader:          this.props.info.trader,
                    drafting_date:   this.props.info.drafting_date,
                    submission_date: this.props.submission_date,
                    products:        products.map(function(p) { return p; })
                };

                var page = Math.floor(i / N + 1);

                sheets.push(
                    <SuborderSheet key={page}
                                   info={info}
                                   page={page}
                                   numberOfPages={number_of_pages}
                                   total={total} />
                );
            }

        }.bind(this) );

        return (
            <div className="preview-suborders">
              {sheets}
            </div>
        );
    }
});

module.exports = OrderSheet;
