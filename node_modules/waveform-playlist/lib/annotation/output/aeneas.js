"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (annotation) {
  return {
    begin: String(annotation.start.toFixed(3)),
    end: String(annotation.end.toFixed(3)),
    id: String(annotation.id),
    language: annotation.lang,
    lines: annotation.lines
  };
};