import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';

export default class CourseObjectivesComponent extends Component {
  @service store;
  @service flashMessages;

  @tracked newObjectiveEditorOn = false;
  @tracked newObjectiveTitle;
  @tracked objectivesRelationship;

  get showCollapsible() {
    return this.hasObjectives && !this.isManaging;
  }

  get hasObjectives() {
    return this.objectiveCount > 0;
  }

  get objectiveCount() {
    return this.objectivesRelationship ? this.objectivesRelationship.length : 0;
  }

  @restartableTask
  *load() {
    this.objectivesRelationship = yield this.args.course.courseObjectives;
  }

  @dropTask
  *saveNewObjective(title) {
    const newCourseObjective = this.store.createRecord('course-objective');
    let position = 0;
    const courseObjectives = yield this.args.course.courseObjectives;
    if (courseObjectives.length) {
      position = courseObjectives.sortBy('position').lastObject.position + 1;
    }

    newCourseObjective.set('title', title);
    newCourseObjective.set('position', position);
    newCourseObjective.set('course', this.args.course);

    yield newCourseObjective.save();

    this.newObjectiveEditorOn = false;
    this.flashMessages.success('general.newObjectiveSaved');
  }

  @action
  toggleNewObjectiveEditor() {
    //force expand the objective component
    //otherwise adding the first new objective will cause it to close
    this.args.expand();
    this.newObjectiveEditorOn = !this.newObjectiveEditorOn;
  }
  @action
  collapse() {
    if (this.hasObjectives) {
      this.args.collapse();
    }
  }
}
