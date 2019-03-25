import Component from '@ember/component';
import layout from '../templates/components/loading-spinner';

export default Component.extend({
  layout,

  classNames: ['loading-spinner'],
  tagName: 'span',

  class: '',
  size: '1x'
});
