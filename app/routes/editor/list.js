import Route from '@ember/routing/route';
import convert from 'npm:xml-js'
import { inject as service } from '@ember/service';
export default Route.extend({
  beforeModel() {
    $(document).add('*').off();
  },
  async model(params) {
    const transcription = await this.store.findRecord('transcription', params.transcription_id);
    const rawXML = transcription.rawXml;
    let xmlSerializer = new XMLSerializer()
    // console.log(xmlSerializer.serializeToString(rawXML.documentElement));

    // var xml = xmlSerializer.serializeToString(rawXML.documentElement);
    var xml = rawXML;
    // console.log(notes);
    var json = convert.xml2json(xml, {compact: true, spaces: 4});
    // console.log(json);

    var obj = JSON.parse(json);
    // console.log(obj);
    let segmentsList = obj.AudioDoc.SegmentList.SpeechSegment;
    let notes = [];
    let spanIndex = 0;
    function getColor(score) {
      if(parseFloat(score) < 0.7) {
        return 'red';
      }
      else {
        return '';
      }
    }
    if (!segmentsList.length) {
      segmentsList= [segmentsList];
    }
    segmentsList = segmentsList.sort(function(a,b) {
      return (parseFloat(a['_attributes']['stime']) - parseFloat(b['_attributes']['stime']));
    });
    segmentsList.forEach(function(segment) {
      // console.log(segment.Word.length);
      let sentence = segment.Word;
      if (sentence.length) {
        //handle sentences
        sentence = sentence.sort(function (a, b) {
          return (parseFloat(a['_attributes']['stime']) - parseFloat(b['_attributes']['stime']));
        });
        let line = "";
        sentence.forEach(function(word) {
          // console.log("Start Time", word['_attributes']['stime']);
          line = `${line} <span class='transcriptor ${getColor(word['_attributes']['score'])}' id = 'o-${spanIndex++}' data-stime='${parseFloat(word['_attributes']['stime'])}' data-etime='${parseFloat(word['_attributes']['stime']) + parseFloat(word['_attributes']['dur'])}'>${word['_text']}</span>`;
        });
        // based on start and end times of words
        // o = {begin: sentence[0]['-stime'], children: [], end: String((parseFloat(sentence[sentence.length-1]['-stime'])+ parseFloat(sentence[sentence.length-1]['-dur']))), id: notes.length, language: 'eng', lines: [line] }
        let o = {begin: segment['_attributes']['stime'], speaker: segment['_attributes']['spkrid'], children: [], end: String((parseFloat(segment['_attributes']['stime'])+ parseFloat(segment['_attributes']['dur']))), id: String(notes.length), language: 'eng', lines: [line] };

        notes.push(o);
      }
      else {
        //handle single word sentences
        //based on start and end times of words
        // o = {begin: sentence['-stime'], children: [], end: String((parseFloat(sentence['-stime'])+ parseFloat(sentence['-dur']))), id: notes.length, language: 'eng', lines: [sentence['#text']] }
        let line = `<span class='transcriptor ${getColor(sentence['_attributes']['score'])}' id = 'o-${spanIndex++}' data-stime='${parseFloat(sentence['_attributes']['stime'])}' data-etime='${parseFloat(sentence['_attributes']['stime']) + parseFloat(sentence['_attributes']['dur'])}'>${sentence['_text']}</span>`
        let o = {begin: segment['_attributes']['stime'], speaker: segment['_attributes']['spkrid'], children: [], end: String((parseFloat(segment['_attributes']['stime'])+ parseFloat(segment['_attributes']['dur']))), id: String(notes.length), language: 'eng', lines: [line] };
        notes.push(o);
      }


    });

    return {
      notes: notes,
      audio : transcription.fileAddress,
      transcription: transcription
    }
  }
});
