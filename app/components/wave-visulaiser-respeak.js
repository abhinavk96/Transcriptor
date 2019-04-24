import Component from '@ember/component';
import { computed } from '@ember/object';

import convert from 'npm:xml-js'
import WaveformPlaylist from 'npm:waveform-playlist';

export default Component.extend({
  isPlayerLoading: false,
  didInsertElement() {
    this._super(...arguments);
    this.send('loadWaveFile');
  },
  actions: {
    loadWaveFile() {
      this.set('isPlayerLoading', true);
      var playlist = WaveformPlaylist.init({
        samplesPerPixel: 5000,
        zoomLevels: [1000, 5000, 9000],
        waveHeight: 100,
        container: document.getElementById("playlist"),
        state: 'cursor',
        colors: {
          waveOutlineColor: 'white',
          timeColor: 'grey',
          fadeColor: 'black'
        }
      });
      playlist.load([
        {
          "src": this.get('data.transcription.fileAddress'),
          "name": "Vocals"
        }
      ]).then(() => {
        let duration = parseFloat(playlist.duration);
        $container.on("click", ".btn-play", function () {
          ee.emit("play");
        });
        let waveFormOuterWidth = $('.playlist-overlay').outerWidth();
        let timePixel =(parseFloat(waveFormOuterWidth/duration).toFixed(2));
        let segmentBoxes = [];
          $('#segment-container').css({"width": waveFormOuterWidth + "px"});
        this.data.segmentsList.forEach((segment, index) => {
          console.log(segment._attributes);
          let segmentBox = document.createElement('div');
          segmentBox.classList.add("segment", "box");
          segmentBox.innerHTML = index+1;
          segmentBox.style.left=`${timePixel*parseFloat(segment._attributes.stime)}px`;
          segmentBox.style.width=`${timePixel*parseFloat(segment._attributes.dur)}px`;
          console.log(segmentBox.style.width);
          segmentBoxes.push(segmentBox);

        });
        console.log(segmentBoxes);
        segmentBoxes.forEach(segmentBox => {
          $('#segment-container').append(segmentBox);
        })
        //can do stuff with the playlist.
      });

    }
  }
});
