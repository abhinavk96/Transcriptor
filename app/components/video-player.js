import Component from '@ember/component';
import Ember from 'ember';
import { computed, observer} from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend({
  tagName: 'video',
  classNames: 'videoPlayer',
  attributeBindings: ['width', 'height', 'controls'],
  width: 320,
  height: 176,
  controls: true,
  init() {
    this._super(...arguments);
  },
  didInsertElement() {
    console.log(this);
    this.element.onplay=this.onplay;
    this.element.ontimeupdate=this.ontimeupdate;
  }
});
