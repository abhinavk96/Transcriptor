import DS from 'ember-data';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default DS.Model.extend({
  name: attr('string'),
  description: attr('string'),
  status:attr('string'),
  asrName: attr('string'),
  fileAddress: attr('string'),
  xmlFile: attr('string'),
  xmlName: attr('string'),
  rawXml :attr('string', { readOnly: true}),
  createdAt: attr('moment', { readOnly: true }),
  audioDuration: attr('string'),
  creator: belongsTo('user'),
  editors:  hasMany('user', { inverse: null}),
  respeakJob: attr('string', { readOnly: true}),
  respeakXml: attr('string'),
  respeakDone: attr('boolean'),
  respeakFiles: attr('string')
});
