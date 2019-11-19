import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  title: attr('string'),
  programYear: belongsTo('program-year', {async: true}),
  courses: hasMany('course', {async: true}),
  learnerGroups: hasMany('learner-group', {async: true}),
  users: hasMany('user', {async: true}),

  competencies: computed('programYear.competencies.[]', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('competencies');
  }),

  objectives: computed('programYear.objectives.[]', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('objectives');
  }),

  /**
   * All top-level learner groups associated with this cohort.
   *
   * @property rootLevelLearnerGroups
   * @type {Ember.computed}
   * @public
   */
  rootLevelLearnerGroups: computed('learnerGroups.[]', async function() {
    let learnerGroups = await this.get('learnerGroups');
    return learnerGroups.filter(learnerGroup => learnerGroup.belongsTo('parent').value() === null);
  }),

  program: computed('programYear.program', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('program');
  }),
  school: computed('program.school', async function() {
    const program = await this.get('program');
    return await program.get('school');
  }),

  sortedObjectives: computed('programYear.sortedObjectives.[]', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('sortedObjectives');
  }),
  classOfYear: computed('programYear.classOfYear', async function(){
    const programYear = await this.get('programYear');
    return await programYear.get('classOfYear');
  }),
});
