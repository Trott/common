import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CourseObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;

  @action
  load(element, [courseObjective]) {
    if (!courseObjective) {
      return;
    }
    this.title = courseObjective.title;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors || this.isManagingTerms;
  }

  @dropTask
  *saveTitleChanges() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.courseObjective.set('title', this.title);
    yield this.args.courseObjective.save();
  }

  @dropTask
  *manageParents() {
    const objectives = this.args.cohortObjectives.reduce((set, cohortObject) => {
      const cohortObjectives = cohortObject.competencies.mapBy('objectives');
      return [...set, ...cohortObjectives.flat()];
    }, []);
    const parents = yield this.args.courseObjective.programYearObjectives;
    this.parentsBuffer = parents.toArray().map((objective) => {
      return objectives.findBy('id', objective.id);
    });
    this.isManagingParents = true;
  }
  @dropTask
  *manageDescriptors() {
    const meshDescriptors = yield this.args.courseObjective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors.toArray();
    this.isManagingDescriptors = true;
  }
  @dropTask
  *manageTerms(vocabulary) {
    this.selectedVocabulary = vocabulary;
    const terms = yield this.args.courseObjective.terms;
    this.termsBuffer = terms.toArray();
    this.isManagingTerms = true;
  }

  @restartableTask
  *highlightSave() {
    yield timeout(1000);
  }

  @dropTask
  *saveParents() {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('program-year-objective', obj.id);
    });
    this.args.courseObjective.set('programYearObjectives', newParents);
    yield this.args.courseObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveDescriptors() {
    this.args.courseObjective.set('meshDescriptors', this.descriptorsBuffer);
    yield this.args.courseObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveTerms() {
    this.args.courseObjective.set('terms', this.termsBuffer);
    yield this.args.courseObjective.save();
    this.termsBuffer = [];
    this.isManagingTerms = false;
    this.highlightSave.perform();
  }

  @action
  revertTitleChanges() {
    this.title = this.args.courseObjective.title;
    this.removeErrorDisplayFor('title');
  }
  @action
  changeTitle(contents) {
    this.title = contents;
    this.addErrorDisplayFor('title');
  }
  @action
  addParentToBuffer(objective) {
    this.parentsBuffer = [...this.parentsBuffer, objective];
  }
  @action
  removeParentFromBuffer(objective) {
    this.parentsBuffer = this.parentsBuffer.filter((obj) => obj.id !== objective.id);
  }
  @action
  removeParentsWithCohortFromBuffer(cohort) {
    const cohortObjectives = cohort.competencies.mapBy('objectives');
    const ids = [...cohortObjectives.flat()].mapBy('id');
    this.parentsBuffer = this.parentsBuffer.filter((obj) => {
      return !ids.includes(obj.id);
    });
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.descriptorsBuffer = [...this.descriptorsBuffer, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.descriptorsBuffer = this.descriptorsBuffer.filter((obj) => obj.id !== descriptor.id);
  }
  @action
  addTermToBuffer(term) {
    this.termsBuffer = [...this.termsBuffer, term];
  }
  @action
  removeTermFromBuffer(term) {
    this.termsBuffer = this.termsBuffer.filter((obj) => obj.id !== term.id);
  }
  @action
  cancel() {
    this.parentsBuffer = [];
    this.descriptorsBuffer = [];
    this.termsBuffer = [];
    this.isManagingParents = false;
    this.isManagingDescriptors = false;
    this.isManagingTerms = false;
    this.selectedVocabulary = null;
  }
  @dropTask
  *deleteObjective() {
    yield this.args.courseObjective.destroyRecord();
  }
}
