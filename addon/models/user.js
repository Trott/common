import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import { A } from '@ember/array';

const { all, map } = RSVP;

export default Model.extend({
  lastName: attr('string'),
  firstName: attr('string'),
  middleName: attr('string'),
  displayName: attr('string'),
  phone: attr('string'),
  email: attr('string'),
  preferredEmail: attr('string'),
  addedViaIlios: attr('boolean'),
  enabled: attr('boolean'),
  campusId: attr('string'),
  otherId: attr('string'),
  examined: attr('boolean'),
  userSyncIgnore: attr('boolean'),
  icsFeedKey: attr('string'),
  root: attr('boolean'),
  reports: hasMany('report', { async: true }),
  school: belongsTo('school', { async: true }),
  authentication: belongsTo('authentication', { async: true }),
  directedCourses: hasMany('course', {
    async: true,
    inverse: 'directors',
  }),
  administeredCourses: hasMany('course', {
    async: true,
    inverse: 'administrators',
  }),
  studentAdvisedCourses: hasMany('course', {
    async: true,
    inverse: 'studentAdvisors',
  }),
  studentAdvisedSessions: hasMany('session', {
    async: true,
    inverse: 'studentAdvisors',
  }),
  learnerGroups: hasMany('learner-group', {
    async: true,
    inverse: 'users',
  }),
  instructedLearnerGroups: hasMany('learner-group', {
    async: true,
    inverse: 'instructors',
  }),
  instructorGroups: hasMany('instructor-group', {
    async: true,
    inverse: 'users',
  }),
  instructorIlmSessions: hasMany('ilm-session', {
    async: true,
    inverse: 'instructors',
  }),
  learnerIlmSessions: hasMany('ilm-session', {
    async: true,
    inverse: 'learners',
  }),
  offerings: hasMany('offering', {
    async: true,
    inverse: 'learners',
  }),
  instructedOfferings: hasMany('offering', {
    async: true,
    inverse: 'instructors',
  }),
  programYears: hasMany('program-year', { async: true }),
  roles: hasMany('user-role', { async: true }),
  directedSchools: hasMany('school', {
    async: true,
    inverse: 'directors',
  }),
  administeredSchools: hasMany('school', {
    async: true,
    inverse: 'administrators',
  }),
  administeredSessions: hasMany('session', {
    async: true,
    inverse: 'administrators',
  }),
  directedPrograms: hasMany('program', {
    async: true,
    inverse: 'directors',
  }),

  cohorts: hasMany('cohort', {
    async: true,
    inverse: 'users',
  }),
  primaryCohort: belongsTo('cohort', { async: true, inverse: null }),
  pendingUserUpdates: hasMany('pending-user-update', { async: true }),
  administeredCurriculumInventoryReports: hasMany('curriculum-inventory-report', {
    async: true,
    inverse: 'administrators',
  }),

  /**
   * Resolves to TRUE if this user has the "Student" role, otherwise FALSE.
   * @property isStudent
   * @type {Ember.computed}
   * @public
   */
  isStudent: computed('roles.[]', async function () {
    const roles = await this.roles;
    return !!roles.toArray().findBy('title', 'Student');
  }),

  /**
   * Checks if a user is linked to any non-student things
   * @property isLearner
   * @type {Ember.computed}
   * @public
   */
  isLearner: computed('cohorts.[]', 'offerings.[]', 'learnerIlmSessions.[]', function () {
    const cohorts = this.hasMany('cohorts').ids();
    const offerings = this.hasMany('offerings').ids();
    const learnerIlmSessions = this.hasMany('learnerIlmSessions').ids();

    return !isEmpty(cohorts) || !isEmpty(offerings) || !isEmpty(learnerIlmSessions);
  }),

  /**
   * Checks if a user is linked to any non-student things
   * @property performsNonLearnerFunction
   * @type {Ember.computed}
   * @public
   */
  performsNonLearnerFunction: computed(
    'directedCourses.[]',
    'administeredCourses.[]',
    'administeredSessions.[]',
    'instructedLearnerGroups.[]',
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'directedPrograms.[]',
    'programYears.[]',
    'administeredCurriculumInventoryReports.[]',
    'directedSchools.[]',
    'administeredSchools.[]',
    function () {
      const directedCourses = this.hasMany('directedCourses').ids();
      const administeredCourses = this.hasMany('administeredCourses').ids();
      const administeredSessions = this.hasMany('administeredSessions').ids();
      const instructedLearnerGroups = this.hasMany('instructedLearnerGroups').ids();
      const instructorGroups = this.hasMany('instructorGroups').ids();
      const instructedOfferings = this.hasMany('instructedOfferings').ids();
      const directedPrograms = this.hasMany('directedPrograms').ids();
      const programYears = this.hasMany('programYears').ids();
      const administeredCurriculumInventoryReports = this.hasMany(
        'administeredCurriculumInventoryReports'
      ).ids();
      const directedSchools = this.hasMany('directedSchools').ids();
      const administeredSchools = this.hasMany('administeredSchools').ids();

      return (
        !isEmpty(directedCourses) ||
        !isEmpty(administeredCourses) ||
        !isEmpty(administeredSessions) ||
        !isEmpty(instructedLearnerGroups) ||
        !isEmpty(instructorGroups) ||
        !isEmpty(instructedOfferings) ||
        !isEmpty(directedPrograms) ||
        !isEmpty(programYears) ||
        !isEmpty(administeredCurriculumInventoryReports) ||
        !isEmpty(directedSchools) ||
        !isEmpty(administeredSchools)
      );
    }
  ),

  fullName: computed('fullNameFromFirstMiddleInitialLastName', 'displayName', function () {
    return this.displayName ? this.displayName : this.fullNameFromFirstMiddleInitialLastName;
  }),

  fullNameFromFirstMiddleInitialLastName: computed(
    'firstName',
    'middleName',
    'lastName',
    function () {
      if (!this.firstName || !this.lastName) {
        return '';
      }

      const middleInitial = this.middleName ? this.middleName.charAt(0) : false;

      if (middleInitial) {
        return `${this.firstName} ${middleInitial}. ${this.lastName}`;
      } else {
        return `${this.firstName} ${this.lastName}`;
      }
    }
  ),

  fullNameFromFirstMiddleLastName: computed('firstName', 'middleName', 'lastName', function () {
    if (!this.firstName || !this.lastName) {
      return '';
    }

    if (this.middleName) {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    } else {
      return `${this.firstName} ${this.lastName}`;
    }
  }),

  fullNameFromFirstLastName: computed('firstName', 'lastName', function () {
    if (!this.firstName || !this.lastName) {
      return '';
    }
    return `${this.firstName} ${this.lastName}`;
  }),

  hasDifferentDisplayName: computed(
    'displayName',
    'fullNameFromFirstMiddleInitialLastName',
    'fullNameFromFirstMiddleLastName',
    'fullNameFromFirstLastName',
    function () {
      const displayName = this.displayName?.trim().toLowerCase();
      // no display name? nothing to compare then.
      if (!displayName) {
        return false;
      }
      // compare the display name to 'first last', then to 'first middle last' and 'first m. last' as a fallbacks.
      return !(
        displayName === this.fullNameFromFirstLastName.trim().toLowerCase() ||
        displayName === this.fullNameFromFirstMiddleLastName.trim().toLowerCase() ||
        displayName === this.fullNameFromFirstMiddleInitialLastName.trim().toLowerCase()
      );
    }
  ),

  /**
   * A list of all courses that this user is instructing in.
   * @property allInstructedCourses
   * @type {Ember.computed}
   * @public
   */
  allInstructedCourses: computed(
    'instructedLearnerGroups.[]',
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'instructorGroupCourses.[]',
    'instructorIlmSessions.[]',
    async function () {
      const instructedLearnerGroups = await this.instructedLearnerGroups;
      const instructorGroups = await this.instructorGroups;
      const instructedOfferings = await this.instructedOfferings;
      const instructorIlmSessions = await this.instructorIlmSessions;

      const groups = [];
      groups.pushObjects(instructedLearnerGroups.toArray());
      groups.pushObjects(instructorGroups.toArray());
      const listsOfCourses = await map(groups.mapBy('courses'), (courses) => {
        return courses.toArray();
      });

      // get a list of sessions associated with this user's offerings and ILMs
      const offeringsAndIlms = instructedOfferings.toArray();
      offeringsAndIlms.pushObjects(instructorIlmSessions.toArray());
      const sessions = await all(offeringsAndIlms.mapBy('session'));

      // get a list of courses from these sessions and add it to the lists of courses
      const listOfCourses = await all(sessions.uniq().mapBy('course'));
      listsOfCourses.pushObject(listOfCourses);

      // flatten these lists down to one list of courses, and de-dupe that list
      return listsOfCourses
        .reduce((array, set) => {
          array.pushObjects(set);
          return array;
        }, [])
        .uniq();
    }
  ),

  /**
   * A list of all sessions that this user is instructing in.
   * @property allInstructedSessions
   * @type {Ember.computed}
   * @public
   */
  allInstructedSessions: computed(
    'instructorGroups.[]',
    'instructedOfferings.[]',
    'instructorGroupCourses.[]',
    'instructorIlmSessions.[]',
    async function () {
      const instructorGroups = await this.instructorGroups;
      const instructedOfferings = await this.instructedOfferings;
      const instructorIlmSessions = await this.instructorIlmSessions;

      const instructorGroupSessions = await all(instructorGroups.mapBy('sessions'), (sessions) => {
        return sessions.toArray();
      });

      // flatten these lists down to one list of sessions, and de-dupe that list
      const flatInstructorGroupSessions = instructorGroupSessions
        .reduce((array, set) => {
          array.pushObjects(set);
          return array;
        }, [])
        .uniq();

      const sessions = await all(
        [].concat(instructedOfferings.toArray(), instructorIlmSessions.toArray()).mapBy('session')
      );

      return A().concat(flatInstructorGroupSessions, sessions).uniq();
    }
  ),

  /**
   * A list of all courses that this user is associated with - be it as administrator, learner, instructor or director.
   * @property allRelatedCourses
   * @type {Ember.computed}
   * @public
   */
  allRelatedCourses: computed(
    'directedCourses.[]',
    'administeredCourses.[]',
    'learnerGroups.[]',
    'offerings.[]',
    'learnerIlmSessions.[]',
    'allInstructedCourses.[]',
    async function () {
      const directedCourses = await this.directedCourses;
      const administeredCourses = await this.administeredCourses;
      const learnerGroups = await this.learnerGroups;
      const offerings = await this.offerings;
      const learnerIlmSessions = await this.learnerIlmSessions;
      const allInstructedCourses = await this.allInstructedCourses;

      // get lists of courses associated with this user's learner-groups
      const listsOfCourses = await map(learnerGroups.mapBy('courses'), (courses) => {
        return courses.toArray();
      });

      // get a list of sessions associated with this user's offerings and ILMs
      const offeringsAndIlms = [];
      offeringsAndIlms.pushObjects(offerings.toArray());
      offeringsAndIlms.pushObjects(learnerIlmSessions.toArray());
      const sessions = await all(offeringsAndIlms.mapBy('session'));

      // get a list of courses from these sessions and add it to the lists of courses
      const listOfCourses = await all(sessions.uniq().mapBy('course'));
      listsOfCourses.pushObject(listOfCourses);

      // add the direct list of courses to the lists of courses
      listsOfCourses.pushObject(directedCourses.toArray());
      listsOfCourses.pushObject(administeredCourses.toArray());
      listsOfCourses.pushObject(allInstructedCourses.toArray());

      // flatten these lists down to one list of courses, and de-dupe that list
      return listsOfCourses
        .reduce((array, set) => {
          array.pushObjects(set);
          return array;
        }, [])
        .uniq();
    }
  ),

  secondaryCohorts: computed('primaryCohort', 'cohorts.[]', async function () {
    const cohorts = await this.cohorts;
    const primaryCohort = await this.primaryCohort;
    return cohorts.toArray().filter((cohort) => cohort !== primaryCohort);
  }),

  /**
   * Compare a user's learner groups to a list of learner groups and find the one
   * that is the lowest leaf in the learner group tree.
   * @property getLowestMemberGroupInALearnerGroupTree
   * @param {Array} learnerGroupTree all the groups we want to look into
   * @return {Object|null} The learner-group model or NULL if none could be found.
   * @type function
   * @public
   */
  async getLowestMemberGroupInALearnerGroupTree(learnerGroupTree) {
    const learnerGroups = await this.learnerGroups;
    //all the groups a user is in that are in our current learner groups tree
    const relevantGroups = learnerGroups
      .toArray()
      .filter((group) => learnerGroupTree.includes(group));
    const relevantGroupIds = relevantGroups.mapBy('id');
    const lowestGroup = relevantGroups.find((group) => {
      const childIds = group.hasMany('children').ids();
      const childGroupsWhoAreUserGroupMembers = childIds.filter((id) =>
        relevantGroupIds.includes(id)
      );
      return childGroupsWhoAreUserGroupMembers.length === 0;
    });
    return lowestGroup ? lowestGroup : null;
  },
});
