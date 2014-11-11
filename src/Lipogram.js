/** @jsx React.DOM */
var $ = require('jquery');
var React = require('react');
var {Set, Range} = require('immutable');
var farts = require('./farts');
require('./csshake.min.css');

var ContentEditable = React.createClass({
  paste(ev) {
    ev.preventDefault();
  },

  render() {
    return this.transferPropsTo(
      <pre
        style={{whitespace: 'pre'}}
        contentEditable={this.props.editable}
        onPaste={this.paste}
        dangerouslySetInnerHTML={{__html: this.props.html}} />
    );
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
    window.removeEventListener('keydown', this.lockKeyboard, true);
    this.setState({
      locked: false
    });
    $(this.refs.editor.getDOMNode()).focus();
  },

  validateParking(ev) {
    var ch = String.fromCharCode(ev.keyCode).toLowerCase();
    if (this.state.forbidden.contains(ch)) {
      ev.preventDefault();
      window.addEventListener('keydown', this.lockKeyboard, true);
      farts(this.leaveParkingGarage);
      this.setState({
        locked: true
      });
    }
  },

  change(ev) {
    var text = ev.target.innerText;
    console.log(text, this.state.locked);
    if (!this.state.locked) {
      this.setState({
        poem: text 
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
    return (
      <div>
        <ContentEditable
          onKeyDown={this.validateParking}
          onInput={this.change}
          editable={!this.state.locked}
          className={this.state.locked ? 'shake shake-hard' : ''}
          html={this.state.poem}
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
