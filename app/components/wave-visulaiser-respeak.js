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

  currentSegment: null,
  segmentTimes: [],

  actions: {

    setCurrentSegment(time) {
      this.segmentTimes.forEach((times, index) => {
        if(time>=times.start && time<=times.end) {
          if(this.currentSegment !== index)
          this.set('currentSegment', index);
          $('.segment.box').removeClass('current');
          $('.segment.box').eq(index).addClass('current');
        }
      })
    },
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
        const ee = playlist.getEventEmitter();

        let duration = parseFloat(playlist.duration);
        $('body').on("click", ".btn-play", function () {
          ee.emit("play");
        });
        $('body').on("click", ".btn-pause", function () {
          ee.emit("pause");
        });
        $('.playlist-tracks').on('scroll', (e) => {
          $('#outer-segment-container').scrollLeft($(e.target).scrollLeft());
          console.log('A');
        });
        $('#outer-segment-container').on('scroll', (e) => {
          $('.playlist-tracks' ).scrollLeft($(e.target).scrollLeft());
          console.log('B');
        });
        let waveFormOuterWidth = $('.playlist-overlay').outerWidth();
        let timePixel =(parseFloat(waveFormOuterWidth/duration).toFixed(2));
        let segmentBoxes = [];
          $('#segment-container').css({"width": waveFormOuterWidth + "px"});
          let startTimeSegments = [];
        this.data.segmentsList.forEach((segment, index) => {
          console.log(segment._attributes);
          startTimeSegments.push({'start' :parseFloat(segment._attributes.stime), 'end': parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur)});
          let segmentBox = document.createElement('div');
          segmentBox.classList.add("segment", "box");
          segmentBox.innerHTML = index+1;
          segmentBox.style.left=`${timePixel*parseFloat(segment._attributes.stime)}px`;
          segmentBox.style.width=`${timePixel*parseFloat(segment._attributes.dur)}px`;
          console.log(segmentBox.style.width);
          segmentBoxes.push(segmentBox);

        });
        console.log(segmentBoxes);
        this.set('segmentTimes', startTimeSegments);
        segmentBoxes.forEach(segmentBox => {
          $('#segment-container').append(segmentBox);
        });
        //can do stuff with the playlist.
        const updateTime = time => {
          this.set('currentTime', time);
          this.send('setCurrentSegment', time);
        };
        ee.on("timeupdate", updateTime);
        ee.emit('play');
      });




    }
  },

});
