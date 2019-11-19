import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  notes: attr('string'),
  required: attr('boolean', { defaultValue: true }),
  publicNotes: attr('boolean', { defaultValue: true }),
  position: attr('number', { defaultValue: 0 }),
  startDate: attr('date'),
  endDate: attr('date'),
  course: belongsTo('course', { async: true }),
  learningMaterial: belongsTo('learning-material', { async: true }),
  meshDescriptors: hasMany('mesh-descriptors', { async: true }),
});
