import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

export default Route.extend({
  authManager: service(),
  session: service(),
  loader: service(),
  store: service(),
  async model(params) {
    const MyObject = EmberObject.extend({
      // empty object
    });
    var result = [];

    console.log(params);
    if (params.transcription_type === 'created') {
      return {
        session: this.get('authManager.currentUser').get('transcriptions'),
        field: 'created'
      }
    }
    if (params.transcription_type === 'assigned') {
      let data = await this.get('loader').load(`/users/${this.get('authManager.currentUser.id')}/editor-transcriptions`);
      // return this.store.c('transcription', data);
      let t = []
      data.data.forEach(item => {
        t.push(this.store.push(this.store.normalize('transcription', item)));

        // item.id = null;
        // item.attributes.createdAt = item.attributes.created_at;
        // item.attributes.audioDuration = item.attributes.audio_duration;
        // var model = this.store.createRecord('transcription', item.attributes);
        // result.addObject(model);

      });
      this.get('authManager.currentUser').set('editorTranscriptions', t);
      return {
        session: this.get('authManager.currentUser').get('editorTranscriptions'),
        field: 'assigned'
      }

    }
  }

});
