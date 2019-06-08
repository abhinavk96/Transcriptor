import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session : service(),
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
