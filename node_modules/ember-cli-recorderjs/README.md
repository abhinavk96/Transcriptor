[![Ember Observer Score](http://emberobserver.com/badges/ember-cli-recorderjs.svg)](http://emberobserver.com/addons/ember-cli-recorderjs)
[![Build Status](https://travis-ci.org/devotox/ember-cli-recorderjs.svg)](http://travis-ci.org/devotox/ember-cli-recorderjs)
[![Coverage Status](https://codecov.io/gh/devotox/ember-cli-recorderjs/branch/master/graph/badge.svg)](https://codecov.io/gh/devotox/ember-cli-recorderjs)
[![NPM Version](https://badge.fury.io/js/ember-cli-recorderjs.svg)](http://badge.fury.io/js/ember-cli-recorderjs)
[![NPM Downloads](https://img.shields.io/npm/dm/ember-cli-recorderjs.svg)](https://www.npmjs.org/package/ember-cli-recorderjs)
[![Dependency Status](https://david-dm.org/poetic/ember-cli-recorderjs.svg)](https://david-dm.org/poetic/ember-cli-recorderjs)
[![DevDependency Status](https://david-dm.org/poetic/ember-cli-recorderjs/dev-status.svg)](https://david-dm.org/poetic/ember-cli-recorderjs#info=devDependencies)
[![Greenkeeper](https://badges.greenkeeper.io/devotox/ember-cli-recorderjs.svg)](https://greenkeeper.io/)

ember-cli-recorderjs
==============================================================================

Simple Wrapper around [Recorder JS](https://github.com/mattdiamond/Recorderjs).

This provides a service that can be used to record, play, and export audio as a wav file, blob, or bas64 string.

[DEMO](http://devotox.github.io/ember-cli-recorderjs)

Installation
------------------------------------------------------------------------------

```
ember install ember-cli-recorderjs
```


Usage
------------------------------------------------------------------------------

* After running `recorder.start()<Promise>` you can then run `recorder.getAudio()` to get the wav file created

### Options
* recordingTime: (Default: 5000)
	- Set how long recording should be before automatically stopping
	- Note: If set to a falsey value you will need to call `recorder.stopRecording()` manually
	- `recorder.set('recordingTime', <time in milliseconds>)`

```javascript
import Route from '@ember/routing/route';

import { inject } from '@ember/service';

export default Route.extend({

	recorder: inject(),

	init() {
		this._super(...arguments);
		let recorder = this.get('recorder');
		recorder.set('recordingTime', 5000);
	},

	setupController(controller) {
		this._super(...arguments);
		let recorder = this.get('recorder');
		controller.set('recorder', recorder);
	},

	actions: {
		async record() {
			let recorder = this.get('recorder');
			await recorder.start();

			let { base64, audioURL, blob } = await recorder.getAudio();
			console.log(base64, audioURL, blob);
		},
		async play() {
			let recorder = this.get('recorder');
			recorder.play();
		},
		async stop() {
			let recorder = this.get('recorder');
			recorder.stop();
			recorder.close(); // Cloase audio context
		}
	}
});
```

```handlebars
<div>
	Recording
	{{#if recorder.isRecording}}
		Started!!
	{{else}}
		Stopped
	{{/if}}
</div>
<br />

<button {{action 'record'}}>Record</button>
<button {{action 'play'}}>Play</button>
<button {{action 'stop'}}>Stop</button>
```

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
