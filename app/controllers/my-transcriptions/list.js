import Controller from '@ember/controller';

export default Controller.extend({
  actions : {
    redirectSuccess(data) {
      this.transitionToRoute('jobs.create', {queryParams: {transcription:data.id}});
      console.log(data.name);
    }
  }
});
