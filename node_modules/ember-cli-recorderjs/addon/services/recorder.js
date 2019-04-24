import Recorder from 'Recorder';

import Service from '@ember/service';

import { later, cancel } from '@ember/runloop';

const {
	URL,
	Blob,
	Promise,
	navigator,
	FileReader,
	AudioContext
} = window;


const crypto = {
	createURL(blob) {
		return URL.createObjectURL(blob);
	},
	fromBlob(blob, type = 'text') {
		let func = type === 'data' ? 'readAsDataURL' : 'readAsText';

		return new Promise((resolve, reject) => {
			let reader = new FileReader();

			reader[func](blob);
			reader.onerror = (error) => reject(error);
			reader.onload = () => resolve(reader.result);
		});
	},
	toBlob(dataURI) {
		let { buffer, mimeString } = this.toArrayBuffer(dataURI);

		// write the ArrayBuffer to a blob, and you're done
		return new Blob([buffer], { type: mimeString });
	}
};

export default Service.extend({

	recorder: null,

	isRecording: false,

	audioTimeout: null,

	audioContext: null,

	recordingTime: 5000,

	audioElementType: 'audio/wav',

	audioElementID: 'audio-playback',

	init() {
		this._super(...arguments);
		return this.setup();
	},

	async setup() {
		let recorder = this.get('recorder');
		let audioContext = this.get('audioContext');

		return audioContext && recorder
			|| navigator.mediaDevices.getUserMedia({ audio: true })
				.then((stream) => { this.createNewRecorder(stream) });
	},

	async createNewRecorder(stream) {
		let audioContext = this.get('audioContext')
			|| this.set('audioContext', new AudioContext());

		let input = audioContext.createMediaStreamSource(stream);
		let recorder = new Recorder(input);
		this.set('recorder', recorder);
		return recorder;
	},

	async stop() {
		if(!this.get('isRecording')) { return; }

		let audioTimeout = this.get('audioTimeout');
		let resolvePromise = this.get('resolvePromise');

		resolvePromise && resolvePromise();
		audioTimeout && cancel(audioTimeout);

		this.resetRecorder();
	},

	async start() {
		try {
			await this.reset();
			await this.setup();
		} catch(e) {
			throw e;
		}

		let recordingTime = this.get('recordingTime');
		let recorder = this.get('recorder');
		this.set('isRecording', true);
		recorder.record();

		return recordingTime
			&& new Promise((resolve, reject) => {
				let finish = () => resolve(this.stop());
				let audioTimeout = later(finish, recordingTime);

				this.set('audioTimeout', audioTimeout);
				this.set('resolvePromise', resolve);
				this.set('rejectPromise', reject);
			});
	},

	async getAudio() {
		let recorder = this.get('recorder');
		if(!recorder) { throw new Error('Recorder not initialized'); }

		return await new Promise((resolve) => {
			recorder.exportWAV((blob) => {
				let audioURL = crypto.createURL(blob);
				crypto.fromBlob(blob, 'data')
					.then((base64) => {
						resolve({ blob, base64, audioURL });
					});
			});
		});
	},

	async play() {
		this.removeAudioElement();

		let { audioURL } = await this.getAudio();

		let $audio = document.createElement('audio');
		let $source = document.createElement('source');

		$source.src = audioURL;
		$source.type = this.audioElementType;

		$audio.autoplay = true;
		$audio.id = this.audioElementID;
		$audio.addEventListener('ended', this.removeAudioElement.bind(this));

		$audio.appendChild($source);
		document.body.appendChild($audio);
	},


	async reset() {
		this.removeAudioElement();

		let audioTimeout = this.get('audioTimeout');
		let rejectPromise = this.get('rejectPromise');

		audioTimeout && cancel(audioTimeout);
		rejectPromise && rejectPromise(new Error('Recorder Reset'));

		this.resetRecorder();
		this.clear();
	},

	async close() {
		let audioContext = this.get('audioContext');
		audioContext && await audioContext.close();
		this.set('audioContext', null);
	},

	removeAudioElement() {
		let $audio = document.getElementById(this.audioElementID);
		if (!$audio) { return; }

		$audio.removeEventListener('ended', this.removeAudioElement.bind(this));
		$audio.parentElement.removeChild($audio);
	},

	resetRecorder() {
		this.set('isRecording', false);
		this.set('audioTimeout', null);
		this.set('rejectPromise', null);
		this.set('resolvePromise', null);

		let recorder = this.get('recorder');
		recorder && recorder.stop();
	},


	clear() {
		let recorder = this.get('recorder');
		recorder && recorder.clear();
		recorder && recorder.stop();
	}
});
