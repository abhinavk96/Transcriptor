import DS from 'ember-data';
import attr from 'ember-data/attr';

export default DS.Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  isVerified: attr('string', {readOnly: true}),
  isAdmin: attr('string', {readOnly: true}),
  originalImageUrl: attr('string'),
  thumbnailImageUrl: attr('string'),
  iconImageUrl: attr('string')
});
