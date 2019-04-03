import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  authManager: service(),
  session: service(),
  model() {
    let allJobs = this.store.findAll('job');
    return {
      allJobs: allJobs
    }
  }
});
