import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

export default Route.extend({
  authManager: service(),
  session: service(),
  loader: service(),
  async model(params) {
    const MyObject = EmberObject.extend({
      // empty object
    });
    var result = [];

    console.log(params);
    if(params.transcription_type==='created') {
      return this.get('authManager.currentUser').get('transcriptions');
    }
    if(params.transcription_type==='assigned') {
      let data = await this.get('loader').load(`/users/${this.get('authManager.currentUser.id')}/editor-transcriptions`);
      // return this.store.c('transcription', data);

      data.data.forEach(item => {
        item.id = null;
        var model = this.store.createRecord('transcription', item.attributes);
        result.addObject(model);

      });
      this.get('authManager.currentUser').set('editorTranscriptions', result);
      return this.get('authManager.currentUser').get('editorTranscriptions');

    }

  }
});
