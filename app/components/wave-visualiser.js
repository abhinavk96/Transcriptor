import Component from '@ember/component';
import { computed } from '@ember/object';

import WaveformPlaylist from 'npm:waveform-playlist';
export default Component.extend({
  disablePlay: true,
  loadProgress: 0,
  timeMappings: new Object(),
  targetSpan: null,
  allSpans: [],
  isPlaying: false,
  targetSpanIndex: 0,
  isPlayerLoading: false,
  targetSpanStartTime: 0,
  targetSpanEndTime: 0,
  wordLevelHighlighting: true,
  actualTimer: 0,
  timeUpdate: false,
  isStep1Complete: false,
  isStep2Complete:false,
  notes: [],
  currentTargetSpan: computed('actualTimer', function() {
    let closestKey = 0;
    for (var key in this.timeMappings) {
      if (parseFloat(key) < parseFloat(this.actualTimer)) {

        closestKey++;
      }
      else {
        // console.log(key, this.actualTimer);

        break;
      }
    }
    console.log(closestKey, this.timeMappings);
    return closestKey;

  }),
  currentSpan:  computed('actualTimer', 'currentTargetSpan', function(){
    if(this.wordLevelHighlighting) {
      this.set('currentTimer', this.actualTimer);
      console.log(this.currentTimer, this.targetSpanStartTime, this.targetSpanEndTime);
      this.set('timeUpdate', true);

      if (this.currentTimer >= this.targetSpanStartTime && this.currentTimer <= this.targetSpanEndTime) {
       let duplicates = document.getElementsByClassName('currentWord');
       if(duplicates.length> 1) {
         for(var i=0; i<duplicates.length; i++) {
           $(duplicates[i]).removeClass('currentWord');
         }
       }
        $(`#${this.targetSpan}`).addClass('currentWord');
        // console.log('encountetred! encountered!', this.targetSpan);
      } else if (this.currentTimer >= this.targetSpanEndTime) {

        $(`#${this.targetSpan}`).removeClass('currentWord');
        let nextSpan = this.targetSpanIndex + 1;
        this.set('targetSpanIndex', nextSpan);
        console.log('new target:', nextSpan);

        if (this.allSpans[nextSpan]) {
          this.set('targetSpanStartTime', this.allSpans[nextSpan].data('stime'));
          this.set('targetSpanEndTime', this.allSpans[nextSpan].data('etime'));
          this.set('targetSpan', `o-${nextSpan}`);
          if (this.currentTimer >= this.targetSpanEndTime) {

            $(`#${this.targetSpan}`).addClass('currentWord');

          }
        }
      }
    }

  }),
  didInsertElement(){
    var _this = this;
    var $container = $("body");
  // .playlist .annotations .annotations-text .annotation span



    $container.on("dragenter", ".track-drop", function (e) {
      e.preventDefault();
      e.target.classList.add("disabled");
    });

    $container.on("dragover", ".track-drop", function (e) {
      e.preventDefault();
    });

    $container.on("dragleave", ".track-drop", function (e) {
      e.preventDefault();
      e.target.classList.remove("disabled");
    });

    $container.on("drop", ".track-drop", e => {
      e.preventDefault();
      e.target.classList.remove("disabled");

      var dropEvent = e.originalEvent;

      for (var i = 0; i < dropEvent.dataTransfer.files.length; i++) {
        // ee.emit("newtrack", dropEvent.dataTransfer.files[i]);
        console.log('File dropped successfully');
        console.log(dropEvent.dataTransfer.files[i]);
        let file = dropEvent.dataTransfer.files[i]
        this.set('audioFile', file);
        this.send('loadWaveFile', this.get('audioFile'), this.get('notes'));
        // _this.set('sourceAudioFile', dropEvent.dataTransfer.files[i]);
      }
    });

// transcription drop
    $container.on("dragenter", ".transcription-drop", function (e) {
      e.preventDefault();
      e.target.classList.add("disabled");
    });

    $container.on("dragover", ".transcription-drop", function (e) {
      e.preventDefault();
    });

    $container.on("dragleave", ".transcription-drop", function (e) {
      e.preventDefault();
      e.target.classList.remove("disabled");
    });

    $container.on("drop", ".transcription-drop", function (e) {
      e.preventDefault();
      e.target.classList.remove("disabled");

      var dropEvent = e.originalEvent;
      const file = dropEvent.dataTransfer.files[0];
      let reader = new FileReader();
      reader.onload = function (e) {
        // get file content
        var notes = JSON.parse(e.target.result);
        console.log(notes);
        _this.set('notes', notes);
        _this.set('isStep1Complete', true);


      }
      reader.readAsText(file);

      // for (var i = 0; i < dropEvent.dataTransfer.files.length; i++) {
      //   ee.emit("newtrack", dropEvent.dataTransfer.files[i]);
      // }
    });


  },
  actions:{ loadWaveFile(audioFile, notes) {
      this.set('isPlayerLoading', true);
      var actions = [
        {
          class: '.red.minus.icon',
          title: 'Reduce annotation end by 0.010s',
          action: (annotation, i, annotations, opts) => {
            var next;
            var delta = 0.010;
            annotation.end -= delta;

            if (opts.linkEndpoints) {
              next = annotations[i + 1];
              next && (next.start -= delta);
            }
          }
        },
        {
          class: '.green.plus.icon.button',
          title: 'Increase annotation end by 0.010s',
          action: (annotation, i, annotations, opts) => {
            var next;
            var delta = 0.010;
            annotation.end += delta;

            if (opts.linkEndpoints) {
              next = annotations[i + 1];
              next && (next.start += delta);
            }
          }
        },
        {
          class: '.red.scissors',
          title: 'Split annotation in half',
          action: (annotation, i, annotations) => {
            const halfDuration = (annotation.end - annotation.start) / 2;

            annotations.splice(i + 1, 0, {
              id: 'test',
              start: annotation.end - halfDuration,
              end: annotation.end,
              lines: ['----'],
              lang: 'en',
            });

            annotation.end = annotation.start + halfDuration;
          }
        },
        {
          class: 'fa.fa-trash',
          title: 'Delete annotation',
          action: (annotation, i, annotations) => {
            annotations.splice(i, 1);
          }
        },
        {
          class: '.pencil.icon',
          title: 'Edit annotation',
          action: (annotation, i, annotations) => {
            console.log(annotations, i);
            document.getElementsByClassName("annotation-lines")[i].focus();
          }
        }
      ];

      var playlist = WaveformPlaylist.init({
        samplesPerPixel: 1000,
        waveHeight: 100,
        // isAutomaticScroll: true,
        container: document.getElementById("playlist"),
        state: 'cursor',
        colors: {
          waveOutlineColor: 'black',
          timeColor: 'grey',
          fadeColor: 'black'
        },
        timescale: true,
        controls: {
          // show: true, //whether or not to include the track controls
          width: 200 //width of controls in pixels
        },
        annotationList: {
          annotations: notes,
          controls: actions,
          editable:  true,
          isContinuousPlay: false,
          linkEndpoints: true
        },
        seekStyle : 'line',
        zoomLevels: [100, 500, 1000, 3000, 5000],
        // isAutomaticScroll: true,
        options: {
          isAutomaticScroll: true
        }
      });
      console.log('playlist defined', playlist);

      var _this = this;
      playlist.load([
        {
          "src": audioFile,
          "name": "Vocals",
          "fadeIn": {
            "duration": 0.5
          },
          "fadeOut": {
            "duration": 0.5
          },
          "cuein": 0,
          // "cueout": 14.5,
          "customClass": "vocals",
          "waveOutlineColor": 'white'
        }
      ]).then(function () {
        //can do stuff with the playlist.
        _this.set('isPlayerLoading', false);
        //initialize the WAV exporter.
        console.log('Player initialised successfully.')
        playlist.initExporter();
        var ee = playlist.getEventEmitter();
        var $container = $("body");
        var $timeFormat = $container.find('.time-format');
        var $audioStart = $container.find('.audio-start');
        var $audioEnd = $container.find('.audio-end');
        var $time = $container.find('.audio-pos');

        var format = "thousandths";
        var startTime = 0;
        var endTime = 0;
        var audioPos = 0;
        var downloadUrl = undefined;
        var isLooping = false;
        var playoutPromises;

        function toggleActive(node) {
          var active = node.parentNode.querySelectorAll('.active');
          var i = 0, len = active.length;

          for (; i < len; i++) {
            active[i].classList.remove('active');
          }

          node.classList.toggle('active');
        }

        function cueFormatters(format) {

          function clockFormat(seconds, decimals) {
            var hours,
              minutes,
              secs,
              result;

            hours = parseInt(seconds / 3600, 10) % 24;
            minutes = parseInt(seconds / 60, 10) % 60;
            secs = seconds % 60;
            secs = secs.toFixed(decimals);

            result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (secs < 10 ? "0" + secs : secs);

            return result;
          }

          var formats = {
            "seconds": function (seconds) {
              return seconds.toFixed(0);
            },
            "thousandths": function (seconds) {
              return seconds.toFixed(3);
            },
            "hundredths": function (seconds) {
              return seconds.toFixed(2);
            },
            "hh:mm:ss": function (seconds) {
              return clockFormat(seconds, 0);
            },
            "hh:mm:ss.u": function (seconds) {
              return clockFormat(seconds, 1);
            },
            "hh:mm:ss.uu": function (seconds) {
              return clockFormat(seconds, 2);
            },
            "hh:mm:ss.uuu": function (seconds) {
              return clockFormat(seconds, 3);
            }
          };

          return formats[format];
        }

        function updateSelect(start, end) {
          // console.log('called');
          if (start < end) {
            $('.btn-trim-audio').removeClass('disabled');
            $('.btn-loop').removeClass('disabled');
          } else {
            $('.btn-trim-audio').addClass('disabled');
            $('.btn-loop').addClass('disabled');
          }

          $audioStart.val(cueFormatters(format)(start));
          $audioEnd.val(cueFormatters(format)(end));

          startTime = start;
          endTime = end;
          let currentTargetSpan = _this.currentTargetSpan;
          console.log(currentTargetSpan);
          _this.set('targetSpan', _this.allSpans[currentTargetSpan].attr('id'));
          _this.set('targetSpanStartTime', _this.allSpans[currentTargetSpan].data('stime').toFixed(3));
          _this.set('targetSpanEndTime', _this.allSpans[currentTargetSpan].data('etime').toFixed(3));
          _this.set('targetSpanIndex', currentTargetSpan);
        }

        function updateTime(time) {
          $time.val(cueFormatters(format)(time));
          // console.log(cueFormatters(format)(time));
          _this.set('actualTimer', cueFormatters(format)(time));


          audioPos = time;
        }

        updateSelect(startTime, endTime);
        updateTime(audioPos);


        /*
        * Code below sets up events to send messages to the playlist.
        */
// $container.on("click", ".btn-playlist-state-group", function() {
//   //reset these for now.
//   $('.btn-fade-state-group').addClass('hidden');
//   $('.btn-select-state-group').addClass('hidden');

//   if ($('.btn-select').hasClass('active')) {
//     $('.btn-select-state-group').removeClass('hidden');
//   }

//   if ($('.btn-fadein').hasClass('active') || $('.btn-fadeout').hasClass('active')) {
//     $('.btn-fade-state-group').removeClass('hidden');
//   }
// });

        $container.on("click", ".transcriptor", function (word) {
          // isLooping = false;
          // ee.emit("rewind");
          let wordStartTime = $(word.target).data('stime');
          if(wordStartTime) {
            ee.emit("select", wordStartTime, wordStartTime);
            // ee.emit("play");
            console.log('word clicked', $(word.target).data('stime'));

          }
        });

        $container.on("click", ".btn-annotations-download", function () {
          ee.emit("annotationsrequest");
        });

        $container.on("click", ".btn-loop", function () {
          isLooping = true;
          playoutPromises = playlist.play(startTime, endTime);
        });

        $container.on("click", ".btn-play", function () {
          ee.emit("play");
          _this.toggleProperty('isPlaying');

        });

        $container.on("click", ".btn-pause", function () {
          isLooping = false;
          ee.emit("pause");
        });

        $container.on("click", ".btn-stop", function () {
          isLooping = false;
          ee.emit("stop");
        });

        $container.on("click", ".btn-rewind", function () {
          isLooping = false;
          ee.emit("rewind");
        });

        $container.on("click", ".btn-fast-forward", function () {
          isLooping = false;
          ee.emit("fastforward");
        });

        $container.on("click", ".btn-clear", function () {
          isLooping = false;
          ee.emit("clear");
        });

        $container.on("click", ".btn-record", function () {
          ee.emit("record");
        });

//track interaction states
        $container.on("click", ".btn-cursor", function () {
          ee.emit("statechange", "cursor");
          toggleActive(this);
        });

        $container.on("click", ".btn-select", function () {
          console.log('selection mode');
          ee.emit("statechange", "select");
          toggleActive(this);
        });

        $container.on("click", ".btn-shift", function () {
          ee.emit("statechange", "shift");
          toggleActive(this);
        });

        $container.on("click", ".btn-fadein", function () {
          ee.emit("statechange", "fadein");
          toggleActive(this);
        });

        $container.on("click", ".btn-fadeout", function () {
          ee.emit("statechange", "fadeout");
          toggleActive(this);
        });


//fade types
        $container.on("click", ".btn-logarithmic", function () {
          ee.emit("fadetype", "logarithmic");
          toggleActive(this);
        });

        $container.on("click", ".btn-linear", function () {
          ee.emit("fadetype", "linear");
          toggleActive(this);
        });

        $container.on("click", ".btn-scurve", function () {
          ee.emit("fadetype", "sCurve");
          toggleActive(this);
        });

        $container.on("click", ".btn-exponential", function () {
          ee.emit("fadetype", "exponential");
          toggleActive(this);
        });

//zoom buttons
        $container.on("click", ".btn-zoom-in", function () {
          ee.emit("zoomin");
          console.log('you clicked zoom');
        });

        $container.on("click", ".btn-zoom-out", function () {
          ee.emit("zoomout");

        });

        $container.on("click", ".btn-trim-audio", function () {
          ee.emit("trim");
        });

        $container.on("click", ".btn-info", function () {
          console.log(playlist.getInfo());
        });

        $container.on("click", ".btn-download", function () {
          ee.emit('startaudiorendering', 'wav');
        });

        $container.on("click", ".btn-seektotime", function () {
          var time = parseInt(document.getElementById("seektime").value, 10);
          ee.emit("select", time, time);
        });

        $container.on("change", ".select-seek-style", function (node) {
          playlist.setSeekStyle(node.target.value);
        });

//track drop

        $container.on("change", ".time-format", function (e) {
          format = $timeFormat.val();
          ee.emit("durationformat", format);

          updateSelect(startTime, endTime);
          updateTime(audioPos);
        });

        $container.on("input change", ".master-gain", function (e) {
          ee.emit("mastervolumechange", e.target.value);

        });

        $container.on("change", ".continuous-play", function (e) {
          ee.emit("continuousplay", $(e.target).is(':checked'));
        });

        $container.on("change", ".link-endpoints", function (e) {
          ee.emit("linkendpoints", $(e.target).is(':checked'));
        });

        $container.on("change", ".automatic-scroll", function (e) {
          ee.emit("automaticscroll", $(e.target).is(':checked'));
        });

        function displaySoundStatus(status) {
          $(".sound-status").html(status);
        }

        function displayLoadingData(data) {
          var info = $("<div/>").append(data);
          $(".loading-data").append(info);

        }

        function displayDownloadLink(link) {
          var dateString = (new Date()).toISOString();
          var $link = $("<a/>", {
            'href': link,
            'download': 'waveformplaylist' + dateString + '.wav',
            'text': 'Download mix ' + dateString,
            'class': 'btn btn-small btn-download-link'
          });

          $('.btn-download-link').remove();
          $('.btn-download').after($link);
        }


        /*
        * Code below receives updates from the playlist.
        */
        ee.on("select", updateSelect);

        ee.on("timeupdate", updateTime);

        ee.on("mute", function (track) {
          displaySoundStatus("Mute button pressed for " + track.name);
        });

        ee.on("solo", function (track) {
          displaySoundStatus("Solo button pressed for " + track.name);
        });

        ee.on("volumechange", function (volume, track) {
          displaySoundStatus(track.name + " now has volume " + volume + ".");
        });

        ee.on("mastervolumechange", function (volume) {
          displaySoundStatus("Master volume now has volume " + volume + ".");
        });


        var audioStates = ["uninitialized", "loading", "decoding", "finished"];

        ee.on("audiorequeststatechange", function (state, src) {
          var name = src;

          if (src instanceof File) {
            name = src.name;
          }

          displayLoadingData("Track " + name + " is in state " + audioStates[state]);
        });

        ee.on("loadprogress", function (percent, src) {
          var name = src;

          if (src instanceof File) {
            name = src.name;
          }

          displayLoadingData("Track " + name + " has loaded " + percent + "%");
          percent = parseFloat(percent);
          percent = (percent > 10 ? percent - 10 : percent);
          _this.set('loadProgress', percent);

        });

        ee.on("audiosourcesloaded", function () {
          displayLoadingData("Tracks have all finished decoding.");
          _this.set('loadProgress', 98);

        });

        ee.on("audiosourcesrendered", function () {
          displayLoadingData("Tracks have been rendered");
          _this.set('loadProgress', 100);

        });

        ee.on('audiorenderingfinished', function (type, data) {
          if (type == 'wav') {
            if (downloadUrl) {
              window.URL.revokeObjectURL(downloadUrl);
            }

            downloadUrl = window.URL.createObjectURL(data);
            displayDownloadLink(downloadUrl);
          }
        });

        ee.on('finished', function () {
          console.log("The cursor has reached the end of the selection !");

          if (isLooping) {
            playoutPromises.then(function () {
              playoutPromises = playlist.play(startTime, endTime);
            });
          }
        });

        ee.on("statechange", function (state) {
          console.log("State " + state);
        });
      })
        .catch(e => {
          console.log(e)
        });

      var re = new RegExp('&lt;', 'g');
      var re2 = new RegExp('&gt;', 'g');
      var annotationLines = $('.annotation-lines');
      let allSpans = [];
      // var timeMappings = new Object();
      // console.log(annotationLines);
      annotationLines.each(index => {
        annotationLines[index].innerHTML = annotationLines[index].innerHTML.replace(re, '<').replace(re2, '>')
        var parser = new DOMParser();
        var htmlDoc = parser.parseFromString(annotationLines[index].innerHTML, 'text/html');
        var spans = $(htmlDoc.getElementsByClassName('transcriptor'));
        spans.each(index => {
          let currentSpan = $(spans[index]);
          _this.timeMappings[currentSpan.data('stime').toFixed(3)] = currentSpan;
          // _this.timeMappings[currentSpan.data('etime').toFixed(3)] = 0;
           allSpans.push(currentSpan);
        });
      });
      _this.set('allSpans', allSpans);
      console.log(_this.timeMappings);
      _this.set('targetSpan', _this.allSpans[0].attr('id'));
      _this.set('targetSpanStartTime', _this.allSpans[0].data('stime').toFixed(3));
      _this.set('targetSpanEndTime', _this.allSpans[0].data('etime').toFixed(3));
      _this.set('targetSpanIndex', 0);
      console.log(_this.targetSpan);
      let previousTimer = _this.actualTimer;
      $('.annotation-lines').on('mousedown', function(event) {
// do your magic
        if(this == document.activeElement){

        }
        else {
          event.preventDefault();
        }
      });
      $('.annotation').hover(function() {
       $($(this).children()[4]).css("visibility","visible");
      }, function() {
        $($(this).children()[4]).css("visibility","hidden");
      });
      // console.log(_this.targetSpan.data('stime'));

      //temporarily disable word highlighting
      // setInterval(function(){
      //   if(_this.isPlaying){
      //     // if(_this.timeUpdate && previousTimer === _this.actualTimer) {
      //     //   _this.set('timeUpdate', false);
      //     // }
      //     // if(!_this.timeUpdate) {
      //       _this.set('currentTimer', parseFloat(_this.currentTimer) + 0.01);
      //       console.log('incremented');
      //     // }
      //     console.log(_this.currentTimer);
      //     if(_this.currentTimer >= _this.targetSpanStartTime && _this.currentTimer <= _this.targetSpanEndTime) {
      //       $(`#${_this.targetSpan}`).addClass('currentWord');
      //       console.log('encountetred! encountered!', _this.targetSpan);
      //     }
      //     else if(_this.currentTimer >= _this.targetSpanEndTime) {
      //       $(`#${_this.targetSpan}`).removeClass('currentWord');
      //       let nextSpan = _this.targetSpanIndex + 1;
      //       _this.set('targetSpanIndex', nextSpan);
      //       console.log('new target:', nextSpan);
      //       if(_this.allSpans[nextSpan]) {
      //         _this.set('targetSpanStartTime', _this.allSpans[nextSpan].data('stime'));
      //         _this.set('targetSpanEndTime', _this.allSpans[nextSpan].data('etime'));
      //         _this.set('targetSpan', `o-${nextSpan}`);
      //       }
      //     }
      //     // if(_this.timeUpdate) {
      //     // _this.set('timeUpdate', false);
      //     // }
      //     // previousTimer = this.actualTimer;
      //   }
      //
      //
      // },10);
    }},
  keyDown(key) {
    if(key.which === 9) {
      key.preventDefault();
    }
    console.log(key.which);
  },
  keyPress(evt) {
    console.log(evt.which);
    if(evt.which === 112) {
      if ( $('.annotation-lines:focus').length > 0 ) {
        console.log('simple key press', $('.annotation-lines:focus'));
      }
      else {
        console.log('play', $('.annotation-lines:focus'));
        // evt.preventDefault();
      }
      console.log('play', $('.annotation-lines:focus'));

    }
  }
});
