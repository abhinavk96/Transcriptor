'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CursorState = require('./states/CursorState');

var _CursorState2 = _interopRequireDefault(_CursorState);

var _SelectState = require('./states/SelectState');

var _SelectState2 = _interopRequireDefault(_SelectState);

var _ShiftState = require('./states/ShiftState');

var _ShiftState2 = _interopRequireDefault(_ShiftState);

var _FadeInState = require('./states/FadeInState');

var _FadeInState2 = _interopRequireDefault(_FadeInState);

var _FadeOutState = require('./states/FadeOutState');

var _FadeOutState2 = _interopRequireDefault(_FadeOutState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  cursor: _CursorState2.default,
  select: _SelectState2.default,
  shift: _ShiftState2.default,
  fadein: _FadeInState2.default,
  fadeout: _FadeOutState2.default
};