import Ember from 'ember';

const { inject: { service }, computed } = Ember;

export default Ember.Controller.extend({
  cookies: service(),

  testCookieValue: computed(function() {
    return this.get('cookies').read('test-cookie');
  })
});
