'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fadeMaker = require('fade-maker');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(ac, buffer) {
    _classCallCheck(this, _class);

    this.ac = ac;
    this.gain = 1;
    this.buffer = buffer;
    this.destination = this.ac.destination;
  }

  _createClass(_class, [{
    key: 'applyFade',
    value: function applyFade(type, start, duration) {
      var shape = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'logarithmic';

      if (type === _fadeMaker.FADEIN) {
        (0, _fadeMaker.createFadeIn)(this.fadeGain.gain, shape, start, duration);
      } else if (type === _fadeMaker.FADEOUT) {
        (0, _fadeMaker.createFadeOut)(this.fadeGain.gain, shape, start, duration);
      } else {
        throw new Error('Unsupported fade type');
      }
    }
  }, {
    key: 'applyFadeIn',
    value: function applyFadeIn(start, duration) {
      var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'logarithmic';

      this.applyFade(_fadeMaker.FADEIN, start, duration, shape);
    }
  }, {
    key: 'applyFadeOut',
    value: function applyFadeOut(start, duration) {
      var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'logarithmic';

      this.applyFade(_fadeMaker.FADEOUT, start, duration, shape);
    }
  }, {
    key: 'isPlaying',
    value: function isPlaying() {
      return this.source !== undefined;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.buffer.duration;
    }
  }, {
    key: 'setAudioContext',
    value: function setAudioContext(audioContext) {
      this.ac = audioContext;
      this.destination = this.ac.destination;
    }
  }, {
    key: 'setUpSource',
    value: function setUpSource() {
      var _this = this;

      this.source = this.ac.createBufferSource();
      this.source.buffer = this.buffer;

      var sourcePromise = new Promise(function (resolve) {
        // keep track of the buffer state.
        _this.source.onended = function () {
          _this.source.disconnect();
          _this.fadeGain.disconnect();
          _this.volumeGain.disconnect();
          _this.shouldPlayGain.disconnect();
          _this.masterGain.disconnect();

          _this.source = undefined;
          _this.fadeGain = undefined;
          _this.volumeGain = undefined;
          _this.shouldPlayGain = undefined;
          _this.masterGain = undefined;

          resolve();
        };
      });

      this.fadeGain = this.ac.createGain();
      // used for track volume slider
      this.volumeGain = this.ac.createGain();
      // used for solo/mute
      this.shouldPlayGain = this.ac.createGain();
      this.masterGain = this.ac.createGain();

      this.source.connect(this.fadeGain);
      this.fadeGain.connect(this.volumeGain);
      this.volumeGain.connect(this.shouldPlayGain);
      this.shouldPlayGain.connect(this.masterGain);
      this.masterGain.connect(this.destination);

      return sourcePromise;
    }
  }, {
    key: 'setVolumeGainLevel',
    value: function setVolumeGainLevel(level) {
      if (this.volumeGain) {
        this.volumeGain.gain.value = level;
      }
    }
  }, {
    key: 'setShouldPlay',
    value: function setShouldPlay(bool) {
      if (this.shouldPlayGain) {
        this.shouldPlayGain.gain.value = bool ? 1 : 0;
      }
    }
  }, {
    key: 'setMasterGainLevel',
    value: function setMasterGainLevel(level) {
      if (this.masterGain) {
        this.masterGain.gain.value = level;
      }
    }

    /*
      source.start is picky when passing the end time.
      If rounding error causes a number to make the source think
      it is playing slightly more samples than it has it won't play at all.
      Unfortunately it doesn't seem to work if you just give it a start time.
    */

  }, {
    key: 'play',
    value: function play(when, start, duration) {
      this.source.start(when, start, duration);
    }
  }, {
    key: 'stop',
    value: function stop() {
      var when = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (this.source) {
        this.source.stop(when);
      }
    }
  }]);

  return _class;
}();

exports.default = _class;