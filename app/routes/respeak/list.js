import Route from '@ember/routing/route';
import convert from 'npm:xml-js';
import { inject } from '@ember/service';
export default Route.extend({
  // beforeModel() {
  //   $(document).add('*').off();
  // },
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
    controller.set('recordingSegmentStartTime', null);
    controller.set('recordingSegmentLabel', null);
    controller.set('recordingSegmentEndTime', null);
    controller.set('currentSegmentStartTime', null);
    controller.set('currentSegmentEndTime', null);

    controller.set('isRecording', false);
  },
  actions: {
    handleKeys (keys) {
      //console.log(keys);
      if(keys[17] && keys[38]) {
        this.send('record');
      }
      if(keys[17] && keys[40]) {
        if (this.get('controller').isRecording) {
          this.send('stop');
        }
      }
    },
    async record() {
      console.log('recording begins: ' + this.get('controller').testVar + 1);
      this.get('controller').set('recordingSegmentLabel', this.get('controller').currentSegmentLabel);
      this.get('controller').set('recordingSegment', this.get('controller').currentSegment + 1);
      this.get('controller').set('recordingSegmentStartTime', this.get('controller').currentSegmentStartTime);
      this.get('controller').set('recordingSegmentEndTime', this.get('controller').currentSegmentEndTime);
      this.get('controller').set('isRecording', true);
      // console.log('in the recored Record', this.get('controller').recordingSegmentLabel);
      let recorder = this.get('recorder');
      await recorder.start();
      console.log('recording begins');


    },
    async play() {
      let recorder = this.get('recorder');
      recorder.play();
    },
    async stop() {
      this.get('controller').set('isRecording', false);
      let recorder = this.get('recorder');
      recorder.stop();
      let { base64, audioURL, blob } = await recorder.getAudio();
      //console.log(base64, audioURL, blob);
      recorder.close(); // Cloase audio context
      var au = document.createElement('audio');
      au.setAttribute('class', 'audio-file');
      au.src = audioURL;
      au.blob = blob;
      au.controls = true;
      // au.name= `${parseFloat(this.get('controller').recordingSegmentStartTime).toFixed(2)}-${parseFloat(this.get('controller').recordingSegmentEndTime).toFixed(2)}`;
      au.name= this.get('controller').recordingSegmentLabel;
      au.iname = `${this.get('controller').recordingSegmentStartTime}-${this.get('controller').recordingSegmentEndTime}.wav`;
      var fileName = document.createElement('div');
      fileName.innerHTML = 'Segment ' + au.name;
      fileName.iname = au.iname;
      fileName.setAttribute('class', 'file-name');
      document.getElementById("storeFile").appendChild(au);
       document.getElementById("storeFile").appendChild(fileName);
       //console.log($('.segment.box').eq(this.get('controller').recordingSegment),this.get('controller').recordingSegment);

      //todo mold this for the new use-case!
      // $('.segment.box').eq(this.get('controller').recordingSegment-1).addClass(
      //    'recorded'
      //  );
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
      //console.log(lengthOfFiles, 'This too');
      //console.log($($('.file-name')[lengthOfFiles-1])[0].innerHTML, 'This');
      for(let i = 0; i < lengthOfFiles-1; i++) {
        if(($($('.file-name')[lengthOfFiles-1])[0].innerHTML) === ($($('.file-name')[i])[0].innerHTML)) {
         // console.log($($('.file-name')[i]), 'ABC');
          $($('.audio-file')[i]).remove();
          $($('.file-name')[i]).remove();
        }
      }
    }
  },

  async model(params) {
    //console.log(params);
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
      try {
        this.send('handleKeys', keys);
      }
      catch (e) {
      }
    });
    $(document).keyup((e) => {
      delete keys[e.which];
      try {
        this.send('handleKeys', keys);
      }
      catch (e) {
      }

    });
    var segmentsList = obj.AudioDoc.SegmentList.SpeechSegment;
    if (!segmentsList.length) {
      segmentsList= [segmentsList];
    }
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
