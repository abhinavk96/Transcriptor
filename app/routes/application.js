import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(ApplicationRouteMixin, {
  authManager: service(),
  session: service(),
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
    await this.get('settings').initialize();
  },

  async model() {
    let notifications = [];
    if (this.get('session.isAuthenticated')) {
      notifications = await this.get('authManager.currentUser').query('notifications', {
        filter: [
          {
            name : 'is-read',
            op   : 'eq',
            val  : false
          }
        ],
        sort: '-received-at'
      });
    }

    return {
      notifications,
      pages: await this.get('store').query('page', {
        sort: 'index'
      }),
      cookiePolicy     : this.get('settings.cookiePolicy'),
      cookiePolicyLink : this.get('settings.cookiePolicyLink'),
      socialLinks      : await this.get('store').queryRecord('setting', {}),
      eventTypes       : await this.get('store').findAll('event-type'),
      eventLocations   : await this.get('store').findAll('event-location')
    };
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
