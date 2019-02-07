'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

exports.default = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ee = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _eventEmitter2.default)();

  return init(options, ee);
};

var _lodash = require('lodash.assign');

var _lodash2 = _interopRequireDefault(_lodash);

var _createElement = require('virtual-dom/create-element');

var _createElement2 = _interopRequireDefault(_createElement);

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _Playlist = require('./Playlist');

var _Playlist2 = _interopRequireDefault(_Playlist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var ee = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _eventEmitter2.default)();

  if (options.container === undefined) {
    throw new Error('DOM element container must be given.');
  }

  window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var audioContext = new window.AudioContext();

  var defaults = {
    ac: audioContext,
    sampleRate: audioContext.sampleRate,
    samplesPerPixel: 4096,
    mono: true,
    fadeType: 'logarithmic',
    exclSolo: false,
    timescale: false,
    controls: {
      show: false,
      width: 150
    },
    colors: {
      waveOutlineColor: 'white',
      timeColor: 'grey',
      fadeColor: 'black'
    },
    seekStyle: 'line',
    waveHeight: 128,
    state: 'cursor',
    zoomLevels: [512, 1024, 2048, 4096],
    annotationList: {
      annotations: [],
      controls: [],
      editable: false,
      linkEndpoints: false,
      isContinuousPlay: false
    },
    isAutomaticScroll: false
  };

  var config = (0, _lodash2.default)(defaults, options);
  var zoomIndex = config.zoomLevels.indexOf(config.samplesPerPixel);

  if (zoomIndex === -1) {
    throw new Error('initial samplesPerPixel must be included in array zoomLevels');
  }

  var playlist = new _Playlist2.default();
  playlist.setSampleRate(config.sampleRate);
  playlist.setSamplesPerPixel(config.samplesPerPixel);
  playlist.setAudioContext(config.ac);
  playlist.setEventEmitter(ee);
  playlist.setUpEventEmitter();
  playlist.setTimeSelection(0, 0);
  playlist.setState(config.state);
  playlist.setControlOptions(config.controls);
  playlist.setWaveHeight(config.waveHeight);
  playlist.setColors(config.colors);
  playlist.setZoomLevels(config.zoomLevels);
  playlist.setZoomIndex(zoomIndex);
  playlist.setMono(config.mono);
  playlist.setExclSolo(config.exclSolo);
  playlist.setShowTimeScale(config.timescale);
  playlist.setSeekStyle(config.seekStyle);
  playlist.setAnnotations(config.annotationList);
  playlist.isAutomaticScroll = config.isAutomaticScroll;
  playlist.isContinuousPlay = config.isContinuousPlay;
  playlist.linkedEndpoints = config.linkedEndpoints;

  // take care of initial virtual dom rendering.
  var tree = playlist.render();
  var rootNode = (0, _createElement2.default)(tree);

  config.container.appendChild(rootNode);
  playlist.tree = tree;
  playlist.rootNode = rootNode;

  return playlist;
}