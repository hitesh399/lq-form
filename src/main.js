/**
 * Validation rule.
 */
import validate from 'validate.js';
if (!window.validatejs) {
    window.validatejs = validate;
}

import lqElementMixin from './mixins/elementMixin';
import lqFormMixin from './mixins/formMixin';
import lqPermissionMixin from './mixins/permissionMixin';
import lqFileMixin from './mixins/fileMixin';
/**
 * LQ Form Components 
 */
import lqList from './components/List'
import lqForm from './components/Form'
import { EventBus } from './components/event-bus'
import lqListFilter from './components/List/Filter'
import FilterBtn from './components/List/FilterBtn'
/**
 * Form Modules
 */
import lqFormModule from './store/modules/form';
import lqTableModule from './store/modules/table';
import lqManualfilter from './store/modules/manualfilter';

import { lqFormOptions } from './defaultOptions'

import './directives/lqModel'

/**
 * Form Helper Class
 */
import formHelper, { formHelper as lqFormHelper } from './utils/formhelper';
import rTable from './utils/lqTable';

/**
 * Validate Libraray to validate the form Element.
 */
import fileValidation from './validate/FileValidation';

/**
 * Register Custom Validation Rule.
 */
window.validatejs.validators.file = function (value, rules, id, values, options) {
    return fileValidation(value, rules, id, values, options)
};

export { lqElementMixin, lqFormMixin, lqFileMixin, lqFormHelper, lqPermissionMixin, EventBus };

export default {
    // The install method will be called with the Vue constructor as
    // the first argument, along with possible options
    install(Vue, options = {}) {
        lqFormOptions.merge(options)
        options.store.registerModule('form', lqFormModule);
        options.store.registerModule('table', lqTableModule);
        options.store.registerModule('manualfilter', lqManualfilter);
        Vue.use(formHelper, { store: options.store });
        Vue.use(rTable, { store: options.store });
        Vue.component('lq-list', lqList);
        Vue.component('lq-form', lqForm);
        Vue.component('lq-list-filter', lqListFilter);
        Vue.component('lq-filter-btn', FilterBtn);
    }
}