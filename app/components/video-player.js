import Component from '@ember/component';
import Ember from 'ember';
import { computed, observer} from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  tagName: 'video',
  classNames: 'videoPlayer',
  attributeBindings: ['width', 'height', 'controls', 'currentTime'],
  width: 320,
  height: 176,
  controls: true,
  currentTime: function(){
    console.log('hello');
  },

  init() {
    this._super(...arguments);
  },
  didInsertElement() {
    console.log(this.element);
    this.element.on('play', Ember.run.bind(this,this.currentTime))

  },
  actions: {

    gi() {
      console.log(this.element.currentTime);
      this.set('currentTime', this.element.currentTime)

    }
  }
});
