import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('editor');
  this.route('login');
  this.route('my-transcriptions');
  this.route('jobs', function() {
    this.route('create');
  });
});

export default Router;
