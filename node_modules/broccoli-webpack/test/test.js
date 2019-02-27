'use strict'

var test = require('tape')
var fs = require('fs')
var path = require('path')
var broccoli = require('broccoli')
var WebpackWriter = require('../')

test('broccoli-webpack', function (t) {
	t.plan(1)
	var builder = new broccoli.Builder(new WebpackWriter(['test/tree'], {
		entry: './one',
		output: {filename: 'bundle.js'}
	}))
	builder.build().then(function (_) {
		t.ok(fs.existsSync(path.join(builder.outputPath, 'bundle.js')), 'bundling works')
	}).catch(t.end).finally(function (_) {
		builder.cleanup()
	})
})
