import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/user-name-info';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | user-name-info', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const user = this.server.create('user');
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserNameInfo @user={{this.user}} />`);
    assert.notOk(component.hasAdditionalInfo);
    assert.equal(component.fullName, '0 guy M. Mc0son');
  });

  test('it renders with additional info', async function (assert) {
    const user = this.server.create('user', { displayName: 'Clem Chowder' });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);
    this.set('user', userModel);
    await render(hbs`<UserNameInfo @user={{this.user}} />`);
    assert.ok(component.hasAdditionalInfo);
    assert.equal(component.fullName, 'Clem Chowder');
    assert.equal(component.infoIconLabel, 'Campus name of record');
    assert.notOk(component.isTooltipVisible);
    await component.expandTooltip();
    assert.ok(component.isTooltipVisible);
    assert.equal(component.tooltipContents, 'Campus name of record: 0 guy M, Mc0son');
    await component.closeTooltip();
    assert.notOk(component.isTooltipVisible);
  });
});
