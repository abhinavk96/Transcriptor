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
  segmentBoxList: [],
  isLooping : false,


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
        samplesPerPixel: 1000,
        zoomLevels: [1000],
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
        var playoutPromises;
        this.set('isPlayerLoading', false);
        const ee = playlist.getEventEmitter();
        // ee.emit("automaticscroll", true);


        let recursivePlay = (start,end, segment) => {
          if (this.currentSegment!==segment) {
            return;
          }
          ee.emit('play',start,end);
        };


        let duration = parseFloat(playlist.duration);
        $('body').on("click", ".btn-play",  ()=>{
            recursivePlay(this.currentTime, this.segmentTimes[this.currentSegment]['end'], this.currentSegment);
        });




        $('body').on("click", ".btn-redo",  () => {
          this.set('isLooping',true);
          console.log(this.segmentTimes[this.currentSegment]['start'], this.segmentTimes[this.currentSegment]['end']);
          playlist.play(this.segmentTimes[this.currentSegment]['start'], this.segmentTimes[this.currentSegment]['end']);
          let loopInterval = setInterval(()=>{
            if(!this.isLooping) {
              clearInterval(loopInterval);
            }
            else{
              playoutPromises = playlist.play(this.segmentTimes[this.currentSegment]['start'], this.segmentTimes[this.currentSegment]['end']);
            }
          }, (this.segmentTimes[this.currentSegment]['end'] - this.segmentTimes[this.currentSegment]['start'])*1000)
        });
        $('body').on("click", ".btn-pause", ()=> {
          if(this.isLooping) {
            this.set('isLooping', false);
            ee.emit("pause");
          }
          else {
            ee.emit("pause");
          }
        });
        $('.playlist-tracks').on('scroll', (e) => {
          $('#outer-segment-container').scrollLeft($(e.target).scrollLeft());
        });
        $('#outer-segment-container').on('scroll', (e) => {
          $('.playlist-tracks' ).scrollLeft($(e.target).scrollLeft());
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

          segmentBox.addEventListener("click",  ()=> {
            ee.emit("play", parseFloat(segment._attributes.stime),parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur));

            $('.playlist-tracks' ).scrollLeft($(segmentBox).position().left - 100);

            for(let i=0; i< this.fileNames.length; i++) {

              if(`Segment :: ${index+1}.wav` === this.fileNames[i].innerHTML) {
                $(this.audioFileArray[i]).show();
                $(this.fileNames[i]).show();

              }
              else {
                $(this.audioFileArray[i]).hide();
                $(this.fileNames[i]).hide();
              }
            }
          });
        });
        console.log(segmentBoxes);
        this.set('segmentTimes', startTimeSegments);
        segmentBoxes.forEach(segmentBox => {
          $('#segment-container').append(segmentBox);
        });
        this.set('segmentBoxList', segmentBoxes);
        //can do stuff with the playlist.
        const updateTime = time => {
          this.set('currentTime', time);
          this.send('setCurrentSegment', time);
        };
        ee.on("timeupdate", updateTime);
        ee.on('finished', function () {
          console.log("The cursor has reached the end of the selection !");

        });
        let keys = {};
        $(document).keydown(function (e) {
          keys[e.which] = true;
          if(e.which  === 69 && keys[17]) {
            e.preventDefault();
          }
          else if(e.which  === 75 && keys[17] || e.which === 74 & keys[17]) {
            e.preventDefault();
          }

          handleKeys();
        });
        $(document).keyup(function (e) {
          delete keys[e.which];
          handleKeys();

        });
        let  moveToNextSegment = () => {
          let currentSegmentIndex = findCurrentSegment();
          console.log(currentSegmentIndex);
          let nextSegment = this.segmentTimes[currentSegmentIndex + 1];
          if(nextSegment) {
            ee.emit('pause');
            ee.emit('select', parseFloat(nextSegment['start']), parseFloat(nextSegment['end']));
            $('.playlist-tracks' ).scrollLeft($(this.segmentBoxList[currentSegmentIndex+1]).position().left-100);

            for(let i=0; i< this.fileNames.length; i++) {

              if(`Segment :: ${currentSegmentIndex+2}.wav` === this.fileNames[i].innerHTML) {
                $(this.audioFileArray[i]).show();
                $(this.fileNames[i]).show();

              }

              else {
                $(this.audioFileArray[i]).hide();
                $(this.fileNames[i]).hide();
              }
            }

          }

        };

        let moveToPreviousSegment =() => {
          let currentSegmentIndex = findCurrentSegment();
          let previousSegment = this.segmentTimes[currentSegmentIndex - 1];
          if(previousSegment) {
            ee.emit('pause');
            ee.emit('select', parseFloat(previousSegment['start']), parseFloat(previousSegment['end']));
            $('.playlist-tracks' ).scrollLeft($(this.segmentBoxList[currentSegmentIndex-1]).position().left-100);


            for(let i=0; i< this.fileNames.length; i++) {

              if(`Segment :: ${currentSegmentIndex}.wav` === this.fileNames[i].innerHTML) {
                $(this.audioFileArray[i]).show();
                $(this.fileNames[i]).show();

              }

              else {
                $(this.audioFileArray[i]).hide();
                $(this.fileNames[i]).hide();
              }
            }

          }
        };

         let findCurrentSegment = () => {
          var result = -1;
          this.segmentTimes.forEach((segment, i) => {
            // console.log(note, i);
            if(this.currentTime >= parseFloat(segment['start']) && this.currentTime <= parseFloat(segment['end'])) {
              console.log("found!",segment, i);
              result = i;
            }
          });
          return result;
        };


        function handleKeys() {
          console.log(keys);
          if(keys[17] && keys[32]) {
            ee.emit('play');
          }
          else if(keys[17] && keys[18]) {
            $('.btn-pause').click();
          }
          else if(keys[17] && keys[191]) {
            $('.btn-redo').click();
          }
          else if(keys[17] && keys[37]) {
            playlist.pause()
              .then(() => {
                moveToPreviousSegment();
              });
          }
          else if(keys[17] && keys[39]) {
            playlist.pause()
              .then(()=>{
                moveToNextSegment();
              });
          }
        }
      });
    }

  },

});
