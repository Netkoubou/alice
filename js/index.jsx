var React  = require('react');
var Header = require('./Header');
var Nav    = require('./Nav');
var Opes   = require('./Opes');
var Footer = require('./Footer');

var Contents = React.createClass({
    render: function() {
        return (
            <div>
              <Header />
              <Nav />
              <Opes />
              <Footer />
            </div>
        );
    }
});

React.render(<Contents />, document.body);
