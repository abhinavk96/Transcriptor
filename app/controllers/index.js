import Controller from '@ember/controller';

export default Controller.extend({
  currentTime: 0,
  actions: {
    play(){
      console.log('played yo');
      console.log(this);
    },
    timeupdate(evt) {
      console.log('time update',evt);
      this.set('currentTime', evt.srcElement.currentTime);
    }
  }
});
