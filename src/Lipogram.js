/** @jsx React.DOM */
var $ = require('jquery');
var React = require('react');
var {Set, Range} = require('immutable');
var farts = require('./farts');
require('./csshake.min.css');

var ContentEditable = React.createClass({
  render() {
    return this.transferPropsTo(
      <div 
        onInput={this.emitChange} 
        onBlur={this.emitChange}
        contentEditable
        dangerouslySetInnerHTML={{__html: this.props.html}}>
      </div>
    );
  },

  shouldComponentUpdate(nextProps){
    return nextProps.html !== this.getDOMNode().innerHTML;
  },

  emitChange(ev) {
    var html = this.getDOMNode().innerHTML;
    if (this.props.onChange && html !== this.lastHtml) {
      ev.target.value = html;
      this.props.onChange(ev);
    }
    this.lastHtml = html;
  }
});

var CharSelector = React.createClass({
  render() {
    var chars = this.props.chars.map((ch) => {
      return (
        <span
          onClick={this.selectChar.bind(null, ch)}
          style={this.props.selected.contains(ch) ? {color: 'red'} : {}}>
          {ch}
        </span>
      );
    }).toArray();

    return (
      <div>
        {chars}
      </div>
    );
  },

  selectChar(ch, ev) {
    ev.char = ch;
    if (this.props.onCharSelect) {
      this.props.onCharSelect(ev);
    }
  }
});

function cleanPoem(poem, forbidden) {
  return forbidden.reduce((poem, ch) => {
    return poem.replace(new RegExp(ch, 'gi'), '');
  }, poem);
}

var ascii = Range('a'.charCodeAt(0), 'z'.charCodeAt(0) + 1).map((i) => {
  return String.fromCharCode(i);
});

var Lipogram = React.createClass({
  getInitialState() {
    return {
      poem: 'Poopie Pants',
      forbidden: Set(['a']),
      locked: false
    };
  },

  leaveParkingGarage() {
    this.setState({
      locked: false
    });
  },

  validateParking(ev) {
    if (! this.state.locked) {
      var ch = String.fromCharCode(ev.keyCode).toLowerCase();
      if (this.state.forbidden.contains(ch)) {
        farts(this.leaveParkingGarage);
        ev.preventDefault();
        this.setState({
          locked: true
        });
      }
    }
  },

  change(ev) {
    if (!this.state.locked) {
      this.setState({
        poem: ev.target.value
      });
    }
  },

  selectChar(ev) {
    if (!this.state.locked) {
      var forbidden = this.state.forbidden;
      forbidden = forbidden.contains(ev.char)
        ? forbidden.remove(ev.char)
        : forbidden.add(ev.char);
      this.setState({
        forbidden: forbidden,
        poem: cleanPoem(this.state.poem, forbidden)
      });
    }
  },

  componentDidMount() {
    this.setState({
      poem: cleanPoem(this.state.poem, this.state.forbidden)
    });
  },

  render() {
    console.log(this.state.locked);
    return (
      <div>
        <textarea
          onKeyDown={this.validateParking}
          onChange={this.change}
          value={this.state.poem}
          className={this.state.locked ? 'shake shake-hard' : ''}
          rows="30"
          cols="50"
          ref="editor" />
        <CharSelector
          chars={ascii}
          selected={this.state.forbidden}
          onCharSelect={this.selectChar} />
      </div>
    );
  }
});

module.exports = Lipogram;
