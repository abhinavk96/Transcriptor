import Controller from '@ember/controller';

export default Controller.extend({
  actions : {
    save(user) {
      console.log(user.email);
      user.save()
        .then(savedUser=> {
          console.log('user saved', savedUser.isAdmin)
        })
        .catch(e=> {
          console.warn(e)
        })
    }
  }
});
