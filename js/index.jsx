var React = require('react');
var Hello = React.createClass({
    render: function() {
        return (
            <div>
              Hello! World!
            </div>
        );
    }
});

React.render(<Hello />, document.body);
