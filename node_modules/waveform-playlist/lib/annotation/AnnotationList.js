'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _h = require('virtual-dom/h');

var _h2 = _interopRequireDefault(_h);

var _aeneas = require('./input/aeneas');

var _aeneas2 = _interopRequireDefault(_aeneas);

var _aeneas3 = require('./output/aeneas');

var _aeneas4 = _interopRequireDefault(_aeneas3);

var _conversions = require('../utils/conversions');

var _DragInteraction = require('../interaction/DragInteraction');

var _DragInteraction2 = _interopRequireDefault(_DragInteraction);

var _ScrollTopHook = require('./render/ScrollTopHook');

var _ScrollTopHook2 = _interopRequireDefault(_ScrollTopHook);

var _timeformat = require('../utils/timeformat');

var _timeformat2 = _interopRequireDefault(_timeformat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnnotationList = function () {
  function AnnotationList(playlist, annotations) {
    var controls = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var editable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var linkEndpoints = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var isContinuousPlay = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    _classCallCheck(this, AnnotationList);

    this.playlist = playlist;
    this.resizeHandlers = [];
    this.editable = editable;
    this.annotations = annotations.map(function (a) {
      return (
        // TODO support different formats later on.
        (0, _aeneas2.default)(a)
      );
    });
    this.setupInteractions();

    this.controls = controls;
    this.setupEE(playlist.ee);

    // TODO actually make a real plugin system that's not terrible.
    this.playlist.isContinuousPlay = isContinuousPlay;
    this.playlist.linkEndpoints = linkEndpoints;
    this.length = this.annotations.length;
  }

  _createClass(AnnotationList, [{
    key: 'setupInteractions',
    value: function setupInteractions() {
      var _this = this;

      this.annotations.forEach(function (a, i) {
        var leftShift = new _DragInteraction2.default(_this.playlist, {
          direction: 'left',
          index: i
        });
        var rightShift = new _DragInteraction2.default(_this.playlist, {
          direction: 'right',
          index: i
        });

        _this.resizeHandlers.push(leftShift);
        _this.resizeHandlers.push(rightShift);
      });
    }
  }, {
    key: 'setupEE',
    value: function setupEE(ee) {
      var _this2 = this;

      ee.on('dragged', function (deltaTime, data) {
        var annotationIndex = data.index;
        var annotations = _this2.annotations;
        var note = annotations[annotationIndex];

        // resizing to the left
        if (data.direction === 'left') {
          var originalVal = note.start;
          note.start += deltaTime;

          if (note.start < 0) {
            note.start = 0;
          }

          if (annotationIndex && annotations[annotationIndex - 1].end > note.start) {
            annotations[annotationIndex - 1].end = note.start;
          }

          if (_this2.playlist.linkEndpoints && annotationIndex && annotations[annotationIndex - 1].end === originalVal) {
            annotations[annotationIndex - 1].end = note.start;
          }
        } else {
          // resizing to the right
          var _originalVal = note.end;
          note.end += deltaTime;

          if (note.end > _this2.playlist.duration) {
            note.end = _this2.playlist.duration;
          }

          if (annotationIndex < annotations.length - 1 && annotations[annotationIndex + 1].start < note.end) {
            annotations[annotationIndex + 1].start = note.end;
          }

          if (_this2.playlist.linkEndpoints && annotationIndex < annotations.length - 1 && annotations[annotationIndex + 1].start === _originalVal) {
            annotations[annotationIndex + 1].start = note.end;
          }
        }

        _this2.playlist.drawRequest();
      });

      ee.on('continuousplay', function (val) {
        _this2.playlist.isContinuousPlay = val;
      });

      ee.on('linkendpoints', function (val) {
        _this2.playlist.linkEndpoints = val;
      });

      ee.on('annotationsrequest', function () {
        _this2.export();
      });

      return ee;
    }
  }, {
    key: 'export',
    value: function _export() {
      var output = this.annotations.map(function (a) {
        return (0, _aeneas4.default)(a);
      });
      var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(output));
      var a = document.createElement('a');

      document.body.appendChild(a);
      a.href = dataStr;
      a.download = 'annotations.json';
      a.click();
      document.body.removeChild(a);
    }
  }, {
    key: 'renderResizeLeft',
    value: function renderResizeLeft(i) {
      var events = _DragInteraction2.default.getEvents();
      var config = { attributes: {
          style: 'position: absolute; height: 30px; width: 10px; top: 0; left: -2px',
          draggable: true
        } };
      var handler = this.resizeHandlers[i * 2];

      events.forEach(function (event) {
        config['on' + event] = handler[event].bind(handler);
      });

      return (0, _h2.default)('div.resize-handle.resize-w', config);
    }
  }, {
    key: 'renderResizeRight',
    value: function renderResizeRight(i) {
      var events = _DragInteraction2.default.getEvents();
      var config = { attributes: {
          style: 'position: absolute; height: 30px; width: 10px; top: 0; right: -2px',
          draggable: true
        } };
      var handler = this.resizeHandlers[i * 2 + 1];

      events.forEach(function (event) {
        config['on' + event] = handler[event].bind(handler);
      });

      return (0, _h2.default)('div.resize-handle.resize-e', config);
    }
  }, {
    key: 'renderControls',
    value: function renderControls(note, i) {
      var _this3 = this;

      // seems to be a bug with references, or I'm missing something.
      var that = this;
      return this.controls.map(function (ctrl) {
        return (0, _h2.default)('i.' + ctrl.class, {
          attributes: {
            title: ctrl.title
          },
          onclick: function onclick() {
            ctrl.action(note, i, that.annotations, {
              linkEndpoints: that.playlist.linkEndpoints
            });
            _this3.setupInteractions();
            that.playlist.drawRequest();
          }
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var boxes = (0, _h2.default)('div.annotations-boxes', {
        attributes: {
          style: 'height: 30px;'
        }
      }, this.annotations.map(function (note, i) {
        var samplesPerPixel = _this4.playlist.samplesPerPixel;
        var sampleRate = _this4.playlist.sampleRate;
        var pixPerSec = sampleRate / samplesPerPixel;
        var pixOffset = (0, _conversions.secondsToPixels)(_this4.playlist.scrollLeft, samplesPerPixel, sampleRate);
        var left = Math.floor(note.start * pixPerSec - pixOffset);
        var width = Math.ceil(note.end * pixPerSec - note.start * pixPerSec);

        return (0, _h2.default)('div.annotation-box', {
          attributes: {
            style: 'position: absolute; height: 30px; width: ' + width + 'px; left: ' + left + 'px',
            'data-id': note.id
          }
        }, [_this4.renderResizeLeft(i), (0, _h2.default)('span.id', {
          onclick: function onclick() {
            if (_this4.playlist.isContinuousPlay) {
              _this4.playlist.ee.emit('play', _this4.annotations[i].start);
            } else {
              _this4.playlist.ee.emit('play', _this4.annotations[i].start, _this4.annotations[i].end);
            }
          }
        }, [note.id]), _this4.renderResizeRight(i)]);
      }));

      var boxesWrapper = (0, _h2.default)('div.annotations-boxes-wrapper', {
        attributes: {
          style: 'overflow: hidden;'
        }
      }, [boxes]);

      var text = (0, _h2.default)('div.annotations-text', {
        hook: new _ScrollTopHook2.default()
      }, this.annotations.map(function (note, i) {
        var format = (0, _timeformat2.default)(_this4.playlist.durationFormat);
        var start = format(note.start);
        var end = format(note.end);

        var segmentClass = '';
        if (_this4.playlist.isPlaying() && _this4.playlist.playbackSeconds >= note.start && _this4.playlist.playbackSeconds <= note.end) {
          segmentClass = '.current';
        }

        var editableConfig = {
          attributes: {
            contenteditable: true
          },
          oninput: function oninput(e) {
            // needed currently for references
            // eslint-disable-next-line no-param-reassign
            note.lines = [e.target.innerText];
          },
          onkeypress: function onkeypress(e) {
            if (e.which === 13 || e.keyCode === 13) {
              e.target.blur();
              e.preventDefault();
            }
          }
        };

        var linesConfig = _this4.editable ? editableConfig : {};

        return (0, _h2.default)('div.annotation' + segmentClass, [(0, _h2.default)('span.annotation-id', [note.id]), (0, _h2.default)('span.annotation-start', [start]), (0, _h2.default)('span.annotation-end', [end]), (0, _h2.default)('span.annotation-lines', linesConfig, [note.lines]), (0, _h2.default)('span.annotation-actions', _this4.renderControls(note, i))]);
      }));

      return (0, _h2.default)('div.annotations', [boxesWrapper, text]);
    }
  }]);

  return AnnotationList;
}();

exports.default = AnnotationList;