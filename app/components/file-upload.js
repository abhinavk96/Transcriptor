import Component from '@ember/component';
import {inject as service} from '@ember/service';
import { later } from '@ember/runloop';

import ENV from 'transcriptor/config/environment';

export default Component.extend({
  loader: service(),
  store: service(),
  isUploading: false,
  isTranscribing: false,
  uploadProgress:0,
  checkStatus(transcription) {
    let payload = {
      'name': transcription.asrName
    };
    setInterval(() => {
      console.log('transcription status check');
      this.get('loader').post('/transcribe/status', payload)
        .then(response => {
          console.log(response.response.status[0].status);
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
        this.get('loader').post('/transcribe/trigger', payload)
          .then(response => {
            console.log(response);
            createdTranscription.set('status', 'TRANSCRIBING');
            this.set('isTranscribing', true);
            createdTranscription.save()
              .then(initialisedTranscription => {
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

