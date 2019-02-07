"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.samplesToSeconds = samplesToSeconds;
exports.secondsToSamples = secondsToSamples;
exports.samplesToPixels = samplesToPixels;
exports.pixelsToSamples = pixelsToSamples;
exports.pixelsToSeconds = pixelsToSeconds;
exports.secondsToPixels = secondsToPixels;
function samplesToSeconds(samples, sampleRate) {
  return samples / sampleRate;
}

function secondsToSamples(seconds, sampleRate) {
  return Math.ceil(seconds * sampleRate);
}

function samplesToPixels(samples, resolution) {
  return Math.floor(samples / resolution);
}

function pixelsToSamples(pixels, resolution) {
  return Math.floor(pixels * resolution);
}

function pixelsToSeconds(pixels, resolution, sampleRate) {
  return pixels * resolution / sampleRate;
}

function secondsToPixels(seconds, resolution, sampleRate) {
  return Math.ceil(seconds * sampleRate / resolution);
}