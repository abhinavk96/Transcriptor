import DS from 'ember-data';
import attr from 'ember-data/attr';

export default DS.Model.extend({
  /** attributes
   *
   */
  name: attr('string')
});
