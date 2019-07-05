import Component from '@ember/component';
import {computed} from '@ember/object';
import ENV from 'transcriptor/config/environment';
import {inject as service} from '@ember/service';
import WaveformPlaylist from 'npm:waveform-playlist';

export default Component.extend({
  notify: service(),
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
  currentSegmentLabel: null,
  currentSegmentEndTime: null,
  currentSubSegment: null,
  playlist: null,
  segmentTimes: [],
  segmentBoxList: [],
  isLooping : false,
  allowMouseUpEvent: false,
  playlistCursor: 0,
  reSpokenKeys: null,
  metaSegment: {},
  globalRecordIndex: null,
  testVar: null,
  totalNoSegs: null,
  totalNoRecordedSegs: null,



  actions: {
    setCurrentSegment(time) {
      this.segmentTimes.forEach((times, index) => {
        if(time>=times.start && time<=times.end) {
          if(this.currentSegment !== index)
            this.set('currentSegment', index);
          // this.set('currentSegmentStartTime', times.start);
          // this.set('currentSegmentEndTime', times.end);
          // $('.segment.box').removeClass('current');
          // $('.segment.box').eq(index).addClass('current');
        }
        this.set('playlistCursor', time);
      });
      // console.log(time);
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
        },

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
          console.log('in the recursive play');
          // console.log(start, end, segment);
          // if (this.currentSegment!==segment) {
          //   return;
          // }
          ee.emit('play',start,end);
          // updateSelected();
        };

        // let playStatus = false;

        // if (playStatus && this.playlistCursor === endTime) {
        //   recursivePlay(startTime, endTime, this.currentSegment);
        // }

        let duration = parseFloat(playlist.duration);
        $('body').on("click", ".btn-play",  ()=>{
          console.log('clicked on play');
          // console.log(startTime, endTime, this.currentSegment);
          // updateSelected();
          if (startTime === endTime) {
                let tempEndTime = globalStartTimeSegments[globalStartTimeSegments.length - 1].end;
                recursivePlay(startTime, tempEndTime, this.currentSegment);
          } else {
            recursivePlay(startTime, endTime, this.currentSegment);
          }
          // playStatus = true;
          // console.log(startTime, endTime, that.playlistCursor);
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

        $('body').on("click", ".record", ()=> {
            ee.emit("pause");
            console.log('weired test');
            console.log(that.recordedSegs);
        });

        $('.playlist-tracks').on('scroll', (e) => {
          $('#outer-segment-container').scrollLeft($(e.target).scrollLeft());
        });
        $('#outer-segment-container').on('scroll', (e) => {
          $('.playlist-tracks' ).scrollLeft($(e.target).scrollLeft());
        });
        let waveFormOuterWidth = $('.playlist-overlay').outerWidth();
        let timePixel =(parseFloat(waveFormOuterWidth/duration).toFixed(2));

        let DIVISION_THRESHOLD = 1;

        let segmentBoxes = [];
        $('#segment-container').css({"width": waveFormOuterWidth + "px"});
        let startTimeSegments = [];
        let globalStartTimeSegments = [];
        let segArrays = {};
        let segElements = {};
        let segWrappers = [];
        this.set('totalNoSegs', this.data.segmentsList.length);
        this.data.segmentsList.forEach((segment, index) => {
          //console.log(segment._attributes);
          startTimeSegments.push({'start' :parseFloat(segment._attributes.stime), 'end': parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur)});
          globalStartTimeSegments.push({'start' :parseFloat(segment._attributes.stime), 'end': parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur)});

          let segmentWrapper = document.createElement('div');
          segmentWrapper.classList.add("segment-wrapper");

          let segmentBox = document.createElement('div');
          segmentBox.classList.add("segment", "box");
          segmentBox.innerHTML = index+1;
          segmentBox.style.left=`${timePixel*parseFloat(segment._attributes.stime)}px`;
          segmentBox.style.width=`${timePixel*parseFloat(segment._attributes.dur)}px`;
          //console.log(segmentBox.style.width);
          segmentBoxes.push(segmentBox);
          segArrays[index] = [{'start' :parseFloat(segment._attributes.stime), 'end': parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur), 'reSpoken': false}];
          segElements[index] = [segmentBox];

          $(segmentWrapper).append(segmentBox);
          segWrappers.push(segmentWrapper);

          segmentBox.addEventListener("click",  ()=> {
            // ee.emit("select", parseFloat(segment._attributes.stime),parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur));
            // this.set('currentSegmentStartTime', parseFloat(segment._attributes.stime));
            // this.set('currentSegmentEndTime', parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur));
            startTime = parseFloat(segment._attributes.stime);
            endTime = parseFloat(segment._attributes.stime) + parseFloat(segment._attributes.dur);
            updateSelected();


            $('.playlist-tracks' ).scrollLeft($(segmentBox).position().left - 100);
            if(this.fileNames && this.fileNames.length) {
              for(let i = 0; i < this.fileNames.length; i++) {
                console.log(this.fileNames);

                if(`${startTime.toString()}-${endTime.toString()}.wav` === this.fileNames[i].iname) {
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


        this.set('metaSegment', {data: segArrays});


        //console.log(segmentBoxes);
        this.set('segmentTimes', startTimeSegments);
        // segmentBoxes.forEach(segmentBox => {
        //   $('#segment-container').append(segmentBox);
        // });
        segWrappers.forEach(segmentWrapper => {
          $('#segment-container').append(segmentWrapper);
        });
        this.set('segmentBoxList', segmentBoxes);
        //can do stuff with the playlist.
        const updateTime = time => {
          this.set('currentTime', time);
          this.send('setCurrentSegment', time);
        };

        const that = this;

        $('.playlist-overlay').click((el) => {
          let qIndex= - 1;
          globalStartTimeSegments.forEach((el, index) => {
            if ( that.currentTime >= el['start']  && that.currentTime <=  el['end']) {
              qIndex = index;
            }
          });
          $('.segment.box').removeClass('current');
          $('.segment.box').eq(qIndex).addClass('current');
        });

        function updateSelect(start, end) {
          startTime = start;
          endTime = end;

          if (start === end) return;
          that.allowMouseUpEvent = true;



          let segIndex = that.currentSegment;

        }


        // $('#visualizer').mouseup((e) => {
        //
        //   // console.log("CHECK");
        //
        //   if (!that.allowMouseUpEvent) return;
        //   that.allowMouseUpEvent = false;
        //
        //   this.set('currentSegmentStartTime', startTime);
        //   this.set('currentSegmentEndTime', endTime);
        //   // console.log(startTimeSegments);
        //   // ee.emit("statechange", "cursor");
        //   e.preventDefault();
        //   // $('.segment.box').removeClass('current');
        //
        // });


        //todo begins the LOGIC of updating segments based on reSpokenKeys #################
        // if (this.reSpokenKeys === null) {
        this.set('totalNoRecordedSegs', 0);
        // }

        for (const key in this.reSpokenKeys) {
          if (this.reSpokenKeys.hasOwnProperty(key)) {
            const oldSegArray = segArrays[key];
            segArrays[key] = this.reSpokenKeys[key];
            if (this.reSpokenKeys[key].length > 1) {
              updateSegments(true, parseInt(key));
            }

            oldSegArray.forEach((element, indexP) => {
              let queryIndex = -1;

              globalStartTimeSegments.forEach((el, index) => {
                if (el['start'] === element['start'] && el['end'] === element['end']) {
                  queryIndex = index;
                }
              });

              if (queryIndex > -1) {
                globalStartTimeSegments.splice(queryIndex, 1);
              }
            });

            segArrays[key].forEach((element, indexP) => {
              globalStartTimeSegments.push(element);
            });
          }
        }

        globalStartTimeSegments.sort((a,b) => parseFloat(a['start']) - parseFloat(b['start']));


        //todo for adding the recorded classes
        // console.warn('attention');
        // console.log(globalStartTimeSegments);
        // globalStartTimeSegments.forEach((el, index) => {
        //   if (el.reSpoken) {
        //     $('.segment.box').eq(index).addClass(
        //       'recorded-grey'
        //     );
        //   }
        // });

        console.log('I ere');
        console.log(this.reSpokenKeys);

        for (const key in this.reSpokenKeys) {
          if (this.reSpokenKeys.hasOwnProperty(key)) {
            let newSegArray = this.reSpokenKeys[key];
            let rStatus = false;


            newSegArray.forEach((element, indexP) => {
              if (element.reSpoken) {
                console.log(key);

                let queryIndex = -1;


                globalStartTimeSegments.forEach((el, index) => {
                  if (el['start'] === element['start'] && el['end'] === element['end']) {
                    queryIndex = index;
                    console.log(queryIndex);
                  }
                });

                $('.segment.box').eq(queryIndex).addClass(
                  'recorded-grey'
                );
                rStatus = true;
              }
            });
            if (rStatus) {
              this.set('totalNoRecordedSegs', this.get('totalNoRecordedSegs') + 1);
            }
          }
        }

        console.log('is set required');
        console.log(this.totalNoRecordedSegs);




        // this.reSpokenKeys.forEach((el, index) => {
        //   let sTime = parseFloat(el.toString().split("-")[0]);
        //   let eTime = parseFloat(el.toString().split("-")[1]);
        //   let autoSegment = 0;
        //
        //   this.segmentTimes.forEach((times, index) => {
        //     if(sTime>=times.start && eTime<=times.end) {
        //       autoSegment = index
        //     }
        //   });
        //
        //   handleDivision(true, sTime, eTime, autoSegment);
        // });












        //todo end ###########################################################################



        function updateSelected() {
          globalStartTimeSegments.sort((a,b) => parseFloat(a['start']) - parseFloat(b['start']));
          let $children = $('#segment-container').children();
          $children.sort((a, b) => parseFloat($(a).css('left')) - parseFloat($(b).css('left')));
          // console.log($children);
          $children.each(function(){
            $('#segment-container').append(this);
          });
          // console.log(($('#segment-container')));

          let obtainedIndex = -1;

          //todo remove duplicates
          globalStartTimeSegments = globalStartTimeSegments.reduce((acc, current) => {
            const x = acc.find(item => item.start === current.start);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);


          for(var i=0; i < globalStartTimeSegments.length; i++) {
            if (globalStartTimeSegments[i]['start'] === startTime) {
              obtainedIndex = i;
              break;
            }
          }


          $('.segment.box').removeClass('current');
          $('.segment.box').eq(obtainedIndex).addClass('current');
          that.set('globalRecordIndex',  obtainedIndex);
          console.log($('.segment.box'));

          console.log('the obtained index is: ' + obtainedIndex);
          that.set('currentSegmentStartTime', globalStartTimeSegments[obtainedIndex].start);
          that.set('currentSegmentEndTime', globalStartTimeSegments[obtainedIndex].end);
          that.set('currentSegmentLabel',  (($('.segment.box').eq(obtainedIndex))[0].textContent).toString());

          // that.set('currentSegmentLabel',  (($('.segment.box').eq(obtainedIndex))[0].textContent).toString());

          console.log(that.currentSegmentLabel);
          console.log('printing the real label: ' + (($('.segment.box').eq(obtainedIndex))[0].textContent).toString());
          console.log(globalStartTimeSegments[obtainedIndex].start + ' : ' + globalStartTimeSegments[obtainedIndex].end);
          ee.emit("select", parseFloat(globalStartTimeSegments[obtainedIndex].start),parseFloat(globalStartTimeSegments[obtainedIndex].end));



          // console.log('the obtained index is: ' + obtainedIndex);
        }

        function getSubSegmentIndex(parentIndex, auto=false, autoSTime=0) {
          let queryArray = segArrays[parentIndex];
          let selectedTime = that.currentTime;
          let subIndex = -1;

          if (auto) {
            selectedTime = autoSTime;
          }

          queryArray.forEach((times, index) => {
            if(selectedTime>=times.start && selectedTime<=times.end) {
              subIndex = index;
              //todo there will be some funny cases here; need to break once it's done

              //  todo update this function to set selected classes
              // $('.segment.box').removeClass('current');
              // $('.segment.box').eq(index).addClass('current');
              // console.log('the subIndex is: ' + subIndex);
            }
          });

          return subIndex;
        }


        function handleDivision(auto = false, autoStart = 0, autoEnd = 0, autoSegment = 0) {
          // console.log('in handleDivision()');

          let currIndex = that.currentSegment;
          // if (currIndex === null) {
          //   that.notify.error(`Division possible only within a Segment.` );
          // }

          // console.log('the current index in handleDivision() is: ' + currIndex);


          let newSegStartTime = startTime;
          let newSegEndTime = endTime;

          if (auto) {
            newSegStartTime = autoStart;
            newSegEndTime = autoEnd;
            currIndex = autoSegment;

            console.log(newSegStartTime + ' ' + newSegEndTime + ' ' + currIndex);
          }

          try {
            let subSegmentIndex = getSubSegmentIndex(currIndex);
          }
          catch (e) {
            that.notify.error(`Division possible only within a Segment.` );
            return;
          }

          let subSegmentIndex = getSubSegmentIndex(currIndex);
          if (auto) {
            subSegmentIndex = getSubSegmentIndex(currIndex, true, newSegStartTime);
          }
          // console.log('the subSegmentIndex is: ' + subSegmentIndex);

          segArrays[currIndex].sort((a, b) =>
            parseFloat(a['start']) - parseFloat(b['start'])
          );
          // NEW SEGMENTS'S BOUNDARIES:
          try {
            console.log(segArrays);
            console.log(currIndex + ' ' + subSegmentIndex);
            let prevSegStart = segArrays[currIndex][subSegmentIndex]['start'];
          }
          catch (e) {
            that.notify.error(`Division possible only within a Segment.` );
            return;
          }

          let prevSegStart = segArrays[currIndex][subSegmentIndex]['start'];
          let prevSegEnd = segArrays[currIndex][subSegmentIndex]['end'];

          //todo ignoring the threshold thing for now -> needs discussion

          if (subSegmentIndex >= 0) {
            segArrays[currIndex].splice(subSegmentIndex, 1);
          }

          // REMOVING FROM THE GLOBAL ARRAY WHICH WOULD BE USED IN UpdateSelected() method
          let queryTimeObj = {'start': parseFloat(prevSegStart), 'end': parseFloat(prevSegEnd)};
          let queryIndex = -1;
          // console.log('business');
          // console.log(queryTimeObj);
          // console.log(globalStartTimeSegments);
          // console.log('business end');

          globalStartTimeSegments.forEach((el, index) => {
            if (el['start'] === prevSegStart && el['end'] === prevSegEnd) {
              queryIndex = index;

            }
          });


          if (queryIndex > -1) {
            // console.log('DELETED');
            globalStartTimeSegments.splice(queryIndex, 1);
            // console.log('Element ' + queryIndex + ' successfully deleted');
          }
          // END OF REMOVAL ELEMENT


          let newStartTimeObj = {'start': parseFloat(prevSegStart), 'end': parseFloat(newSegStartTime)};
          let newMiddleTimeObj = {'start': parseFloat(newSegStartTime), 'end': parseFloat(newSegEndTime)};
          let newEndTimeObj = {'start': parseFloat(newSegEndTime), 'end': parseFloat(prevSegEnd)};

          //todo handle smaller in the boundary cases

          if (parseFloat(newSegStartTime) - parseFloat(prevSegStart) < DIVISION_THRESHOLD && parseFloat(prevSegEnd) - parseFloat(newSegEndTime)  < DIVISION_THRESHOLD) {
            segArrays[currIndex].push({'start': parseFloat(prevSegStart), 'end': parseFloat(prevSegEnd), 'reSpoken': false});
            globalStartTimeSegments.push({'start': parseFloat(prevSegStart), 'end': parseFloat(prevSegEnd), 'reSpoken': false});

            startTime = parseFloat(prevSegStart);
            endTime = parseFloat(prevSegEnd);

          }

          else if (parseFloat(newSegStartTime) - parseFloat(prevSegStart) < DIVISION_THRESHOLD) {
            segArrays[currIndex].push({'start': parseFloat(prevSegStart), 'end': parseFloat(newSegEndTime), 'reSpoken': false});
            globalStartTimeSegments.push({'start': parseFloat(prevSegStart), 'end': parseFloat(newSegEndTime), 'reSpoken': false});

            segArrays[currIndex].push({'start': parseFloat(newSegEndTime), 'end': parseFloat(prevSegEnd), 'reSpoken': false});
            globalStartTimeSegments.push({'start': parseFloat(newSegEndTime), 'end': parseFloat(prevSegEnd), 'reSpoken': false});

            startTime = parseFloat(prevSegStart);
            endTime = parseFloat(newSegEndTime);
          }

          else if (parseFloat(prevSegEnd) - parseFloat(newSegEndTime)  < DIVISION_THRESHOLD) {
            segArrays[currIndex].push({'start': parseFloat(prevSegStart), 'end': parseFloat(newSegStartTime), 'reSpoken': false});
            globalStartTimeSegments.push({'start': parseFloat(prevSegStart), 'end': parseFloat(newSegStartTime), 'reSpoken': false});

            segArrays[currIndex].push({'start': parseFloat(newSegStartTime), 'end': parseFloat(prevSegEnd), 'reSpoken': false});
            globalStartTimeSegments.push({'start': parseFloat(newSegStartTime), 'end': parseFloat(prevSegEnd), 'reSpoken': false});

            startTime = parseFloat(newSegStartTime);
            endTime = parseFloat(prevSegEnd);
          }

          else {
            segArrays[currIndex].push(newStartTimeObj);
            segArrays[currIndex].push(newMiddleTimeObj);
            segArrays[currIndex].push(newEndTimeObj);

            globalStartTimeSegments.push(newStartTimeObj);
            globalStartTimeSegments.push(newMiddleTimeObj);
            globalStartTimeSegments.push(newEndTimeObj);

            startTime = newMiddleTimeObj.start;
            endTime = newMiddleTimeObj.end;
          }

          if (!auto) {
            updateSegments();
            updateSelected();
          }
          else {
            updateSegments(true, currIndex);
          }
        }


        function handleMerging() {
          const currIndex = that.currentSegment;
          let subSegments = segArrays[currIndex];
          let querySegStartTime = startTime;
          let querySegEndTime = endTime;

          let beginIndex = -1;
          let endIndex = -1;

          let globalBeginIndex = -1;
          let globalEndIndex = -1;

          subSegments.sort((a, b) =>
            parseFloat(a['start']) - parseFloat(b['start'])
          );


          subSegments.forEach((el, index) => {
            if (querySegStartTime >= el.start && querySegStartTime <= el.end) beginIndex = index;
            if (querySegEndTime >= el.start && querySegEndTime <= el.end) endIndex = index;
          });

          console.log(JSON.stringify(subSegments));
          console.log('the indices: ' + beginIndex.toString() + ' ' + endIndex.toString());

          // new merged segment
          let newMergedSegment = {'start': subSegments[beginIndex].start, 'end': subSegments[endIndex].end, 'reSpoken': false};
          console.log('merged Segment: ' + JSON.stringify(newMergedSegment));


          // ##################### Start of deletion from globalStartTimeSegments

          //sorting
          globalStartTimeSegments.sort((a, b) => parseFloat(a['start']) - parseFloat(b['start']));
          //remove duplicates


          globalStartTimeSegments = globalStartTimeSegments.reduce((acc, current) => {
            const x = acc.find(item => item.start === current.start);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          //todo something wrong
          console.log(globalStartTimeSegments);

          //find indices which are to be removed
          globalStartTimeSegments.forEach((el, index) => {
            if (el['start'] === subSegments[beginIndex].start && el['end'] === subSegments[beginIndex].end) {
              globalBeginIndex = index;
            }
          });
          globalStartTimeSegments.forEach((element, index) => {
            if (element.start === subSegments[endIndex].start && element.end === subSegments[endIndex].end) {
              globalEndIndex = index;
            }
          });

          //splice one by one
          for (var j = globalEndIndex; j >= globalBeginIndex; j--) {
            globalStartTimeSegments.splice(j, 1);
          }

          // delete previous segments from segArrays
          for (var i = endIndex; i >= beginIndex; i--) {
            segArrays[currIndex].splice(i, 1);
          }

          console.log('after deleting: ' + JSON.stringify(segArrays[currIndex]));
          // ##################### End of deletion from globalStartTimeSegments


          // ##################### Push new merged segment to both the local and global house0keeping arrays

          segArrays[currIndex].push(newMergedSegment);
          globalStartTimeSegments.push(newMergedSegment);

          // #################### End of pushing of the new segments

          startTime = newMergedSegment.start;
          endTime = newMergedSegment.end;

          updateSegments();
          ee.emit("select", parseFloat(startTime),parseFloat(endTime));
          updateSelected();
        }

        function updateSegments(auto = false, autoSegment = 0) {
          let currIndex = that.currentSegment;

          if (auto) {
            currIndex = autoSegment;
          }

          // console.log('the current index in updateSegments is : ' + currIndex);


          //todo remove previous all children of the segments

          // console.log('segArrays');
          // console.log(segArrays[currIndex]);

          segElements[currIndex].forEach((el) => {
            el.parentNode.removeChild(el);
          });

        //  emptying the earlier segElements[currIndex] array
          segElements[currIndex] = [];

        //  todo first sort the elements so that segment names are in order
          segArrays[currIndex].sort((a, b) =>
            parseFloat(a['start']) - parseFloat(b['start'])
          );

          // console.log(segArrays[currIndex]);

          segArrays[currIndex].forEach((startEndObj, index) => {
            addSegment(currIndex, index, startEndObj);
          });
          if (!auto) {
            $(".submit-update").click();
          }
        }

        let InitialWidthSum;
        let InitialRightPosition;
        let CurrentlyMovedSubElement;
        let InitialLeft;
        let InitialRightWidth;
        let InitialLeftForLeft;
        let leftForNextSeg;

        function addSegment(parentIndex, subIndex, startEndObj) {
          let segmentBox = document.createElement('div');
          segmentBox.classList.add("segment", "box");
          if (segArrays[parentIndex].length < 2) segmentBox.innerHTML = (parseInt(parentIndex) + 1).toString();
          else segmentBox.innerHTML = (parseInt(parentIndex) + 1).toString() + "." + (parseInt(subIndex) + 1).toString();

          segmentBox.style.left = `${timePixel * parseFloat(startEndObj['start'])}px`;
          segmentBox.style.width = `${timePixel * (parseFloat(startEndObj['end']) - parseFloat(startEndObj['start']))}px`;

          // console.log('WIDTHS for each one: ' + `${timePixel * (parseFloat(startEndObj['end']) - parseFloat(startEndObj['start']))}px`);

          // $(segmentBox).css({position: "relative"});
          if (segArrays[parentIndex].length - 1 !== subIndex) {
            $(segmentBox).prepend("<div class = 'resizer'></div>")
              .resizable({
                resizeHeight: false,
                resizeWidthFrom: 'right',
                handleSelector: '',
                onDragStart: function (e, $el, opt) {
                  let subSegmentIndex = parseInt($el[0].textContent.split('.')[1]) - 1;
                  let currSegment = parseInt($el[0].textContent.split('.')[0]) - 1;

                  console.log('The current Segment is: ' + currSegment + '.' + subSegmentIndex);

                  InitialWidthSum = $(segElements[currSegment][subSegmentIndex])[0].getBoundingClientRect().width + $(segElements[currSegment][subSegmentIndex + 1])[0].getBoundingClientRect().width;
                  // InitialRightPosition = $(segElements[currSegment[subSegmentIndex + 1]]).position();
                  CurrentlyMovedSubElement = subSegmentIndex;

                  console.log('The total Width: ' + InitialWidthSum);
                  console.log('Initial Left for next sub-segment (using CSS method): ' + $(segElements[currSegment][subSegmentIndex + 1]).css(['left']).left);
                  console.log('Initial Left for next sub-segment (using Rect() method): ' + $(segElements[currSegment][CurrentlyMovedSubElement + 1])[0].getBoundingClientRect().left);
                  console.log('Initial Width for next Element: ' + $(segElements[currSegment][CurrentlyMovedSubElement + 1])[0].getBoundingClientRect().width);
                  console.log('Initial Left for Left Element (using CSS method): ' + $(segElements[currSegment][subSegmentIndex]).css(["left", "width"]).left);
                  console.log('Initial Left for Left Element (using Rect() method): ' + $(segElements[currSegment][subSegmentIndex])[0].getBoundingClientRect().left);


                  // InitialLeft = $(segElements[currSegment][CurrentlyMovedSubElement + 1])[0].getBoundingClientRect().left;
                  InitialLeft = $(segElements[currSegment][subSegmentIndex + 1]).css(['left']).left;

                  InitialRightWidth = $(segElements[currSegment][subSegmentIndex + 1])[0].getBoundingClientRect().width;
                  // InitialLeftForLeft = $(segElements[currSegment][subSegmentIndex])[0].getBoundingClientRect().left;
                  InitialLeftForLeft = $(segElements[currSegment][subSegmentIndex]).css(["left", "width"]).left;

                  // document.body.style.cursor = "col-resize";

                  // let subSegmentIndex = parseInt($el[0].textContent.split('.')[1]);
                  // console.log($el.children()[0]);
                  // let selector = $el.find('div');
                  // console.log(selector[0]);
                  // manageMovableSide(subSegmentIndex, selector);
                  // console.log('the handler is: ' + opt.handleSelector);
                  return $(e.target).hasClass("resizer");
                },
                onDrag: function (e, $el, newWidth, newHeight, opt) {
                  let subSegmentIndex = parseInt($el[0].textContent.split('.')[1]) - 1;
                  let currSegment = parseInt($el[0].textContent.split('.')[0]) - 1;

                  //todo WIP
                  let pixelDIVISIONTHRESHOLD = timePixel * DIVISION_THRESHOLD;
                  if (newWidth < pixelDIVISIONTHRESHOLD || parseFloat(InitialRightWidth - (parseFloat(parseFloat(InitialLeftForLeft) + newWidth) - parseFloat(InitialLeft))) < pixelDIVISIONTHRESHOLD) {
                    return false;
                  }
                  //todo End of WIP



                  that.set('currentSegment', currSegment);
                  that.set('currentSubSegment', subSegmentIndex);


                  let cssObj = $($el).css(["left", "width"]);
                  console.log('....... Beginning with OnDrag():');
                  console.log(' (for $el) new width that onDrag() gives: ' + newWidth);
                  console.log('new width that onDrag()\'s $el gives using Rect():', parseFloat($($el)[0].getBoundingClientRect().width));
                  console.log('new Width that .CSS gives using $el: ' + cssObj.width);
                  console.log('Left using $el: in CSS' + cssObj.left);
                  console.log('The offset() in $el: ' + JSON.stringify($(segElements[currSegment][subSegmentIndex]).offset()));

                  console.log('Left for Next Seg using Rect(): ' + parseFloat(InitialLeftForLeft + parseFloat($(segElements[currSegment][CurrentlyMovedSubElement])[0].getBoundingClientRect().width)));

                  console.log('newWidth: ' + newWidth);


                  // let leftForNextSeg =  InitialLeftForLeft + parseFloat($(segElements[currSegment][CurrentlyMovedSubElement])[0].getBoundingClientRect().width);
                  leftForNextSeg = parseFloat(parseFloat(InitialLeftForLeft) + newWidth);
                  // let leftForNextSeg =  parseFloat(parseFloat(InitialLeftForLeft) + newWidth);


                  console.log('Left for Next Seg using width that we get from $el from method: ' + leftForNextSeg);
                  let test = newWidth;


                  ee.emit('select', parseFloat(startEndObj.start), parseFloat(leftForNextSeg / timePixel));


                  manageDrag(subSegmentIndex, newWidth, leftForNextSeg, test);
                  //todo WIP
                  // if (newWidth < pixelDIVISIONTHRESHOLD) {
                  //   console.error('IN THE IF');
                  //
                  //   let tempNewWidth = pixelDIVISIONTHRESHOLD;
                  //   $el.width(tempNewWidth);
                  //   let tempLeftForNextSeg = parseFloat(parseFloat(InitialLeftForLeft) + tempNewWidth);
                  //   let currSegment = that.currentSegment;
                  //   let subSegmentIndex = that.currentSubSegment;
                  //
                  //   $(segElements[currSegment][subSegmentIndex + 1]).css({left: tempLeftForNextSeg});
                  //   let newTempRightWidth = parseFloat(InitialRightWidth - (tempLeftForNextSeg - parseFloat(InitialLeft)));
                  //   $(segElements[currSegment][subSegmentIndex + 1]).width(newTempRightWidth);
                  //   return false;
                  //
                  // } else if (parseFloat(InitialRightWidth - (leftForNextSeg - parseFloat(InitialLeft))) < pixelDIVISIONTHRESHOLD) {
                  //   console.error('in the else if');
                  //
                  //   let tempNewWidth = pixelDIVISIONTHRESHOLD;
                  //   $el.width(parseFloat(InitialRightWidth) - pixelDIVISIONTHRESHOLD);
                  //   let tempLeftForNextSeg = parseFloat(parseFloat(InitialLeftForLeft) + parseFloat(InitialRightWidth) - pixelDIVISIONTHRESHOLD);
                  //   let currSegment = that.currentSegment;
                  //   let subSegmentIndex = that.currentSubSegment;
                  //
                  //   $(segElements[currSegment][subSegmentIndex + 1]).css({left: tempLeftForNextSeg});
                  //   let newTempRightWidth = parseFloat(pixelDIVISIONTHRESHOLD);
                  //   $(segElements[currSegment][subSegmentIndex + 1]).width(newTempRightWidth);
                  //   return false;
                  // } else {
                  //   manageDrag(subSegmentIndex, newWidth, leftForNextSeg, test);
                  //   console.warn('in here');
                  // }

                //  todo endWIP
                },
                onDragEnd: function (e, $el, opt) {
                  document.body.style.cursor = "default";
                  let movedObject = segArrays[that.currentSegment][that.currentSubSegment];
                  let affectedObject = segArrays[that.currentSegment][that.currentSubSegment + 1];

                  let movedGlobalIndex = -1;

                  globalStartTimeSegments.forEach((el, index) => {
                    if (el['start'] === movedObject.start && el['end'] === movedObject.end) {
                      movedGlobalIndex = index;
                    }
                  });


                  movedObject.end = parseFloat(leftForNextSeg / timePixel);
                  movedObject.reSpoken = false;

                  affectedObject.start = movedObject.end;
                  affectedObject.reSpoken = false;


                  console.log(movedObject);
                  console.log(affectedObject);

                  console.log('in the drag but before splicing');
                  console.log(segArrays[that.currentSegment]);
                  console.log('subSegIndex: ' + that.currentSubSegment);

                  segArrays[that.currentSegment].splice(that.currentSubSegment + 1, 1);
                  segArrays[that.currentSegment].splice(that.currentSubSegment, 1);
                  globalStartTimeSegments.splice(movedGlobalIndex + 1, 1);
                  globalStartTimeSegments.splice(movedGlobalIndex, 1);

                  console.log('in the drag');
                  console.log(segArrays[that.currentSegment]);


                  segArrays[that.currentSegment].push(movedObject);
                  segArrays[that.currentSegment].push(affectedObject);

                  console.log('after pushing');
                  console.log(segArrays[that.currentSegment]);


                  globalStartTimeSegments.push(movedObject);
                  globalStartTimeSegments.push(affectedObject);

                  startTime = movedObject.start;
                  endTime = movedObject.end;

                  updateSegments();
                  updateSelected();

                  //  todo complete this function
                }
              });
          }
          segElements[parentIndex].push(segmentBox);

          segmentBox.addEventListener("click", () => {
            // ee.emit("select", parseFloat(startEndObj['start']), parseFloat(startEndObj['end']));
            // that.set('currentSegmentStartTime', parseFloat(startEndObj['start']));
            // that.set('currentSegmentEndTime', parseFloat(startEndObj['end']));
            startTime = parseFloat(startEndObj['start']);
            endTime = parseFloat(startEndObj['end']);
            updateSelected();

            $('.playlist-tracks' ).scrollLeft($(segmentBox).position().left - 100);
            if(that.fileNames && that.fileNames.length) {
              for(let i = 0; i < that.fileNames.length; i++) {
                console.log(that.fileNames);

                if(`${startTime.toString()}-${endTime.toString()}.wav` === that.fileNames[i].iname) {
                  $(that.audioFileArray[i]).show();
                  $(that.fileNames[i]).show();
                }
                else {
                  $(that.audioFileArray[i]).hide();
                  $(that.fileNames[i]).hide();
                }
              }
            }
          });

          //tackling the case when it was re-spoken
          if (startEndObj.hasOwnProperty('reSpoken') && startEndObj.reSpoken) {
            $(segmentBox).addClass(
              'recorded-grey'
            );
          }

          // $(segmentBox).resizable({
          //   // handleSelector: ".splitter",
          //   resizeHeight: false
          // });
          $(segWrappers[parentIndex]).append(segmentBox);
        }
        function manageDrag(subSegmentIndex, newWidth, leftForNextSeg, test) {
          let currSegment = that.currentSegment;
          // let newRightElWidth = InitialWidthSum - newWidth;
          let newRightElWidth = parseFloat(InitialRightWidth - (leftForNextSeg - parseFloat(InitialLeft)));
          console.log(' the new Right Width: ' + newRightElWidth);

          // console.log(newWidth + ' ' + newRightElWidth + ' ' + leftForNextSeg);

          //  Apply them to the element
          $(segElements[currSegment][subSegmentIndex + 1]).css({left: leftForNextSeg});
          // $(segElements[currSegment][subSegmentIndex + 1]).width(newRightElWidth);
          $(segElements[currSegment][subSegmentIndex + 1]).width(newRightElWidth);
          let rtest = InitialWidthSum - test;
        }

        //todo may remove this function on clean-up
        function manageMovableSide(subSegmentIndex, selector) {
          const currSegment = that.currentSegment;
          console.log('the  ' + currSegment);
          if (subSegmentIndex + 1 <= segElements[currSegment].length - 1) {
            $(segElements[currSegment][subSegmentIndex + 1]).resizable({
              resizeHeight: false,
              resizeWidth: true,
              resizeWidthFrom: 'left',
              handleSelector: selector,
              onDragStart: function (e, $el, opt) {
                console.log('s');
                // return $(e.target).hasClass("resizer");
              },
              onDragEnd: function (e, $el, opt) {
                $(segElements[currSegment][subSegmentIndex + 1]).resizable({
                  resizeHeight: false,
                  resizeWidthFrom: 'right',
                  handleSelector: '',
                  onDragStart: function (e, $el, opt) {
                    let subSegmentIndex = parseInt($el[0].textContent.split('.')[1]);
                    manageMovableSide(subSegmentIndex);
                    return $(e.target).hasClass("resizer");
                  }
                })
              }
            })
          }
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

        function sleep(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        ee.on('finished', async function () {
          console.log("The cursor has reached the end of the selection !");
          await sleep(10);
          $('.btn-play').click();
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
