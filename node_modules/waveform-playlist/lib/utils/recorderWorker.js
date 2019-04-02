'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  // http://jsperf.com/typed-array-min-max/2
  // plain for loop for finding min/max is way faster than anything else.
  /**
  * @param {TypedArray} array - Subarray of audio to calculate peaks from.
  */
  function findMinMax(array) {
    var min = Infinity;
    var max = -Infinity;
    var curr = void 0;

    for (var i = 0; i < array.length; i += 1) {
      curr = array[i];
      if (min > curr) {
        min = curr;
      }
      if (max < curr) {
        max = curr;
      }
    }

    return {
      min: min,
      max: max
    };
  }

  /**
  * @param {Number} n - peak to convert from float to Int8, Int16 etc.
  * @param {Number} bits - convert to #bits two's complement signed integer
  */
  function convert(n, bits) {
    var max = Math.pow(2, bits - 1);
    var v = n < 0 ? n * max : n * max - 1;
    return Math.max(-max, Math.min(max - 1, v));
  }

  /**
  * @param {TypedArray} channel - Audio track frames to calculate peaks from.
  * @param {Number} samplesPerPixel - Audio frames per peak
  */
  function extractPeaks(channel, samplesPerPixel, bits) {
    var chanLength = channel.length;
    var numPeaks = Math.ceil(chanLength / samplesPerPixel);
    var start = void 0;
    var end = void 0;
    var segment = void 0;
    var max = void 0;
    var min = void 0;
    var extrema = void 0;

    // create interleaved array of min,max
    var peaks = new self['Int' + bits + 'Array'](numPeaks * 2);

    for (var i = 0; i < numPeaks; i += 1) {
      start = i * samplesPerPixel;
      end = (i + 1) * samplesPerPixel > chanLength ? chanLength : (i + 1) * samplesPerPixel;

      segment = channel.subarray(start, end);
      extrema = findMinMax(segment);
      min = convert(extrema.min, bits);
      max = convert(extrema.max, bits);

      peaks[i * 2] = min;
      peaks[i * 2 + 1] = max;
    }

    return peaks;
  }

  /**
  * @param {TypedArray} source - Source of audio samples for peak calculations.
  * @param {Number} samplesPerPixel - Number of audio samples per peak.
  * @param {Number} cueIn - index in channel to start peak calculations from.
  * @param {Number} cueOut - index in channel to end peak calculations from (non-inclusive).
  */
  function audioPeaks(source) {
    var samplesPerPixel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000;
    var bits = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8;

    if ([8, 16, 32].indexOf(bits) < 0) {
      throw new Error('Invalid number of bits specified for peaks.');
    }

    var peaks = [];
    var start = 0;
    var end = source.length;
    peaks.push(extractPeaks(source.subarray(start, end), samplesPerPixel, bits));

    var length = peaks[0].length / 2;

    return {
      bits: bits,
      length: length,
      data: peaks
    };
  }

  onmessage = function onmessage(e) {
    var peaks = audioPeaks(e.data.samples, e.data.samplesPerPixel);

    postMessage(peaks);
  };
};