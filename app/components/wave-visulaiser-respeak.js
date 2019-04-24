import Component from '@ember/component';
import { computed } from '@ember/object';

import convert from 'npm:xml-js'
import WaveformPlaylist from 'npm:waveform-playlist';

export default Component.extend({
  isPlayerLoading: false,
  didInsertElement() {
    this._super(...arguments);
    this.send('loadWaveFile')
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
      ]).then(function() {
        //can do stuff with the playlist.
      });

    }
  }
});
