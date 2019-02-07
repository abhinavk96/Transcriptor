"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const getSpecifiersForRemoval = (members, specifiers) => _lodash.default.transform(specifiers, (result, specifier) => {
  if (_lodash.default.includes(members, '*')) {
    result.push(...specifiers);
    return false;
  }

  if (t.isImportDefaultSpecifier(specifier) && _lodash.default.includes(members, 'default')) {
    result.push(specifier);
  }

  if (_lodash.default.includes(members, _lodash.default.get(specifier, 'local.name'))) result.push(specifier);
});

var _default = getSpecifiersForRemoval;
exports.default = _default;