import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

export default class PrintCourseComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked sortTitle;
  @tracked sortDirectorsBy;
  @tracked courseLearningMaterialsRelationship;
  @tracked sessionsRelationship;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  @dropTask
  *load() {
    this.courseLearningMaterialsRelationship = yield this.args.course.learningMaterials;
    this.sessionsRelationship = yield this.args.course.sessions;
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  }

  get courseLearningMaterials() {
    if (!this.courseLearningMaterialsRelationship) {
      return [];
    }

    return this.courseLearningMaterialsRelationship.toArray().sort(sortableByPosition);
  }

  get sessions() {
    if (!this.sessionsRelationship) {
      return [];
    }

    if (!this.args.includeUnpublishedSessions) {
      return this.sessionsRelationship.filterBy('isPublishedOrScheduled');
    }

    return this.sessionsRelationship.toArray();
  }
}
