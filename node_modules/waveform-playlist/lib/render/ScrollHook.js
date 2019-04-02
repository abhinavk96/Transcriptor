'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conversions = require('../utils/conversions');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
* virtual-dom hook for scrolling the track container.
*/
var _class = function () {
  function _class(playlist) {
    _classCallCheck(this, _class);

    this.playlist = playlist;
  }

  _createClass(_class, [{
    key: 'hook',
    value: function hook(node) {
      var playlist = this.playlist;
      if (!playlist.isScrolling) {
        var el = node;

        if (playlist.isAutomaticScroll) {
          var rect = node.getBoundingClientRect();
          var cursorRect = node.querySelector('.cursor').getBoundingClientRect();

          if (cursorRect.right > rect.right || cursorRect.right < 0) {
            playlist.scrollLeft = playlist.playbackSeconds;
          }
        }

        var left = (0, _conversions.secondsToPixels)(playlist.scrollLeft, playlist.samplesPerPixel, playlist.sampleRate);

        el.scrollLeft = left;
      }
    }
  }]);

  return _class;
}();

exports.default = _class;