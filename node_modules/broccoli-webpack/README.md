# broccoli-webpack [![npm version](https://img.shields.io/npm/v/broccoli-webpack.svg?style=flat)](https://www.npmjs.org/package/broccoli-webpack) [![npm downloads](https://img.shields.io/npm/dm/broccoli-webpack.svg?style=flat)](https://www.npmjs.org/package/broccoli-webpack) [![Build Status](https://img.shields.io/travis/myfreeweb/broccoli-webpack.svg?style=flat)](https://travis-ci.org/myfreeweb/broccoli-webpack) [![Dependency Status](https://img.shields.io/gemnasium/myfreeweb/broccoli-webpack.svg?style=flat)](https://gemnasium.com/myfreeweb/broccoli-webpack) [![Unlicense](https://img.shields.io/badge/un-license-green.svg?style=flat)](http://unlicense.org)

A [Broccoli] plugin for [webpack].

[Broccoli]: https://github.com/joliss/broccoli
[webpack]: https://github.com/webpack/webpack

## Installation

```bash
$ npm install --save-dev broccoli-webpack
```

## Usage

```js
var WebpackWriter = require('broccoli-webpack')
var js_source = 'src'
var js_bundler = new WebpackWriter([js_source], {
	entry: './main',
	output: {filename: 'app.js'},
	externals: [{'react': 'React', 'jquery': '$'}],
	devtool: 'source-map',
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loader: "source-map-loader"
			}
		]
	}
})
```

Basically, just pass a tree and a normal [webpack config].
`context` and `output.path` will be set automatically.
For everything else, you're on your own :-)

[webpack config]: http://webpack.github.io/docs/configuration.html

## Contributing

Please feel free to submit pull requests!

By participating in this project you agree to follow the [Contributor Code of Conduct](http://contributor-covenant.org/version/1/4/).

## License

This is free and unencumbered software released into the public domain.  
For more information, please refer to the `UNLICENSE` file or [unlicense.org](http://unlicense.org).
