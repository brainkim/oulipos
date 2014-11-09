/** @jsx React.DOM */
var React = require('react');

var App = require('./App');
var Home = require('./Home');
var About = require('./About');
var Lipogram = require('./Lipogram');
var {DefaultRoute, Route, Routes} = require('react-router');

React.renderComponent((
  <Routes location="hash">
    <Route path="/" handler={App}>
      <DefaultRoute name="home" handler={Home} />
      <Route name="lipogram" handler={Lipogram} />
      <Route name="about" handler={About} />
    </Route>
  </Routes>
), document.body);
