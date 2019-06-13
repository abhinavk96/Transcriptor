import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),
  authManager: service(),
  // routing: service(),
  actions: {
    logout() {
      this.get('authManager').logout();
      // this.transitionToRoute('index');
    },
    handleKeys() {
      return;
    }
  }

});
