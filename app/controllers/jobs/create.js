import Controller from '@ember/controller';

export default Controller.extend({
  actions : {
    redirectSuccess() {
      this.transitionToRoute('jobs')
    }
  }
});
