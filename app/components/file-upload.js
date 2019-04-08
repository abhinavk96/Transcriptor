import Component from '@ember/component';
import {inject as service} from '@ember/service';
import ENV from 'transcriptor/config/environment';

export default Component.extend({
  loader: service(),
  uploadAudio(audioData) {
    let form = document.createElement('form');
    let fileInput = document.createElement('input');
    function dataURItoBlob(data) {
      var binStr = data.split(',')[1],
        len = binStr.length,
        arr = new Uint8Array(len);

      console.log(binStr);


      for (var i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      return new Blob(arr);
    }
    var blob = dataURItoBlob(audioData);

    fileInput.type = 'file';
    // fileInput.value=blob;
    // form.appendChild(
    //   fileInput
    // );
    var formData = new FormData();
    formData.append('file', blob, 'fileName.ext');
    var xhr = new XMLHttpRequest();
    xhr.open('post', `${ENV['APP'].apiHost}/upload/files`);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        console.log(JSON.parse(xhr.responseText));
      }
    };
    xhr.send(formData)
    this.get('loader')
      .uploadFile('/upload/files', {
        data: blob
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
