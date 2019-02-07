"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var t = _interopRequireWildcard(require("@babel/types"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const isRemovablePath = path => t.isArrowFunctionExpression(path) || t.isDecorator(path) || t.isExpressionStatement(path) || t.isExportSpecifier(path) || t.isExportNamedDeclaration(path) || t.isReturnStatement(path) || t.isVariableDeclarator(path);

var _default = isRemovablePath;
exports.default = _default;