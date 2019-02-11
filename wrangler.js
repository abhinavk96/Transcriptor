var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('sample-input.json', 'utf8'));
console.log(obj);
let segmentsList = obj.AudioDoc.SegmentList.SpeechSegment;
let notes = [];

function getColor(score) {
  if (parseFloat(score) > 0.7) {
    return 'green';
  }
  else if(parseFloat(score) < 0.3) {
    return 'red';
  }
  else {
    return 'black';
  }
}
segmentsList.forEach(function(segment) {
  console.log(segment.Word.length);
  let sentence = segment.Word;
  if (sentence.length) {
    //handle sentences
    let line = "";
    sentence.forEach(function(word) {
      line = `${line} <span class='transcriptor' style='color:${getColor(word['-score'])}'>${word['#text']}</span>`;
    });
    // based on start and end times of words
    // o = {begin: sentence[0]['-stime'], children: [], end: String((parseFloat(sentence[sentence.length-1]['-stime'])+ parseFloat(sentence[sentence.length-1]['-dur']))), id: notes.length, language: 'eng', lines: [line] }
    o = {begin: segment['-stime'], children: [], end: String((parseFloat(segment['-stime'])+ parseFloat(segment['-dur']))), id: String(notes.length), language: 'eng', lines: [line] };

    notes.push(o);
  }
  else {
    //handle single word sentences
    //based on start and end times of words
    // o = {begin: sentence['-stime'], children: [], end: String((parseFloat(sentence['-stime'])+ parseFloat(sentence['-dur']))), id: notes.length, language: 'eng', lines: [sentence['#text']] }
    line = `<span class='transcriptor' style='color:${getColor(sentence['-score'])}'>${sentence['#text']}</span>`
    o = {begin: segment['-stime'], children: [], end: String((parseFloat(segment['-stime'])+ parseFloat(segment['-dur']))), id: String(notes.length), language: 'eng', lines: [line] };
    notes.push(o);
  }


});
console.log(notes);
fs.writeFile("sample-ouput.json", JSON.stringify(notes), function(err) {
  if(err) {
    return console.log(err);
  }

  console.log("File generated successfully!");
});
