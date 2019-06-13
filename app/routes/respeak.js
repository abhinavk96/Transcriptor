import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authManager: service(),
  session: service(),
  async model() {
    let allTranscriptions = this.store.query('transcription', {});
    return {
      allTranscriptions: allTranscriptions
    }
  }
});
