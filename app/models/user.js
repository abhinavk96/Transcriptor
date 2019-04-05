import DS from 'ember-data';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default DS.Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  isVerified: attr('string', {readOnly: true}),
  isAdmin: attr('string', {readOnly: true}),
  originalImageUrl: attr('string'),
  thumbnailImageUrl: attr('string'),
  iconImageUrl: attr('string'),
  transcriptions: hasMany('transcription', {inverse: 'creator'}),
  editorTranscriptions: hasMany('transcription', {inverse: 'editors'})
});
