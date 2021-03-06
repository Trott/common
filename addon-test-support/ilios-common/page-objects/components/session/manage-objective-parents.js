import {
  create,
  clickable,
  collection,
  hasClass,
  isPresent,
  notHasClass,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-session-manage-objective-parents]',
  courseTitle: text('[data-test-course-title]'),
  objectives: collection('[data-test-parent-picker] li', {
    title: text(),
    selected: hasClass('selected', 'label'),
    notSelected: notHasClass('selected', 'label'),
    add: clickable('input'),
  }),
  hasNoObjectivesWarning: isPresent('[data-test-no-course-objectives-message]'),
};

export default definition;
export const component = create(definition);
