'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (aeneas) {
  var annotation = {
    id: aeneas.id || _uuid2.default.v4(),
    start: Number(aeneas.begin) || 0,
    end: Number(aeneas.end) || 0,
    lines: aeneas.lines || [''],
    lang: aeneas.language || 'en'
  };

  return annotation;
};

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }