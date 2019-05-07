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
    controller.set('audioFileArray', null);
    controller.set('fileNames', null);
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
      au.setAttribute('class', 'audio-file');
      au.src = audioURL;
      au.controls = true;
      var fileName = document.createElement('div');
      fileName.innerHTML = `Segment :: ${this.get('controller').recordingSegment}.wav`;
      fileName.setAttribute('class', 'file-name');
      document.getElementById("storeFile").appendChild(au);
       document.getElementById("storeFile").appendChild(fileName);
      this.set('controller.audioFileArray', $('.audio-file'));
      this.set('controller.fileNames', $('.file-name'));
      var lengthOfFiles = $('.audio-file').length;
      for(let i = 0; i < $('.audio-file').length; i++) {
        if(i === lengthOfFiles-1) {
          $($('.audio-file')[i]).show();
          $($('.file-name')[i]).show();
        }
        else {
          $($('.audio-file')[i]).hide();
          $($('.file-name')[i]).hide();
        }
      }
      console.log(lengthOfFiles, 'This too');
      console.log($($('.file-name')[lengthOfFiles-1])[0].innerHTML, 'This');
      for(let i = 0; i < lengthOfFiles-1; i++) {
        if(($($('.file-name')[lengthOfFiles-1])[0].innerHTML) === ($($('.file-name')[i])[0].innerHTML)) {
          console.log($($('.file-name')[i]), 'ABC');
          $($('.audio-file')[i]).remove();
          $($('.file-name')[i]).remove();
        }
      }
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
// this.set('audioFileArray', $());\
