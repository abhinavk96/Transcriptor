import Controller from '@ember/controller';
import { computed } from '@ember/object';
export default Controller.extend({
  modalOffset: 200,
  respeakFileKeys: computed('model.transcription.respeakFiles', function() {
    let keys = [];
   for (const key in JSON.parse(this.model.transcription.respeakFiles)) {
     keys.push(key);
   }
   return keys
  }),
  actions: {
    openModal: function(name) {
      //console.log(name);
      $('.ui.' + name + '.modal').modal({ detachable:false, observeChanges:true, offset:this.modalOffset }).modal('show').modal('refresh');
    },
    uploadFiles(transcription) {
      let listOfFileNames = [];
      let previousRespokenSegments = transcription.get('respeakFiles');
      previousRespokenSegments = JSON.parse(previousRespokenSegments);
      console.log(this.audioFileArray);
      for(let i = 0; i < this.audioFileArray.length; i++) {
        listOfFileNames[i] = this.audioFileArray[i].name;
      }
      var xhr = new XMLHttpRequest();
      var formData = new FormData();
      formData.append('transcription', transcription.id);
      xhr.onload = (r)=>{
        console.log('sent',r);
        let URLJson = r.target.response;
        let listOfUrls = [];
        URLJson = JSON.parse(URLJson);
        for(let  i =0; i < URLJson.urls.length-1; i++) {
          listOfUrls[i] = URLJson.urls[i];
        }
        var finalJson = {};
        if(Object.keys(previousRespokenSegments).length) {
          for(let i = 0; i < Object.keys(previousRespokenSegments).length; i++) {
            finalJson[Object.keys(previousRespokenSegments)[i]] = Object.values(previousRespokenSegments)[i];
            //console.log(finalJson, "Prev");
          }
        }
        for(let i = 0; i < this.audioFileArray.length; i++) {
          finalJson[listOfFileNames[i]] = listOfUrls[i];
        }
        // console.log(finalJson, "Final JSON");
        finalJson = JSON.stringify(finalJson);
        transcription.set('respeakFiles', finalJson);
        transcription.save()
          .then(() => {
            console.log("Final JSON saved");
          })
          .catch(e => {
            console.warn(e);
          })
      };
      xhr.open("POST", "https://transcriptor.southeastasia.cloudapp.azure.com:5000/upload/files/multi", true);
      xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
      for(var file in this.audioFileArray) {
        if(this.audioFileArray[file].src) {
          let fileBlob=this.audioFileArray[file].blob;
          fileBlob.lastModifiedDate = new Date();
          console.log(file, this.audioFileArray);
          fileBlob.name = `${file.name}.wav`;
          formData.append("files[]", fileBlob, `${this.audioFileArray[file].name}.wav`);
          console.log(formData);
        }
      }
      xhr.send(formData);
    }
  }
});
