import Component from '@ember/component';

export default Component.extend({
  classNames: ['ui', 'item'],
  actions: {
    redirectCreateJob(data) {
      this.redirectSuccess(data);
      console.log('Switching to create job route');
    }
  }
});
