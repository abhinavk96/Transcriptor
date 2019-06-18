import Component from '@ember/component';
import { computed } from '@ember/object';
import ENV from 'transcriptor/config/environment';

import convert from 'npm:xml-js'
import WaveformPlaylist from 'npm:waveform-playlist';

export default Component.extend({
  isPlayerLoading: false,
  didInsertElement() {
    this._super(...arguments);
    this.send('loadWaveFile');
  },

  didDestroyElement() {
    var ee = this.playlist.getEventEmitter();
    ee.emit('clear');
  },

  currentSegment: null,
  currentSegmentStartTime: null,
  currentSegmentEndTime: null,
  playlist: null,
  segmentTimes: [],
  segmentBoxList: [],
  isLooping : false,
  allowMouseUpEvent: false,



  actions: {
    setCurrentSegment(time) {
      this.segmentTimes.forEach((times, index) => {
        if(time>=times.start && time<=times.end) {
          if(this.currentSegment !== index)
            this.set('currentSegment', index);
          // this.set('currentSegmentStartTime', times.start);
          // this.set('currentSegmentEndTime', times.end);
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
        state: 'select',
        colors: {
          waveOutlineColor: 'white',
          timeColor: 'grey',
          fadeColor: 'black'
        }
      });
      this.set('playlist', playlist);
      playlist.load([
        {
          "src": `${ENV.APP.apiHost}${this.get('data.transcription.fileAddress')}`,
          "name": "Vocals"
        }
      ]).then(() => {
        var playoutPromises;
        this.set('isPlayerLoading', false);
        const ee = playlist.getEventEmitter();
        // ee.emit("automaticscroll", true);

        var $container = $("body");

        var startTime = 0;
        var endTime = 0;


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

        let DIVISION_THRESHOLD = timePixel * 0.5;

        let segmentBoxes = [];
        $('#segment-container').css({"width": waveFormOuterWidth + "px"});
        let startTimeSegments = [];
        let segArrays = {};
        let segElements = {};
        this.data.segmentsList.forEach((segment, index) => {
          //console.log(segment._attributes);
          startTimeSegments.push({'start' :parseFloat(segment._attributes.stime), 'end': parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur)});
          let segmentBox = document.createElement('div');
          segmentBox.classList.add("segment", "box");
          segmentBox.innerHTML = index+1;
          segmentBox.style.left=`${timePixel*parseFloat(segment._attributes.stime)}px`;
          segmentBox.style.width=`${timePixel*parseFloat(segment._attributes.dur)}px`;
          //console.log(segmentBox.style.width);
          segmentBoxes.push(segmentBox);
          segArrays[index] = [{'start' :parseFloat(segment._attributes.stime), 'end': parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur)}];
          segElements[index] = [segmentBox];

          segmentBox.addEventListener("click",  ()=> {
            ee.emit("select", parseFloat(segment._attributes.stime),parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur));
            this.set('currentSegmentStartTime', parseFloat(segment._attributes.stime));
            this.set('currentSegmentEndTime', parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur));

            $('.playlist-tracks' ).scrollLeft($(segmentBox).position().left - 100);
            if(this.fileNames && this.fileNames.length) {
              for(let i = 0; i < this.fileNames.length; i++) {
                console.log(this.fileNames);

                if(`Segment :: ${index+1}.wav` === this.fileNames[i].iname) {
                  $(this.audioFileArray[i]).show();
                  $(this.fileNames[i]).show();
                }
                else {
                  $(this.audioFileArray[i]).hide();
                  $(this.fileNames[i]).hide();
                }
              }
            }
          });
        });
        //console.log(segmentBoxes);
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

        const that = this;


        function updateSelect(start, end) {
          startTime = start;
          endTime = end;

          if (start === end) return;
          that.allowMouseUpEvent = true;



          let segIndex = that.currentSegment;

        }

        $('#visualizer').mouseup((e) => {

          console.log("CHECK");

          if (!that.allowMouseUpEvent) return;
          that.allowMouseUpEvent = false;

          this.set('currentSegmentStartTime', startTime);
          this.set('currentSegmentEndTime', endTime);
          console.log(startTimeSegments);
          // ee.emit("statechange", "cursor");
          e.preventDefault();
          $('.segment.box').removeClass('current');
        // todo more UI effects
        });

        function getSubSegmentIndex(parentIndex) {
          let queryArray = segArrays[parentIndex];
          let selectedTime = that.currentTime;
          let subIndex = -1;

          queryArray.forEach((times, index) => {
            if(selectedTime>=times.start && selectedTime<=times.end) {
              subIndex = index;
              //todo there will be some funny cases here; need to break once it's done

              //  todo update this function to set selected classes
              // $('.segment.box').removeClass('current');
              // $('.segment.box').eq(index).addClass('current');
              console.log('the subIndex is: ' + subIndex);
            }
          });

          return subIndex;
        }


        function handleDivision() {
          console.log('in handleDivision()');

          const currIndex = that.currentSegment;

          console.log('the current index in handleDivision() is: ' + currIndex);

          let newSegStartTime = startTime;
          let newSegEndTime = endTime;

          let subSegmentIndex = getSubSegmentIndex(currIndex);
          console.log('the subSegmentIndex is: ' + subSegmentIndex);

          segArrays[currIndex].sort((a, b) =>
            parseFloat(a['start']) - parseFloat(b['start'])
          );
          // NEW SEGMENTS'S BOUNDARIES:
          let prevSegStart = segArrays[currIndex][subSegmentIndex]['start'];
          let prevSegEnd = segArrays[currIndex][subSegmentIndex]['end'];

          //todo ignoring the threshold thing for now -> needs discussion

          if (subSegmentIndex >= 0) {
            segArrays[currIndex].splice(subSegmentIndex, 1);
          }



          let newStartTimeObj = {'start': parseFloat(prevSegStart), 'end': parseFloat(newSegStartTime)};
          let newMiddleTimeObj = {'start': parseFloat(newSegStartTime), 'end': parseFloat(newSegEndTime)};
          let newEndTimeObj = {'start': parseFloat(newSegEndTime), 'end': parseFloat(prevSegEnd)};


          segArrays[currIndex].push(newStartTimeObj);
          segArrays[currIndex].push(newMiddleTimeObj);
          segArrays[currIndex].push(newEndTimeObj);

          updateSegments();
        }


        function handleMerging() {
          const currIndex = that.currentSegment;

          let querySegStartTime = startTime;
          let querySegEndTime = endTime;

          let queryTimeObj = {'start': parseFloat(querySegStartTime), 'end': parseFloat(querySegEndTime)};
          let queryIndex = segArrays[currIndex].indexOf(queryTimeObj);

          // todo delete the required segment
          if (queryIndex > -1) {
            segArrays[currIndex].splice(queryIndex, 1);
            console.log('Element ' + queryIndex + ' successfully deleted');
          }

          updateSegments();
        }

        function updateSegments() {
          const currIndex = that.currentSegment;

          console.log('the current index in updateSegments is : ' + currIndex);


          //todo remove previous all children of the segments

          segElements[currIndex].forEach((el) => {
            el.parentNode.removeChild(el);
          });

        //  emptying the earlier segElements[currIndex] array
          segElements[currIndex] = [];

        //  todo first sort the elements so that segment names are in order
          segArrays[currIndex].sort((a, b) =>
            parseFloat(a['start']) - parseFloat(b['start'])
          );

          console.log(segArrays[currIndex]);

          segArrays[currIndex].forEach((startEndObj, index) => {
            addSegment(currIndex, index, startEndObj);
          })
        }

        function addSegment(parentIndex, subIndex, startEndObj) {
          let segmentBox = document.createElement('div');
          segmentBox.classList.add("segment", "box");
          segmentBox.innerHTML = (parseInt(parentIndex) + 1).toString() + "." + (parseInt(subIndex) + 1).toString();
          segmentBox.style.left = `${timePixel * parseFloat(startEndObj['start'])}px`;
          segmentBox.style.width = `${timePixel * (parseFloat(startEndObj['end']) - parseFloat(startEndObj['start']))}px`;

          //todo push new DOM element in the corresponding array
          segElements[parentIndex].push(segmentBox);

          segmentBox.addEventListener("click", () => {
            ee.emit("select", parseFloat(startEndObj['start']), parseFloat(startEndObj['end']));
            this.set('currentSegmentStartTime', parseFloat(startEndObj['start']));
            this.set('currentSegmentEndTime', parseFloat(startEndObj['end']));
          });

          $('#segment-container').append(segmentBox);
          console.log('the length is: ' + segElements[parentIndex].length);
        }





























        // $('#visualizer').mousedown((e) => {
        //
        //
        //
        //
        //   e.preventDefault();
        //   ee.emit("statechange", "select");
        //
        //
        // });

        ee.on("select", updateSelect);
        ee.on("timeupdate", updateTime);
        ee.on('finished', function () {
          console.log("The cursor has reached the end of the selection !");

        });
        let keys = {};
        $(document).keydown(function (e) {
          if(e.which!==18)
          {keys[e.which] = true}
          if(e.which  === 69 && keys[17]) {
            e.preventDefault();
          }
          else if(e.which  === 75 && keys[17] || e.which === 74 & keys[17]) {
            e.preventDefault();
          }
          else if(e.which === 68 &&  keys[17]) {
            e.preventDefault();
            console.log('Ctrl + D');
          }

          else if(e.which === 77 &&  keys[17]) {
            e.preventDefault();
            console.log('Ctrl + M');
          }

          handleKeys();
        });
        $(document).keyup(function (e) {
          delete keys[e.which];
          handleKeys();

        });
        let  moveToNextSegment = () => {
          let currentSegmentIndex = findCurrentSegment();
          //console.log(currentSegmentIndex);
          let nextSegment = this.segmentTimes[currentSegmentIndex + 1];
          if(nextSegment) {
            ee.emit('pause');
            ee.emit('select', parseFloat(nextSegment['start']), parseFloat(nextSegment['end']));
            $('.playlist-tracks' ).scrollLeft($(this.segmentBoxList[currentSegmentIndex+1]).position().left-100);
            if(this.fileNames && this.fileNames.length) {
              for(let i=0; i< this.fileNames.length; i++) {
                if(`Segment :: ${currentSegmentIndex+2}.wav` === this.fileNames[i].iname) {
                  $(this.audioFileArray[i]).show();
                  $(this.fileNames[i]).show();
                }
                else {
                  $(this.audioFileArray[i]).hide();
                  $(this.fileNames[i]).hide();
                }
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
            if(this.fileNames && this.fileNames.length) {
              for (let i = 0; i < this.fileNames.length; i++) {
                if (`Segment :: ${currentSegmentIndex}.wav` === this.fileNames[i].iname) {
                  $(this.audioFileArray[i]).show();
                  $(this.fileNames[i]).show();
                } else {
                  $(this.audioFileArray[i]).hide();
                  $(this.fileNames[i]).hide();
                }
              }
            }
          }
        };
        let findCurrentSegment = () => {
          var result = -1;
          this.segmentTimes.forEach((segment, i) => {
            // console.log(note, i);
            if(this.currentTime >= parseFloat(segment['start']) && this.currentTime <= parseFloat(segment['end'])) {
              //console.log("found!",segment, i);
              result = i;
            }
          });
          return result;
        };


        function handleKeys() {
          //console.log(keys);
          if(keys[17] && keys[32]) {
            ee.emit('play');
          }
          else if(keys[17] && keys[190]) {
            ee.emit('pause');
          }
          else if(keys[17] && keys[37]) {
            // console.log(playlist);
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
          else if(keys[17] && keys[68]) {
            handleDivision();
          }

          else if(keys[17] && keys[77]) {
            handleMerging();
          }
        }
      });
    }
  },
});
