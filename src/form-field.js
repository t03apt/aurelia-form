import {Config} from './config';
import {bindingMode, bindable, computedFrom, inject} from 'aurelia-framework';
import {ViewManager} from 'aurelia-view-manager';

@inject(Config, Element, ViewManager)
export class FormFieldCustomElement {

  @bindable attribute

  @bindable({defaultBindingMode: bindingMode.twoWay})
  value

  constructor(config, element, viewManager) {
    this.config = config;
    this.element = element;
    this.viewManager = viewManager;
  }

  attached() {
    // consider: using aurelia DOM pal
    let attributeElements = $(this.element).find('[attrs]');
    if (attributeElements) {
      attributeElements.attr(this.attribute.attributes || {});
    }
  }

  @computedFrom('attribute')
  get label() {
    return this.attribute.label || this.attribute.key;
  }

  @computedFrom('attribute')
  get view() {
    let type = this.type;
    this.attribute.type = type;
    return this.viewManager.resolve('aurelia-form', type);
  }

  /**
   * Calculates what component to use
   *
   * Checks if the user has defined a custom component and uses that one when
   * that is the case. Otherwise fallback to the framework it's components. If
   * none of them are defined it warns the developer of this.
   * @returns {boolean} true when has a viewModel
   */
  @computedFrom('type', 'view')
  get hasViewModel() {
    return !this.view.endsWith('.html');
  }

  /**
  * returns a string that represents the type of which it is an alias of. If it
  * is not registered as an alias it returns itself(identity).
  *
  * It also resolves recursively and makes sure it does not end up in a infinite
  * loop because of a config malformed config.
  *
  * @param {object} config
  * @param {string} type
  * @returns {string}
  */
  @computedFrom('attribute')
  get type() {
    let type = this.attribute.type;
    let alias = this.config.get('aliases', type); /* get an alias if it has one */
    let previous = []; /* used to avoid an infinite loop */

    /***
     * if it does have and alias, and has not resolved that alias previously,
     * check if that alias points to another type or alias.
     */
    while (alias && (previous.indexOf(alias) === -1)) {
      type = alias;
      previous.push(type);
      alias = this.config.get('aliases', type);
    }

    return type;
  }
}

