import Component from '@ember/component';

export default Component.extend({
  processFiles(files) {
    if (files && files[0]) {

        const reader = new FileReader();
        reader.onload = e => {
          const rawaAudioFile = e.target.result;
          // if (this.get('needsCropper')) {
          //   this.set('imgData', untouchedImageData);
          //   this.set('cropperModalIsShown', true);
          // } else {
          //   this.uploadImage(untouchedImageData);
          // }
          console.log(rawaAudioFile);
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
