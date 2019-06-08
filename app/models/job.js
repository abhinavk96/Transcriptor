import DS from 'ember-data';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default DS.Model.extend({
  /** attributes
   *
   */
  status: attr('string'),
  rating: attr('string'),
  createdAt: attr('moment', { readOnly: true }),

  /** relationships
   *
   */
  creator: belongsTo('user'),
  transcription: belongsTo('transcription'),
  role: belongsTo('role'),
  assignee: belongsTo('user')

});
