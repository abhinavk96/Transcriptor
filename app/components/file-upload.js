import Component from '@ember/component';

export default Component.extend({
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
        // this.processFiles(e.originalEvent.dataTransfer.files);
        console.log('dropped');
      });
  }

});
