import Controller from '@ember/controller';

export default Controller.extend({
  modalOffset: 200,
  actions: {
    openModal: function(name) {
      $('.ui.' + name + '.modal').modal({ detachable:false, observeChanges:true, offset:this.modalOffset }).modal('show').modal('refresh');
    }
  }
});
