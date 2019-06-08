import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),

  actions: {
    submit() {
      let { identification, password } = this.getProperties('identification', 'password');
      const credentials = this.getProperties('username', 'password');
      const authenticator =  'authenticator:jwt';
      this.get('session').authenticate(authenticator, credentials)
        .then(async() => {
          const tokenPayload = this.get('authManager').getTokenPayload();
          console.log(tokenPayload);
          if (tokenPayload) {
            this.get('authManager').persistCurrentUser(
              await this.store.findRecord('user', tokenPayload.identity)
            );
          }
        })
        .catch(reason => {
          console.warn(reason);
          if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
            if (reason && reason.hasOwnProperty('status_code') && reason.status_code === 401) {
              this.set('errorMessage','Your credentials were incorrect.');
            } else {
              this.set('errorMessage','An unexpected error occurred.');
            }
            this.set('isLoading', false);
          } else {
            console.warn(reason);
          }
        })
        .finally(() => {
          if (!(this.get('isDestroyed') || this.get('isDestroying'))) {
            this.set('password', '');
          }
        });
    }
  }
});
