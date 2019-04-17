'use strict'

var RSVP = require('rsvp')
var path = require('path')
var webpack = require('webpack')
var CachingWriter = require('broccoli-caching-writer')

WebpackWriter.prototype = Object.create(CachingWriter.prototype)

WebpackWriter.prototype.constructor = WebpackWriter
function WebpackWriter (inputNodes, options) {
	options = options || {}
	CachingWriter.call(this, inputNodes, {
		annotation: options.annotation
	})
	this.options = options
}

WebpackWriter.prototype.build = function () {
	return RSVP.all(this.inputPaths.map(function (srcDir) {
		this.options.context = path.resolve(srcDir)
		this.options.output = this.options.output || {}
		this.options.output.path = this.outputPath
		var compiler = webpack(this.options)
		return new RSVP.Promise(function (resolve, reject) {
			compiler.run(function (err, stats) {
				var jsonStats = stats.toJson()
				if (jsonStats.errors.length > 0) jsonStats.errors.forEach(console.error)
				if (jsonStats.warnings.length > 0) jsonStats.warnings.forEach(console.warn)
				if (err || jsonStats.errors.length > 0) {
					reject(err)
				} else {
					resolve()
				}
			})
		})
	}.bind(this)))
}

module.exports = WebpackWriter
