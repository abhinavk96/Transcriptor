'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
* virtual-dom hook for scrolling to the text annotation.
*/
var Hook = function ScrollTopHook() {};
Hook.prototype.hook = function hook(node) {
  var el = node.querySelector('.current');
  if (el) {
    var box = node.getBoundingClientRect();
    var row = el.getBoundingClientRect();
    var diff = row.top - box.top;
    var list = node;
    list.scrollTop += diff;
  }
};

exports.default = Hook;