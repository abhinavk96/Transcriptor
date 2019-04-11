'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.defaults');

var _lodash2 = _interopRequireDefault(_lodash);

var _h = require('virtual-dom/h');

var _h2 = _interopRequireDefault(_h);

var _diff = require('virtual-dom/diff');

var _diff2 = _interopRequireDefault(_diff);

var _patch = require('virtual-dom/patch');

var _patch2 = _interopRequireDefault(_patch);

var _inlineWorker = require('inline-worker');

var _inlineWorker2 = _interopRequireDefault(_inlineWorker);

var _conversions = require('./utils/conversions');

var _LoaderFactory = require('./track/loader/LoaderFactory');

var _LoaderFactory2 = _interopRequireDefault(_LoaderFactory);

var _ScrollHook = require('./render/ScrollHook');

var _ScrollHook2 = _interopRequireDefault(_ScrollHook);

var _TimeScale = require('./TimeScale');

var _TimeScale2 = _interopRequireDefault(_TimeScale);

var _Track = require('./Track');

var _Track2 = _interopRequireDefault(_Track);

var _Playout = require('./Playout');

var _Playout2 = _interopRequireDefault(_Playout);

var _AnnotationList = require('./annotation/AnnotationList');

var _AnnotationList2 = _interopRequireDefault(_AnnotationList);

var _recorderWorker = require('./utils/recorderWorker');

var _recorderWorker2 = _interopRequireDefault(_recorderWorker);

var _exportWavWorker = require('./utils/exportWavWorker');

var _exportWavWorker2 = _interopRequireDefault(_exportWavWorker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this.tracks = [];
    this.soloedTracks = [];
    this.mutedTracks = [];
    this.playoutPromises = [];

    this.cursor = 0;
    this.playbackSeconds = 0;
    this.duration = 0;
    this.scrollLeft = 0;
    this.scrollTimer = undefined;
    this.showTimescale = false;
    // whether a user is scrolling the waveform
    this.isScrolling = false;

    this.fadeType = 'logarithmic';
    this.masterGain = 1;
    this.annotations = [];
    this.durationFormat = 'hh:mm:ss.uuu';
    this.isAutomaticScroll = false;
    this.resetDrawTimer = undefined;
  }

  // TODO extract into a plugin


  _createClass(_class, [{
    key: 'initExporter',
    value: function initExporter() {
      this.exportWorker = new _inlineWorker2.default(_exportWavWorker2.default);
    }

    // TODO extract into a plugin

  }, {
    key: 'initRecorder',
    value: function initRecorder(stream) {
      var _this = this;

      this.mediaRecorder = new window.MediaRecorder(stream);

      this.mediaRecorder.onstart = function () {
        var track = new _Track2.default();
        track.setName('Recording');
        track.setEnabledStates();
        track.setEventEmitter(_this.ee);

        _this.recordingTrack = track;
        _this.tracks.push(track);

        _this.chunks = [];
        _this.working = false;
      };

      this.mediaRecorder.ondataavailable = function (e) {
        _this.chunks.push(e.data);

        // throttle peaks calculation
        if (!_this.working) {
          var recording = new Blob(_this.chunks, { type: 'audio/ogg; codecs=opus' });
          var loader = _LoaderFactory2.default.createLoader(recording, _this.ac);
          loader.load().then(function (audioBuffer) {
            // ask web worker for peaks.
            _this.recorderWorker.postMessage({
              samples: audioBuffer.getChannelData(0),
              samplesPerPixel: _this.samplesPerPixel
            });
            _this.recordingTrack.setCues(0, audioBuffer.duration);
            _this.recordingTrack.setBuffer(audioBuffer);
            _this.recordingTrack.setPlayout(new _Playout2.default(_this.ac, audioBuffer));
            _this.adjustDuration();
          });
          _this.working = true;
        }
      };

      this.mediaRecorder.onstop = function () {
        _this.chunks = [];
        _this.working = false;
      };

      this.recorderWorker = new _inlineWorker2.default(_recorderWorker2.default);
      // use a worker for calculating recording peaks.
      this.recorderWorker.onmessage = function (e) {
        _this.recordingTrack.setPeaks(e.data);
        _this.working = false;
        _this.drawRequest();
      };
    }
  }, {
    key: 'setShowTimeScale',
    value: function setShowTimeScale(show) {
      this.showTimescale = show;
    }
  }, {
    key: 'setMono',
    value: function setMono(mono) {
      this.mono = mono;
    }
  }, {
    key: 'setExclSolo',
    value: function setExclSolo(exclSolo) {
      this.exclSolo = exclSolo;
    }
  }, {
    key: 'setSeekStyle',
    value: function setSeekStyle(style) {
      this.seekStyle = style;
    }
  }, {
    key: 'getSeekStyle',
    value: function getSeekStyle() {
      return this.seekStyle;
    }
  }, {
    key: 'setSampleRate',
    value: function setSampleRate(sampleRate) {
      this.sampleRate = sampleRate;
    }
  }, {
    key: 'setSamplesPerPixel',
    value: function setSamplesPerPixel(samplesPerPixel) {
      this.samplesPerPixel = samplesPerPixel;
    }
  }, {
    key: 'setAudioContext',
    value: function setAudioContext(ac) {
      this.ac = ac;
    }
  }, {
    key: 'setControlOptions',
    value: function setControlOptions(controlOptions) {
      this.controls = controlOptions;
    }
  }, {
    key: 'setWaveHeight',
    value: function setWaveHeight(height) {
      this.waveHeight = height;
    }
  }, {
    key: 'setColors',
    value: function setColors(colors) {
      this.colors = colors;
    }
  }, {
    key: 'setAnnotations',
    value: function setAnnotations(config) {
      this.annotationList = new _AnnotationList2.default(this, config.annotations, config.controls, config.editable, config.linkEndpoints, config.isContinuousPlay);
    }
  }, {
    key: 'setEventEmitter',
    value: function setEventEmitter(ee) {
      this.ee = ee;
    }
  }, {
    key: 'getEventEmitter',
    value: function getEventEmitter() {
      return this.ee;
    }
  }, {
    key: 'setUpEventEmitter',
    value: function setUpEventEmitter() {
      var _this2 = this;

      var ee = this.ee;

      ee.on('automaticscroll', function (val) {
        _this2.isAutomaticScroll = val;
      });

      ee.on('durationformat', function (format) {
        _this2.durationFormat = format;
        _this2.drawRequest();
      });

      ee.on('select', function (start, end, track) {
        if (_this2.isPlaying()) {
          _this2.lastSeeked = start;
          _this2.pausedAt = undefined;
          _this2.restartPlayFrom(start);
        } else {
          // reset if it was paused.
          _this2.seek(start, end, track);
          _this2.ee.emit('timeupdate', start);
          _this2.drawRequest();
        }
      });

      ee.on('startaudiorendering', function (type) {
        _this2.startOfflineRender(type);
      });

      ee.on('statechange', function (state) {
        _this2.setState(state);
        _this2.drawRequest();
      });

      ee.on('shift', function (deltaTime, track) {
        track.setStartTime(track.getStartTime() + deltaTime);
        _this2.adjustDuration();
        _this2.drawRequest();
      });

      ee.on('record', function () {
        _this2.record();
      });

      ee.on('play', function (start, end) {
        _this2.play(start, end);
      });

      ee.on('pause', function () {
        _this2.pause();
      });

      ee.on('stop', function () {
        _this2.stop();
      });

      ee.on('rewind', function () {
        _this2.rewind();
      });

      ee.on('fastforward', function () {
        _this2.fastForward();
      });

      ee.on('clear', function () {
        _this2.clear().then(function () {
          _this2.drawRequest();
        });
      });

      ee.on('solo', function (track) {
        _this2.soloTrack(track);
        _this2.adjustTrackPlayout();
        _this2.drawRequest();
      });

      ee.on('mute', function (track) {
        _this2.muteTrack(track);
        _this2.adjustTrackPlayout();
        _this2.drawRequest();
      });

      ee.on('volumechange', function (volume, track) {
        track.setGainLevel(volume / 100);
      });

      ee.on('mastervolumechange', function (volume) {
        _this2.masterGain = volume / 100;
        _this2.tracks.forEach(function (track) {
          track.setMasterGainLevel(_this2.masterGain);
        });
      });

      ee.on('fadein', function (duration, track) {
        track.setFadeIn(duration, _this2.fadeType);
        _this2.drawRequest();
      });

      ee.on('fadeout', function (duration, track) {
        track.setFadeOut(duration, _this2.fadeType);
        _this2.drawRequest();
      });

      ee.on('fadetype', function (type) {
        _this2.fadeType = type;
      });

      ee.on('newtrack', function (file) {
        _this2.load([{
          src: file,
          name: file.name
        }]);
      });

      ee.on('trim', function () {
        var track = _this2.getActiveTrack();
        var timeSelection = _this2.getTimeSelection();

        track.trim(timeSelection.start, timeSelection.end);
        track.calculatePeaks(_this2.samplesPerPixel, _this2.sampleRate);

        _this2.setTimeSelection(0, 0);
        _this2.drawRequest();
      });

      ee.on('zoomin', function () {
        var zoomIndex = Math.max(0, _this2.zoomIndex - 1);
        var zoom = _this2.zoomLevels[zoomIndex];

        if (zoom !== _this2.samplesPerPixel) {
          _this2.setZoom(zoom);
          _this2.drawRequest();
        }
      });

      ee.on('zoomout', function () {
        var zoomIndex = Math.min(_this2.zoomLevels.length - 1, _this2.zoomIndex + 1);
        var zoom = _this2.zoomLevels[zoomIndex];

        if (zoom !== _this2.samplesPerPixel) {
          _this2.setZoom(zoom);
          _this2.drawRequest();
        }
      });

      ee.on('scroll', function () {
        _this2.isScrolling = true;
        _this2.drawRequest();
        clearTimeout(_this2.scrollTimer);
        _this2.scrollTimer = setTimeout(function () {
          _this2.isScrolling = false;
        }, 200);
      });
    }
  }, {
    key: 'load',
    value: function load(trackList) {
      var _this3 = this;

      var loadPromises = trackList.map(function (trackInfo) {
        var loader = _LoaderFactory2.default.createLoader(trackInfo.src, _this3.ac, _this3.ee);
        return loader.load();
      });

      return Promise.all(loadPromises).then(function (audioBuffers) {
        _this3.ee.emit('audiosourcesloaded');

        var tracks = audioBuffers.map(function (audioBuffer, index) {
          var info = trackList[index];
          var name = info.name || 'Untitled';
          var start = info.start || 0;
          var states = info.states || {};
          var fadeIn = info.fadeIn;
          var fadeOut = info.fadeOut;
          var cueIn = info.cuein || 0;
          var cueOut = info.cueout || audioBuffer.duration;
          var gain = info.gain || 1;
          var muted = info.muted || false;
          var soloed = info.soloed || false;
          var selection = info.selected;
          var peaks = info.peaks || { type: 'WebAudio', mono: _this3.mono };
          var customClass = info.customClass || undefined;
          var waveOutlineColor = info.waveOutlineColor || undefined;

          // webaudio specific playout for now.
          var playout = new _Playout2.default(_this3.ac, audioBuffer);

          var track = new _Track2.default();
          track.src = info.src;
          track.setBuffer(audioBuffer);
          track.setName(name);
          track.setEventEmitter(_this3.ee);
          track.setEnabledStates(states);
          track.setCues(cueIn, cueOut);
          track.setCustomClass(customClass);
          track.setWaveOutlineColor(waveOutlineColor);

          if (fadeIn !== undefined) {
            track.setFadeIn(fadeIn.duration, fadeIn.shape);
          }

          if (fadeOut !== undefined) {
            track.setFadeOut(fadeOut.duration, fadeOut.shape);
          }

          if (selection !== undefined) {
            _this3.setActiveTrack(track);
            _this3.setTimeSelection(selection.start, selection.end);
          }

          if (peaks !== undefined) {
            track.setPeakData(peaks);
          }

          track.setState(_this3.getState());
          track.setStartTime(start);
          track.setPlayout(playout);

          track.setGainLevel(gain);

          if (muted) {
            _this3.muteTrack(track);
          }

          if (soloed) {
            _this3.soloTrack(track);
          }

          // extract peaks with AudioContext for now.
          track.calculatePeaks(_this3.samplesPerPixel, _this3.sampleRate);

          return track;
        });

        _this3.tracks = _this3.tracks.concat(tracks);
        _this3.adjustDuration();
        _this3.draw(_this3.render());

        _this3.ee.emit('audiosourcesrendered');
      });
    }

    /*
      track instance of Track.
    */

  }, {
    key: 'setActiveTrack',
    value: function setActiveTrack(track) {
      this.activeTrack = track;
    }
  }, {
    key: 'getActiveTrack',
    value: function getActiveTrack() {
      return this.activeTrack;
    }
  }, {
    key: 'isSegmentSelection',
    value: function isSegmentSelection() {
      return this.timeSelection.start !== this.timeSelection.end;
    }

    /*
      start, end in seconds.
    */

  }, {
    key: 'setTimeSelection',
    value: function setTimeSelection() {
      var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var end = arguments[1];

      this.timeSelection = {
        start: start,
        end: end === undefined ? start : end
      };

      this.cursor = start;
    }
  }, {
    key: 'startOfflineRender',
    value: function startOfflineRender(type) {
      var _this4 = this;

      if (this.isRendering) {
        return;
      }

      this.isRendering = true;
      this.offlineAudioContext = new OfflineAudioContext(2, 44100 * this.duration, 44100);

      var currentTime = this.offlineAudioContext.currentTime;

      this.tracks.forEach(function (track) {
        track.setOfflinePlayout(new _Playout2.default(_this4.offlineAudioContext, track.buffer));
        track.schedulePlay(currentTime, 0, 0, {
          shouldPlay: _this4.shouldTrackPlay(track),
          masterGain: 1,
          isOffline: true
        });
      });

      /*
        TODO cleanup of different audio playouts handling.
      */
      this.offlineAudioContext.startRendering().then(function (audioBuffer) {
        if (type === 'buffer') {
          _this4.ee.emit('audiorenderingfinished', type, audioBuffer);
          _this4.isRendering = false;
          return;
        }

        if (type === 'wav') {
          _this4.exportWorker.postMessage({
            command: 'init',
            config: {
              sampleRate: 44100
            }
          });

          // callback for `exportWAV`
          _this4.exportWorker.onmessage = function (e) {
            _this4.ee.emit('audiorenderingfinished', type, e.data);
            _this4.isRendering = false;

            // clear out the buffer for next renderings.
            _this4.exportWorker.postMessage({
              command: 'clear'
            });
          };

          // send the channel data from our buffer to the worker
          _this4.exportWorker.postMessage({
            command: 'record',
            buffer: [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]
          });

          // ask the worker for a WAV
          _this4.exportWorker.postMessage({
            command: 'exportWAV',
            type: 'audio/wav'
          });
        }
      }).catch(function (e) {
        throw e;
      });
    }
  }, {
    key: 'getTimeSelection',
    value: function getTimeSelection() {
      return this.timeSelection;
    }
  }, {
    key: 'setState',
    value: function setState(state) {
      this.state = state;

      this.tracks.forEach(function (track) {
        track.setState(state);
      });
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this.state;
    }
  }, {
    key: 'setZoomIndex',
    value: function setZoomIndex(index) {
      this.zoomIndex = index;
    }
  }, {
    key: 'setZoomLevels',
    value: function setZoomLevels(levels) {
      this.zoomLevels = levels;
    }
  }, {
    key: 'setZoom',
    value: function setZoom(zoom) {
      var _this5 = this;

      this.samplesPerPixel = zoom;
      this.zoomIndex = this.zoomLevels.indexOf(zoom);
      this.tracks.forEach(function (track) {
        track.calculatePeaks(zoom, _this5.sampleRate);
      });
    }
  }, {
    key: 'muteTrack',
    value: function muteTrack(track) {
      var index = this.mutedTracks.indexOf(track);

      if (index > -1) {
        this.mutedTracks.splice(index, 1);
      } else {
        this.mutedTracks.push(track);
      }
    }
  }, {
    key: 'soloTrack',
    value: function soloTrack(track) {
      var index = this.soloedTracks.indexOf(track);

      if (index > -1) {
        this.soloedTracks.splice(index, 1);
      } else if (this.exclSolo) {
        this.soloedTracks = [track];
      } else {
        this.soloedTracks.push(track);
      }
    }
  }, {
    key: 'adjustTrackPlayout',
    value: function adjustTrackPlayout() {
      var _this6 = this;

      this.tracks.forEach(function (track) {
        track.setShouldPlay(_this6.shouldTrackPlay(track));
      });
    }
  }, {
    key: 'adjustDuration',
    value: function adjustDuration() {
      this.duration = this.tracks.reduce(function (duration, track) {
        return Math.max(duration, track.getEndTime());
      }, 0);
    }
  }, {
    key: 'shouldTrackPlay',
    value: function shouldTrackPlay(track) {
      var shouldPlay = void 0;
      // if there are solo tracks, only they should play.
      if (this.soloedTracks.length > 0) {
        shouldPlay = false;
        if (this.soloedTracks.indexOf(track) > -1) {
          shouldPlay = true;
        }
      } else {
        // play all tracks except any muted tracks.
        shouldPlay = true;
        if (this.mutedTracks.indexOf(track) > -1) {
          shouldPlay = false;
        }
      }

      return shouldPlay;
    }
  }, {
    key: 'isPlaying',
    value: function isPlaying() {
      return this.tracks.reduce(function (isPlaying, track) {
        return isPlaying || track.isPlaying();
      }, false);
    }

    /*
    *   returns the current point of time in the playlist in seconds.
    */

  }, {
    key: 'getCurrentTime',
    value: function getCurrentTime() {
      var cursorPos = this.lastSeeked || this.pausedAt || this.cursor;

      return cursorPos + this.getElapsedTime();
    }
  }, {
    key: 'getElapsedTime',
    value: function getElapsedTime() {
      return this.ac.currentTime - this.lastPlay;
    }
  }, {
    key: 'setMasterGain',
    value: function setMasterGain(gain) {
      this.ee.emit('mastervolumechange', gain);
    }
  }, {
    key: 'restartPlayFrom',
    value: function restartPlayFrom(start, end) {
      this.stopAnimation();

      this.tracks.forEach(function (editor) {
        editor.scheduleStop();
      });

      return Promise.all(this.playoutPromises).then(this.play.bind(this, start, end));
    }
  }, {
    key: 'play',
    value: function play(startTime, endTime) {
      var _this7 = this;

      clearTimeout(this.resetDrawTimer);

      var currentTime = this.ac.currentTime;
      var selected = this.getTimeSelection();
      var playoutPromises = [];

      var start = startTime || this.pausedAt || this.cursor;
      var end = endTime;

      if (!end && selected.end !== selected.start && selected.end > start) {
        end = selected.end;
      }

      if (this.isPlaying()) {
        return this.restartPlayFrom(start, end);
      }

      this.tracks.forEach(function (track) {
        track.setState('cursor');
        playoutPromises.push(track.schedulePlay(currentTime, start, end, {
          shouldPlay: _this7.shouldTrackPlay(track),
          masterGain: _this7.masterGain
        }));
      });

      this.lastPlay = currentTime;
      // use these to track when the playlist has fully stopped.
      this.playoutPromises = playoutPromises;
      this.startAnimation(start);

      return Promise.all(this.playoutPromises);
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (!this.isPlaying()) {
        return Promise.all(this.playoutPromises);
      }

      this.pausedAt = this.getCurrentTime();
      return this.playbackReset();
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }

      this.pausedAt = undefined;
      this.playbackSeconds = 0;
      return this.playbackReset();
    }
  }, {
    key: 'playbackReset',
    value: function playbackReset() {
      var _this8 = this;

      this.lastSeeked = undefined;
      this.stopAnimation();

      this.tracks.forEach(function (track) {
        track.scheduleStop();
        track.setState(_this8.getState());
      });

      this.drawRequest();
      return Promise.all(this.playoutPromises);
    }
  }, {
    key: 'rewind',
    value: function rewind() {
      var _this9 = this;

      return this.stop().then(function () {
        _this9.scrollLeft = 0;
        _this9.ee.emit('select', 0, 0);
      });
    }
  }, {
    key: 'fastForward',
    value: function fastForward() {
      var _this10 = this;

      return this.stop().then(function () {
        if (_this10.viewDuration < _this10.duration) {
          _this10.scrollLeft = _this10.duration - _this10.viewDuration;
        } else {
          _this10.scrollLeft = 0;
        }

        _this10.ee.emit('select', _this10.duration, _this10.duration);
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this11 = this;

      return this.stop().then(function () {
        _this11.tracks = [];
        _this11.soloedTracks = [];
        _this11.mutedTracks = [];
        _this11.playoutPromises = [];

        _this11.cursor = 0;
        _this11.playbackSeconds = 0;
        _this11.duration = 0;
        _this11.scrollLeft = 0;

        _this11.seek(0, 0, undefined);
      });
    }
  }, {
    key: 'record',
    value: function record() {
      var _this12 = this;

      var playoutPromises = [];
      this.mediaRecorder.start(300);

      this.tracks.forEach(function (track) {
        track.setState('none');
        playoutPromises.push(track.schedulePlay(_this12.ac.currentTime, 0, undefined, {
          shouldPlay: _this12.shouldTrackPlay(track)
        }));
      });

      this.playoutPromises = playoutPromises;
    }
  }, {
    key: 'startAnimation',
    value: function startAnimation(startTime) {
      var _this13 = this;

      this.lastDraw = this.ac.currentTime;
      this.animationRequest = window.requestAnimationFrame(function () {
        _this13.updateEditor(startTime);
      });
    }
  }, {
    key: 'stopAnimation',
    value: function stopAnimation() {
      window.cancelAnimationFrame(this.animationRequest);
      this.lastDraw = undefined;
    }
  }, {
    key: 'seek',
    value: function seek(start, end, track) {
      if (this.isPlaying()) {
        this.lastSeeked = start;
        this.pausedAt = undefined;
        this.restartPlayFrom(start);
      } else {
        // reset if it was paused.
        this.setActiveTrack(track || this.tracks[0]);
        this.pausedAt = start;
        this.setTimeSelection(start, end);
        if (this.getSeekStyle() === 'fill') {
          this.playbackSeconds = start;
        }
      }
    }

    /*
    * Animation function for the playlist.
    * Keep under 16.7 milliseconds based on a typical screen refresh rate of 60fps.
    */

  }, {
    key: 'updateEditor',
    value: function updateEditor(cursor) {
      var _this14 = this;

      var currentTime = this.ac.currentTime;
      var selection = this.getTimeSelection();
      var cursorPos = cursor || this.cursor;
      var elapsed = currentTime - this.lastDraw;

      if (this.isPlaying()) {
        var playbackSeconds = cursorPos + elapsed;
        this.ee.emit('timeupdate', playbackSeconds);
        this.animationRequest = window.requestAnimationFrame(function () {
          _this14.updateEditor(playbackSeconds);
        });

        this.playbackSeconds = playbackSeconds;
        this.draw(this.render());
        this.lastDraw = currentTime;
      } else {
        if (cursorPos + elapsed >= (this.isSegmentSelection() ? selection.end : this.duration)) {
          this.ee.emit('finished');
        }

        this.stopAnimation();

        this.resetDrawTimer = setTimeout(function () {
          _this14.pausedAt = undefined;
          _this14.lastSeeked = undefined;
          _this14.setState(_this14.getState());

          _this14.playbackSeconds = 0;
          _this14.draw(_this14.render());
        }, 0);
      }
    }
  }, {
    key: 'drawRequest',
    value: function drawRequest() {
      var _this15 = this;

      window.requestAnimationFrame(function () {
        _this15.draw(_this15.render());
      });
    }
  }, {
    key: 'draw',
    value: function draw(newTree) {
      var patches = (0, _diff2.default)(this.tree, newTree);
      this.rootNode = (0, _patch2.default)(this.rootNode, patches);
      this.tree = newTree;

      // use for fast forwarding.
      this.viewDuration = (0, _conversions.pixelsToSeconds)(this.rootNode.clientWidth - this.controls.width, this.samplesPerPixel, this.sampleRate);
    }
  }, {
    key: 'getTrackRenderData',
    value: function getTrackRenderData() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var defaults = {
        height: this.waveHeight,
        resolution: this.samplesPerPixel,
        sampleRate: this.sampleRate,
        controls: this.controls,
        isActive: false,
        timeSelection: this.getTimeSelection(),
        playlistLength: this.duration,
        playbackSeconds: this.playbackSeconds,
        colors: this.colors
      };

      return (0, _lodash2.default)(data, defaults);
    }
  }, {
    key: 'isActiveTrack',
    value: function isActiveTrack(track) {
      var activeTrack = this.getActiveTrack();

      if (this.isSegmentSelection()) {
        return activeTrack === track;
      }

      return true;
    }
  }, {
    key: 'renderAnnotations',
    value: function renderAnnotations() {
      return this.annotationList.render();
    }
  }, {
    key: 'renderTimeScale',
    value: function renderTimeScale() {
      var controlWidth = this.controls.show ? this.controls.width : 0;
      var timeScale = new _TimeScale2.default(this.duration, this.scrollLeft, this.samplesPerPixel, this.sampleRate, controlWidth);

      return timeScale.render();
    }
  }, {
    key: 'renderTrackSection',
    value: function renderTrackSection() {
      var _this16 = this;

      var trackElements = this.tracks.map(function (track) {
        return track.render(_this16.getTrackRenderData({
          isActive: _this16.isActiveTrack(track),
          shouldPlay: _this16.shouldTrackPlay(track),
          soloed: _this16.soloedTracks.indexOf(track) > -1,
          muted: _this16.mutedTracks.indexOf(track) > -1
        }));
      });

      return (0, _h2.default)('div.playlist-tracks', {
        attributes: {
          style: 'overflow: auto;'
        },
        onscroll: function onscroll(e) {
          _this16.scrollLeft = (0, _conversions.pixelsToSeconds)(e.target.scrollLeft, _this16.samplesPerPixel, _this16.sampleRate);

          _this16.ee.emit('scroll', _this16.scrollLeft);
        },
        hook: new _ScrollHook2.default(this)
      }, trackElements);
    }
  }, {
    key: 'render',
    value: function render() {
      var containerChildren = [];

      if (this.showTimescale) {
        containerChildren.push(this.renderTimeScale());
      }

      containerChildren.push(this.renderTrackSection());

      if (this.annotationList.length) {
        containerChildren.push(this.renderAnnotations());
      }

      return (0, _h2.default)('div.playlist', {
        attributes: {
          style: 'overflow: hidden; position: relative;'
        }
      }, containerChildren);
    }
  }, {
    key: 'getInfo',
    value: function getInfo() {
      var info = [];

      this.tracks.forEach(function (track) {
        info.push(track.getTrackDetails());
      });

      return info;
    }
  }]);

  return _class;
}();

exports.default = _class;