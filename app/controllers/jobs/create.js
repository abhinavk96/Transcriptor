import Controller from '@ember/controller';

export default Controller.extend({
  queryParams : ['transcription'],
  transcription : null,
  actions : {
    redirectSuccess() {
      this.transitionToRoute('jobs');
    }
  }
});
