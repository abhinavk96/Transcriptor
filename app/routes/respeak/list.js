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
    recorder.set('recordingTime', false);
    controller.set('recorder', recorder);
    controller.set('recordingSegment', null);
    controller.set('currentSegment', null);
  },
  actions: {
    handleKeys (keys) {
      console.log(keys);
      if(keys[17] && keys[38]) {
        this.send('record');
      }
      if(keys[17] && keys[40]) {
        this.send('stop');
      }
    },
    async record() {
      this.get('controller').set('recordingSegment', this.get('controller').currentSegment + 1);
      console.log('Record', this.get('controller').recordingSegment + 1);
      let recorder = this.get('recorder');
      await recorder.start();


    },
    async play() {
      let recorder = this.get('recorder');
      recorder.play();
    },
    async stop() {
      let recorder = this.get('recorder');
      recorder.stop();
      let { base64, audioURL, blob } = await recorder.getAudio();
      console.log(base64, audioURL, blob);
      recorder.close(); // Cloase audio context
      var au = document.createElement('audio');
      au.src = audioURL;
      au.controls = true;
      var filename = `Segment :: ${this.get('controller').recordingSegment}.wav`;
      document.getElementById("storeFile").appendChild(au);
      document.getElementById("storeFile").appendChild(document.createTextNode(filename));



    }
  },

  async model(params) {
    console.log(params);
    const transcription = await this.store.findRecord('transcription', params.transcription_id);
    const rawXML = transcription.rawXml;
    let xml = rawXML;
    let json = convert.xml2json(xml, {compact: true, spaces: 4});
    let obj = JSON.parse(json);
    let keys={};
    $(document).keydown((e) => {
      keys[e.which] = true;
      if (e.which === 69 && keys[17]) {
        e.preventDefault();
      } else if (e.which === 75 && keys[17] || e.which === 74 & keys[17]) {
        e.preventDefault();
      }
      this.send('handleKeys', keys);
    });
    $(document).keyup((e) => {
      delete keys[e.which];
      this.send('handleKeys', keys);

    });
    var segmentsList = obj.AudioDoc.SegmentList.SpeechSegment;
    segmentsList = segmentsList.sort(function(a,b) {
      return (parseFloat(a['_attributes']['stime']) - parseFloat(b['_attributes']['stime']));
    });
    return {
      transcription: transcription,
      segmentsList: segmentsList
    }
  }
});
