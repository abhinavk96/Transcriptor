import Component from '@ember/component';
import { computed } from '@ember/object';
import { find } from 'lodash';
export default Component.extend({
  selectedTranscription: computed('transcription', function () {
    if(this.get('transcription')) {
      return this.model.transcriptions.find(t => {return t.id === this.transcription});
    }
    return null;
  }),
  actions: {
    submit() {

      this.assignees.forEach(assignee => {
        this.store.createRecord('job', {
          creator: this.model.creator,
          assignee,
          transcription: this.selectedTranscription,
          role: this.model.role
        }).save()
          .then(()=>{
            this.redirectSuccess();
            console.log('Job Created Successfully');
          })
          .catch(e => {
            console.warn(e);
          })
      })
    }
  }
});
