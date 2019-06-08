import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
    this.transitionTo('my-transcriptions.list', this.modelFor('my-transcriptions').isAdmin ? 'created' : 'assigned');
  }
});
