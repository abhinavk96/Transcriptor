import Controller from '@ember/controller';
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';

export default Controller.extend({
  notify: service(),
  modalOffset: 200,
  respeakFileKeys: computed('model.transcription.respeakFiles', function() {
    let keys = [];
    // console.log(JSON.stringify(this.model.transcription.respeakFiles));
    let tempVar = JSON.parse(this.model.transcription.respeakFiles);
    let segArrays;
      try {
        segArrays = tempVar["data"];
      }
      catch (e) {
        segArrays = null;
      }
    // console.log(tempVar["data"]);
    return segArrays;
   for (const key in JSON.parse(this.model.transcription.respeakFiles)) {
     keys.push(key);
   }
    console.log('about to print keys...');
    console.log(keys);

    return keys;
  }),
  actions: {
    openModal: function(name) {
      //console.log(name);
      $('.ui.' + name + '.modal').modal({ detachable:false, observeChanges:true, offset:this.modalOffset }).modal('show').modal('refresh');
    },
    submitUpdates(transcription) {
      console.log('submitUpdates  called');
      var xhr = new XMLHttpRequest();
      var formData = new FormData();
      formData.append('transcription', transcription.id);
      xhr.onload = (r)=>{
        console.log('sent',r);
        let metaSegment = (JSON.stringify(this.metaSegment));
        transcription.set('respeakFiles', metaSegment);
        console.log('inside xhr');
        console.log(this.metaSegment);

        transcription.save()
          .then(() => {
            console.log("Update pushed");
          })
          .catch(e => {
            console.log('could not save');
            console.warn(e);
          })
    };
      // xhr.open("POST", "http://localhost:5000/upload/files/multi", true);
      xhr.open("POST", "https://transcriptor.southeastasia.cloudapp.azure.com:5000/upload/files/multi", true);
      xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
      xhr.send(formData);
    },
    uploadFiles(transcription) {
      let newRecordedSegs = this.recordedSegs;
      let metaSegment = this.metaSegment;
      console.log(metaSegment);


      //todo optimization may be done by changing this (and hence other implementations)
      newRecordedSegs.forEach((eln, indexn) => {
        for (const key in metaSegment['data']) {
          console.log(key);
          metaSegment['data'][key].forEach((elm, indexm) => {
            if (elm.start === eln.start && elm.end === eln.end) {
              metaSegment['data'][key][indexm].reSpoken = true
            }
          })
        }


      });

      let listOfFileNames = [];
      // let previousRespokenSegments = transcription.get('respeakFiles');
      // previousRespokenSegments = JSON.parse(previousRespokenSegments);
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
        // if(previousRespokenSegments && Object.keys(previousRespokenSegments).length) {
        //   for(let i = 0; i < Object.keys(previousRespokenSegments).length; i++) {
        //     finalJson[Object.keys(previousRespokenSegments)[i]] = Object.values(previousRespokenSegments)[i];
        //     //console.log(finalJson, "Prev");
        //   }
        // }
        // for(let i = 0; i < this.audioFileArray.length; i++) {
        //   finalJson[listOfFileNames[i]] = listOfUrls[i];
        // }
        console.log(finalJson, "Final JSON");
        finalJson = JSON.stringify(finalJson);
        // transcription.set('respeakFiles', finalJson);
        // let metaSegment = (JSON.stringify(this.metaSegment));
        metaSegment = (JSON.stringify(metaSegment));
        transcription.set('respeakFiles', metaSegment);

        transcription.save()
          .then(() => {
            this.notify.success(`Segment(s) successfully re-spoken. Re-transcription is being done now`, {
              closeAfter: 10000, classNames: ['notify-class'] // this part may be explored
            });
            console.log("Final JSON saved");
          })
          .catch(e => {
            console.warn(e);
          })
      };
      // todo changes done here for prod/local
      xhr.open("POST", "https://transcriptor.southeastasia.cloudapp.azure.com:5000/upload/files/multi", true);
      // xhr.open("POST", "http://localhost:5000/upload/files/multi", true);

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
