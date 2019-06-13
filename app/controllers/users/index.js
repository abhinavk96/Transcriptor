import Controller from '@ember/controller';
import { inject as service} from '@ember/service';
export default Controller.extend({
  notify: service(),
  actions : {
    save(user) {
      console.log(user.email);
      user.save()
        .then(savedUser=> {
          console.log('user saved', savedUser.isAdmin)
          this.notify.success(`User ${user.email} access status updated` );

        })
        .catch(e=> {
          console.warn(e)
          this.notify('An unexpected error occurred. Check dev console.')
        })
    }
  }
});
