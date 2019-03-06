'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STATE_FINISHED = exports.STATE_DECODING = exports.STATE_LOADING = exports.STATE_UNINITIALIZED = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STATE_UNINITIALIZED = exports.STATE_UNINITIALIZED = 0;
var STATE_LOADING = exports.STATE_LOADING = 1;
var STATE_DECODING = exports.STATE_DECODING = 2;
var STATE_FINISHED = exports.STATE_FINISHED = 3;

var _class = function () {
  function _class(src, audioContext) {
    var ee = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _eventEmitter2.default)();

    _classCallCheck(this, _class);

    this.src = src;
    this.ac = audioContext;
    this.audioRequestState = STATE_UNINITIALIZED;
    this.ee = ee;
  }

  _createClass(_class, [{
    key: 'setStateChange',
    value: function setStateChange(state) {
      this.audioRequestState = state;
      this.ee.emit('audiorequeststatechange', this.audioRequestState, this.src);
    }
  }, {
    key: 'fileProgress',
    value: function fileProgress(e) {
      var percentComplete = 0;

      if (this.audioRequestState === STATE_UNINITIALIZED) {
        this.setStateChange(STATE_LOADING);
      }

      if (e.lengthComputable) {
        percentComplete = e.loaded / e.total * 100;
      }

      this.ee.emit('loadprogress', percentComplete, this.src);
    }
  }, {
    key: 'fileLoad',
    value: function fileLoad(e) {
      var _this = this;

      var audioData = e.target.response || e.target.result;

      this.setStateChange(STATE_DECODING);

      return new Promise(function (resolve, reject) {
        _this.ac.decodeAudioData(audioData, function (audioBuffer) {
          _this.audioBuffer = audioBuffer;
          _this.setStateChange(STATE_FINISHED);

          resolve(audioBuffer);
        }, function (err) {
          reject(err);
        });
      });
    }
  }]);

  return _class;
}();

exports.default = _class;