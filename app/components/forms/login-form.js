import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),

  actions: {
    submit() {
      let { identification, password } = this.getProperties('identification', 'password');
      const credentials = this.getProperties('username', 'password');
      const authenticator =  'authenticator:jwt';
      this.get('session').authenticate(authenticator, credentials).catch((reason) => {
        this.set('errorMessage', reason.error || reason);
      });
    }
  }
});
