import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('editor', function() {
    this.route('list' ,{ path: '/:transcription_id'});
  });
  this.route('login');
  this.route('my-transcriptions', function() {
    this.route('list',{ path: '/:transcription_type' });
  });
  this.route('jobs', function() {
    this.route('create');
    this.route('edit');
  });
  this.route('users', function() {});
});

export default Router;
