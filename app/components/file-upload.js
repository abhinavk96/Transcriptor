import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { computed } from '@ember/object';

import ENV from 'transcriptor/config/environment';

export default Component.extend({
  loader: service(),
  store: service(),
  isUploading: false,
  isTranscribing: false,
  uploadProgress:0,
  transcriptionStatus: null,
  transcriptionProgress: computed('transcriptionStatus', function() {
    switch(this.transcriptionStatus) {
      case 'CREATED':
        return 10;
      case 'STARTING':
        return 20;
      case 'MONOLIZE-RESAMPLE':
        return 30;
      case 'DIARIZATION':
        return 40;
      case 'KALDI-DATA-PREPARATION':
        return 50;
      case 'FEATURE-EXTRACTION':
        return 60;
      case 'DECODING':
        return 70;
      case 'POST-PROCESSING':
        return 80;
      case 'DONE':
        return 100;
      default:
        return 50;
    }
  }),
  generateXML(transcription) {
    transcription.set('status', 'DONE');
    let payload = {
      'name': transcription.asrName
    };
    transcription.save()
      .then(finishedTranscription => {

        this.get('loader').post('/transcribe/download', payload)
          .then(response => {
            console.log(response, response.xmlFile);
            finishedTranscription.set('xmlFile', response.xmlFile);
            finishedTranscription.set('xmlName', response.xmlName);
            finishedTranscription.save()
              .then(response => {
                console.log("success", response);
              })
          })
      })
  },
  checkStatus(transcription) {
    let payload = {
      'name': transcription.asrName
    };
    var timeloop = setInterval(() => {
      console.log('transcription status check');
      this.get('loader').post('/transcribe/status', payload)
        .then(response => {
          console.log(response, response.response.status.slice(-1)[0].status);
          if (response.response.status.slice(-1)[0].status !== this.transcriptionStatus) {
            this.set('transcriptionStatus', response.response.status.slice(-1)[0].status);
          }
          if(response.response.status.slice(-1)[0].status=='DONE') {
            this.set('transcriptionStatus', 'DONE');
            this.generateXML(transcription);
            clearInterval(timeloop);
          }
        })
        .catch(e => {console.log(e)})
    }, 5000)
  },
  trackProgress(e, component) {
    console.log(e, component);
    // return
    e.set('uploadProgress', parseInt(parseInt(component.loaded)*100/parseInt(component.total)));
  },
  transcribe(transcription) {
    transcription.save()
      .then(createdTranscription => {
        console.log(createdTranscription);
        let payload = {
          'name': createdTranscription.asrName
        };
        this.set('transcriptionStatus', 'CREATED');
        this.get('loader').post('/transcribe/trigger', payload)
          .then(response => {
            console.log(response);
            createdTranscription.set('status', 'STARTING');
            this.set('isTranscribing', true);
            createdTranscription.save()
              .then(initialisedTranscription => {
                this.set('transcriptionStatus', 'STARTING');
                this.checkStatus(initialisedTranscription);
              })

          })
          .catch(e => {console.log(e)})
      });
  },
  uploadAudio(audioData) {
    console.log(audioData);
    this.get('loader')
      .uploadFile('/upload/files', audioData, this.trackProgress, {fileName: 'file'}, this)
      .then(audio => {
        console.log(JSON.parse(audio).ASR);
        let newTranscription = this.store.createRecord('transcription', {
          name: audioData.name,
          asrName:JSON.parse(audio).ASR.file.fileName,
          fileAddress: JSON.parse(audio).url,
          status: 'CREATED'

        });
        this.transcribe(newTranscription);
        // this.set('uploadComplete', true )
      })
      .catch(e => {
        console.log(e);
      });
  },
  processFiles(files) {
    if (files && files[0]) {
        this.uploadAudio(files[0])
        // const reader = new FileReader();
        // reader.onload = e => {
        //   const rawaAudioFile = e.target.result;
        //
        //   // console.log(rawaAudioFile);
        //   this.uploadAudio(rawaAudioFile);
        //
        // };
        // reader.readAsDataURL(files[0]);

      }
  },
  didInsertElement() {
    this._super(...arguments);
    this.$()
      .on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
      })
      .on('dragover dragenter', () => {
        // this.$('#file-upload').addClass('basic');

        this.$('#file-upload').addClass('orange');
        this.$('#file-upload').removeClass('piled');

        console.log('hover', this.$('.file-upload'));

      })
      .on('dragleave dragend drop', () => {
        this.$('#file-upload').addClass('piled');

        this.$('#file-upload').removeClass('orange');
        console.log('hover');
      })
      .on('drop', e => {
        console.log(e.originalEvent.dataTransfer.files);
        this.processFiles(e.originalEvent.dataTransfer.files);
        this.set('isUploading', true);
        console.log('dropped');
      });
  }

});

