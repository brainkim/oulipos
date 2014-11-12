/** @jsx React.DOM */
var $ = require('jquery');
var React = require('react');
var {Set, Range, List, Map} = require('immutable');
var farts = require('./farts');
var Scribe = require('scribe-editor');
var CurlyQuotes = require('scribe-plugin-curly-quotes');
require('./csshake.min.css');
require('./keyboard.less');
require('./corpse.less');

function isModified(ev) {
  return !!(ev.metaKey || ev.altKey || ev.ctrlKey || ev.shiftKey);
}

$.fn.shake = function(duration) { 
  duration = duration != null ? duration : 200;
  this.each(() => {
    this.addClass('shake shake-sloww shake-constant');
    setTimeout(() => {
      this.removeClass('shake shake-slow shake-constant');
    }, duration);
  });
};

var ContentEditable = React.createClass({
  preventPaste(ev) {
    ev.preventDefault();
  },

  render() {
    return this.transferPropsTo(
      <div style={{whiteSpace: 'pre'}}
           className="corpse"
           spellcheck={false}
           onPaste={this.preventPaste} />
    );
  },

  componentDidMount() {
    this.getDOMNode().spellcheck = false;
    var scribe = this.scribe = new Scribe(this.getDOMNode(), {
      allowBlockElements: false
    });
    scribe.use(CurlyQuotes());
  }
});

var QWERTY = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row) => {
  return row.split('');
});

var KeyBoard = React.createClass({
  render() {
    var chars = QWERTY.map((row, rowIndex) => {
      var keys = row.map((ch) => {
        return (
          <span key={ch}
                ref={ch.toLowerCase()}
                onClick={this._onKeyClick.bind(null, ch)}
                className="keyboard__char"
                style={this.props.selected.contains(ch) ? {color: 'red'} : {}}>
            {ch.toUpperCase()}
          </span>
        );
      });
      return (
        <div className={"keyboard__row keyboard__row--"+ rowIndex}>
          { keys }
        </div>
      );
    });

    return (
      <div className="keyboard" tabIndex="2" onKeyDown={this._onKeyDown}>{chars}</div>
    );
  },

  _onKeyDown(ev) {
    if (!isModified(ev)) {
      var ref = this.refs[String.fromCharCode(ev.keyCode).toLowerCase()];
      if (ref != null) {
        ev.target = ref.getDOMNode();
        this.props.onCharSelect(ev);
      }
    }
  },

  _onKeyClick(ch, ev) {
    ev.keyCode = ch.charCodeAt(0);
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

var emptyRequirements = Map();

var Anagram = React.createClass({
  getInitialState() {
    return {
      requirements: Map()
    };
  },
  render() {
    return null;
  }
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
    if (this.state.locked) {
      ev.preventDefault();
    }
    else {
      var ch = String.fromCharCode(ev.keyCode).toLowerCase();
      if (this.state.forbidden.contains(ch)) {
        ev.preventDefault();
        window.addEventListener('keydown', this.lockKeyboard, true);
        farts(this.leaveParkingGarage);
        this.setState({
          locked: true
        });
      }
    }
  },

  selectChar(ev) {
    if (!this.state.locked) {
      var ch = String.fromCharCode(ev.keyCode).toLowerCase();
      var forbidden = this.state.forbidden;
      forbidden = forbidden.contains(ch)
        ? forbidden.remove(ch)
        : forbidden.add(ch);
      this.setState({
        forbidden: forbidden,
        poem: cleanPoem(this.state.poem, forbidden)
      });
      $(ev.target).shake();
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
          onChange={this.updatePoem}
          className={this.state.locked ? 'shake shake-horizontal shake-constant' : ''}
          text={this.state.poem}
          ref="editor" />
        <KeyBoard
          selected={this.state.forbidden}
          onCharSelect={this.selectChar} />
      </div>
    );
  }
});

module.exports = Lipogram;
