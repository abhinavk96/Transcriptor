import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),
  isLoading: false,
  isRegistrationComplete: false,

  actions: {
    submit() {
      this.data.save()
        .then( user => {
          this.set('isLoading', true);
          console.log(user, 'user created successfully');
          this.set('isRegistrationComplete', true);

        })
        .catch(e => {
          console.warn(e);
        })
        .finally(() =>{
          this.set('isLoading', false);
        })
    }
  }
});
