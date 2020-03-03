import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar day', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    await render(hbs`<IliosCalendarDay @date={{date}} @selectEvent={{noop}} @calendarEvents={{array}} />`);
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.dom().containsText('Wednesday');
    assert.dom('[data-test-calender-event]').doesNotExist();
  });
});
