'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (format) {
  function clockFormat(seconds, decimals) {
    var hours = parseInt(seconds / 3600, 10) % 24;
    var minutes = parseInt(seconds / 60, 10) % 60;
    var secs = (seconds % 60).toFixed(decimals);

    var sHours = hours < 10 ? '0' + hours : hours;
    var sMinutes = minutes < 10 ? '0' + minutes : minutes;
    var sSeconds = secs < 10 ? '0' + secs : secs;

    return sHours + ':' + sMinutes + ':' + sSeconds;
  }

  var formats = {
    seconds: function seconds(_seconds) {
      return _seconds.toFixed(0);
    },
    thousandths: function thousandths(seconds) {
      return seconds.toFixed(3);
    },

    'hh:mm:ss': function hhmmss(seconds) {
      return clockFormat(seconds, 0);
    },
    'hh:mm:ss.u': function hhmmssu(seconds) {
      return clockFormat(seconds, 1);
    },
    'hh:mm:ss.uu': function hhmmssuu(seconds) {
      return clockFormat(seconds, 2);
    },
    'hh:mm:ss.uuu': function hhmmssuuu(seconds) {
      return clockFormat(seconds, 3);
    }
  };

  return formats[format];
};