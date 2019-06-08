import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  authManager: service(),
  session: service(),
  // settings: service(),
  title(tokens) {
    if (!tokens) {
      tokens = [];
    }

    tokens.reverse().push(this.get('settings.appName'));
    return tokens.join(' | ');
  },

  async beforeModel() {
    this._super(...arguments);
    await this.get('authManager').initialize();
    // await this.get('settings').initialize();
  },


  sessionInvalidated() {
    if (!this.get('session.skipRedirectOnInvalidation')) {
      this._super(...arguments);
    }
  },

  sessionAuthenticated() {
    if (this.get('session.previousRouteName')) {
      this.transitionTo(this.get('session.previousRouteName'));
    } else {
      this._super(...arguments);
    }
  },


});
