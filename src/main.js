
import lqElementMixin from './mixins/elementMixin';
import lqFormMixin from './mixins/formMixin';
import lqPermissionMixin from './mixins/permissionMixin';
import lqFileMixin from './mixins/fileMixin';

/**
 * Form Modules
 */
import lqFormModule from './store/modules/form';
/**
 * Form Helper Class
 */
import formHelper, {formHelper as lqFormHelper} from './utils/formhelper';

/**
 * Validate Libraray to validate the form Element.
 */
import validate from 'validate.js';
import fileValidation from './validate/FileValidation';

/**
 * Register Custom Validation Rule.
 */
validate.validators.file = function(value, rules,  id, values, options ) {
    return fileValidation(value, rules, id, values, options)
};

export { lqElementMixin, lqFormMixin, lqFileMixin, lqFormHelper, lqPermissionMixin, validate };

export default {
    // The install method will be called with the Vue constructor as
    // the first argument, along with possible options
    install (Vue, options) {
        options.store.registerModule('form', lqFormModule);
        Vue.use(formHelper, {store: options.store});
    }
}



