import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginController extends Controller {
  @service iliosConfig;
  @service session;
  @tracked jwt =  null;
  @tracked error = null;

  @action
  updateJwt(event) {
    this.jwt = event.target.value;
  }

  @action
  async login(){
    this.error = null;

    if (this.jwt) {
      const apiHost = this.iliosConfig.get('apiHost');
      const url = `${apiHost}/auth/token`;
      const response = await fetch(url, {
        headers: {
          'X-JWT-Authorization': `Token ${this.jwt}`
        }
      });
      if (response.ok) {
        const obj = await response.json();
        const authenticator = 'authenticator:ilios-jwt';
        this.session.authenticate(authenticator, {jwt: obj.jwt});
      }
    }
  }

  @action
  async loginOnEnter(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.login();
    }
  }
}
