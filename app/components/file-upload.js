import Component from '@ember/component';
import {inject as service} from '@ember/service';

export default Component.extend({
  loader: service(),
  uploadAudio(audioData) {
    // this.set('selectedImage', imageData);
    // this.set('needsConfirmation', false);
    // this.set('uploadingImage', true);
    this.get('loader')
      .post('/upload/files', {
        data: {
         'file': audioData
        }
      }, {
        isFormData: true
      })
      .then(audio => {
        // this.set('uploadingImage', false);
        // this.set('imageUrl', image.url);
        console.log(audio.url)
      })
      .catch(e => {
        console.warn(e);
      });
  },
  processFiles(files) {
    if (files && files[0]) {

        const reader = new FileReader();
        reader.onload = e => {
          const rawaAudioFile = e.target.result;

          console.log(rawaAudioFile);
          this.uploadAudio(rawaAudioFile);

        };
        reader.readAsDataURL(files[0]);

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
        this.processFiles(e.originalEvent.dataTransfer.files);
        console.log('dropped');
      });
  }

});
