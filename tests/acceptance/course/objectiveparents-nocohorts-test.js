import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course with no cohorts - Objective Parents', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    const program = this.server.create('program', { school: this.school });

    const programYear = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear });
    const competency = this.server.create('competency', { school: this.school, programYears: [programYear] });
    this.server.create('objective', { programYears: [programYear], competency });

    const objective = this.server.create('objective');
    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectives: [objective]
    });
  });

  test('add and remove a new cohort', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(15);

    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current.length, 1);

    assert.equal(page.objectives.current[0].description.text, 'objective 1');
    assert.equal(page.objectives.current[0].parents.length, 0);
    await page.objectives.current[0].manageParents();
    const m = page.objectives.manageObjectiveParents;

    assert.equal(m.objectiveTitle, 'objective 1');
    assert.ok(m.hasNoCohortWarning);

    await page.cohorts.manage();
    await page.cohorts.selectable[0].add();
    await page.cohorts.save();
    assert.equal(page.cohorts.current.length, 1);

    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.equal(m.competencies.length, 1);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].notSelected);
    assert.equal(m.competencies[0].objectives.length, 1);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(m.competencies[0].objectives[0].notSelected);

    await page.cohorts.manage();
    await page.cohorts.selected[0].remove();
    await page.cohorts.save();
    assert.equal(page.cohorts.current.length, 0);
    assert.ok(m.hasNoCohortWarning);


  });
});