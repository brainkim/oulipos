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
  return !!(ev.metaKey || ev.altKey || ev.ctrlKey);
}

$.fn.shake = function(duration) { 
  duration = duration != null ? duration : 200;
  this.each(() => {
    this.addClass('shake shake-slow shake-constant');
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
           spellCheck={false}
           onPaste={this.preventPaste} />
    );
  },

  componentDidMount() {
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
      <div className="keyboard" tabIndex={this.props.disabled ? false : "2"} onKeyDown={this._onKeyDown}>{chars}</div>
    );
  },

  _onKeyDown(ev) {
    if (!isModified(ev) && this.props.onCharSelect) {
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

var Lipogram = React.createClass({
  getInitialState() {
    return {
      forbidden: Set(['e']),
      preset: 'no_e',
      locked: false,
      setup: true,
    };
  },

  leaveParkingGarage() {
    this.setState({
      locked: false
    });
    $(this.refs.editor.getDOMNode()).focus();
  },

  validateParking(ev) {
    if (isModified(ev)) {
    }
    else if (this.state.locked) {
      ev.preventDefault();
    }
    else {
      var ch = String.fromCharCode(ev.keyCode).toLowerCase();
      if (this.state.forbidden.contains(ch)) {
        ev.preventDefault();
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
        preset: 'custom',
      });
      $(ev.target).shake();
    }
  },

  choosePreset(ev) {
    switch (ev.target.value) {
      case 'no_e': 
        this.setState({
          preset: ev.target.value,
          forbidden: Set(['e'])
        });
        break;
      case 'only_u':
        this.setState({
          preset: ev.target.value,
          forbidden: Set(['a', 'e', 'i', 'o'])
        });
        break;
      case 'only_e':
        this.setState({
          preset: ev.target.value,
          forbidden: Set(['a', 'i', 'o', 'u'])
        });
        break;
      case 'top_row':
        this.setState({
          preset: ev.target.value,
          forbidden: Set('asdfghjklzxcvbnm'.split(''))
        })
        break;
      default:
        this.setState({
          preset: 'custom'
        });
        break;
    }
  },

  start() {
    this.setState({
      setup: false
    });
  },

  render() {
    if (this.state.setup) {
      return (
        <div>
          <p>
            {"Instructions: Select the keys that you'd like to forbid yourself from using," +
             " or choose one of the presets below"}
          </p>
          <KeyBoard
            selected={this.state.forbidden}
            onCharSelect={this.selectChar}
            />
          <select value={this.state.preset} onChange={this.choosePreset}>
            <option value="no_e">No letter E</option>
            <option value="only_u">{"Only U's for vowels"}</option>
            <option value="only_e">{"Only E's for vowels"}</option>
            <option value="top_row">Qwerty</option>
            <option value="custom">Or select your own</option>
          </select>
          <button onClick={this.start}>Start!</button>
        </div>
      );
    }
    else {
      return (
        <div>
          <ContentEditable
            onKeyDown={this.validateParking}
            className={this.state.locked ? 'shake shake-horizontal shake-constant' : ''}
            ref="editor" />
          <KeyBoard
            disabled={!this.state.setup}
            selected={this.state.forbidden} />
        </div>
      );
    }
  }
});

function inc(n) {
  return n + 1;
}

function dec(n) {
  return n - 1;
}

var plums = 'I have eaten\nthe plums\nthat were in\nthe icebox\nand which\nyou were probably\nsaving\nfor breakfast\nForgive me\nthey were delicious\nso sweet\nand so cold';

var KeyCounter = React.createClass({
  render() {
    var chars = QWERTY.map((row, rowIndex) => {
      var keys = row.map((ch) => {
        var count = this.props.reqs.get(ch.toLowerCase(), 0);
        return (
          <div style={{position: 'relative', display: 'inline-block'}}>
            <span key={ch}
                  ref={ch.toLowerCase()}
                  className="keyboard__char"
                  style={count > 0 ? {} : {color: 'red'}}>
              {ch.toUpperCase()}
            </span>
            <span style={{left: '-10px', top: '-10px', position: 'relative'}}>{ this.props.reqs.get(ch.toLowerCase(), 0) }</span>
          </div>
        );
      });
      return (
        <div className={"keyboard__row keyboard__row--"+ rowIndex}>
          { keys }
        </div>
      );
    });

    return (
      <div className="keyboard" onKeyDown={this._onKeyDown}>{chars}</div>
    );
  },
});

var QWERTY_SET = Set('qwertyuiopasdfghjklzxcvbnm'.split(''));

var Anagram = React.createClass({
  getInitialState() {
    return {
      reqs: this.parseText(plums),
      difference: this.parseText(plums),
      sourceMaterial: plums,
      destMaterial: '',
      setup: true,
      preset: null,
      forbidden: QWERTY_SET,
      locked: false
    };
  },

  parseText(text) {
    var characters = text.match(/\w/g) || [];
    var reqs = characters.reduce((reqs, ch) => {
      return reqs.update(ch.toLowerCase(), 0, inc);
    }, Map());
    return reqs;
  },

  changeSource(ev) {
    var text = ev.target.value;
    var reqs = this.parseText(text);
    this.setState({
      sourceMaterial: ev.target.value,
      reqs: reqs,
      difference: reqs
    });
  },

  changeDest(ev) {
    if (!isModified(ev)) {
      var text = ev.target.value;
      var newReqs = this.parseText(text);
      var isExhausted = newReqs.some((v, k) => {
        return this.state.reqs.get(k, 0) - v <= 0;
      });
      var difference = this.state.reqs.mergeWith(function(o, n) { return o - n; }, newReqs);
      if (!isExhausted) {
        this.setState({
          destMaterial: text,
          difference: difference
        });
      }
      else {
        this.goCrazyAndMakeFartNoise();
      }
    }
  },

  start() {
    console.log(this.state.reqs);
    this.setState({
      setup: false,
      forbidden: QWERTY_SET.subtract(Set(this.state.reqs.keys()))
    });
  },

  leaveParkingGarage() {
    this.setState({ locked: false });
    $(this.refs.editor.getDOMNode()).focus();
  },
  
  goCrazyAndMakeFartNoise() {
    this.setState({ locked: true });
    farts(this.leaveParkingGarage);
  },

  validateParking(ev) {
    if (!isModified(ev)) {
      if (this.state.locked || !this.state.allowed.contains(String.fromCharCode(ev.keyCode).toLowerCase())) {
        ev.preventDefault();
        this.goCrazyAndMakeFartNoise();
      }
    }
  },

  render() {
    return (
      <div className={this.state.locked ? 'shake shake-hard' : ''}>
        <p>
          {"Copy and paste a selection of text that you'd like to rearrange"}
        </p>
        <textarea
          disabled={!this.state.setup}
          style={this.state.setup ? {} : {backgroundColor: 'red'}}
          onChange={this.changeSource}
          value={this.state.sourceMaterial}
          rows="30"
          cols="50"/>
        <textarea
          disabled={this.state.setup}
          style={this.state.setup ? {backgroundColor: 'red'} : {}}
          ref="editor"
          onKeyDown={this.validateParking}
          onChange={this.changeDest}
          value={this.state.destMaterial}
          rows="30"
          cols="50" />
        <button onClick={this.start}>Start!</button>
        <KeyCounter reqs={this.state.difference} />
      </div>
    );
  }
});

exports.Lipogram = Lipogram;
exports.Anagram = Anagram;
