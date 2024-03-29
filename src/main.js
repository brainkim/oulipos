/** @jsx React.DOM */
var React = require('react');

var About = require('./About');
var Home = require('./Home');
var {Anagram, Lipogram} = require('./Gram');
var {DefaultRoute, Route, Routes} = require('react-router');
var React = require('react');
var {Link} = require('react-router');
require('./App.css');

var App = React.createClass({
  render: function() {
    return (
      <div>
        <header>
          <ul>
            <li><Link to="lipogram">Lipograms</Link></li>
            <li><Link to="anagram">Anagrams</Link></li>
          </ul>
        </header>

        <this.props.activeRouteHandler />
      </div>
    );
  }
});

React.renderComponent((
  <Routes location="hash">
    <Route path="/" handler={App}>
      <Route name="lipogram" handler={Lipogram} />
      <Route name="anagram" handler={Anagram} />
    </Route>
  </Routes>
), document.body);
