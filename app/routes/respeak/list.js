import Route from '@ember/routing/route';
import convert from 'npm:xml-js';
import { inject } from '@ember/service';

export default Route.extend({
  recorder: inject(),
  init() {
    let recorder = this.get('recorder');
  },
  setupController(controller) {
    this._super(...arguments);
    let recorder = this.get('recorder');
    recorder.set('recordingTime', 5000);
    controller.set('recorder', recorder);
  },
  actions: {
    async record() {
      console.log('Record')
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
  },

  async model(params) {
    console.log(params);
    const transcription = await this.store.findRecord('transcription', params.transcription_id);
    const rawXML = transcription.rawXml;
    let xml = rawXML;
    let json = convert.xml2json(xml, {compact: true, spaces: 4});
    let obj = JSON.parse(json);
    var segmentsList = obj.AudioDoc.SegmentList.SpeechSegment;;
    segmentsList = segmentsList.sort(function(a,b) {
      return (parseFloat(a['_attributes']['stime']) - parseFloat(b['_attributes']['stime']));
    });
    return {
      transcription: transcription,
      segmentsList: segmentsList
    }
  }
});
