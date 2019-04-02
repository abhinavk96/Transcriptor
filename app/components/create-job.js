import Component from '@ember/component';

export default Component.extend({
  actions: {
    submit() {
      console.log('hello');
      console.log(this.get('assignees'));
      this.assignees.forEach(assignee => {
        this.store.createRecord('job', {
          creator: this.model.creator,
          assignee,
          transcription: this.selectedTranscription,
          role: this.model.role
        }).save()
          .then(()=>{
            console.log('Job Created Successfully');
          })
          .catch(e => {
            console.warn(e);
          })
      })
    }
  }
});
