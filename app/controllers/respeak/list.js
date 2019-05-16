import Controller from '@ember/controller';

export default Controller.extend({
  modalOffset: 200,
  actions: {
    openModal: function(name) {
      //console.log(name);
      $('.ui.' + name + '.modal').modal({ detachable:false, observeChanges:true, offset:this.modalOffset }).modal('show').modal('refresh');
    },
    uploadFiles() {
      console.log(this.audioFileArray);
      var xhr = new XMLHttpRequest();
      var formData = new FormData();
      xhr.onload = (r)=>{
        console.log('sent',r);
      };
      xhr.open("POST", "http://localhost:5000/upload/files/multi", true);
      xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
      for(var file in this.audioFileArray) {
        if(this.audioFileArray[file].src) {
          let fileBlob=this.audioFileArray[file].blob;
          fileBlob.lastModifiedDate = new Date();
          fileBlob.name = `${file}.wav`;
          formData.append("files[]", fileBlob);
          console.log(formData);
        }
      }
      xhr.send(formData);
    }
  }
});
