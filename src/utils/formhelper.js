// const validate = require('validate.js');
import { cloneDeep } from 'lodash/core'
import helper from 'vuejs-object-helper';

export default {

    install (Vue, options) {
        const store = options.store;
        Object.defineProperty(Vue.prototype, '$lqForm',   {value: new formHelper(store ) });
    }
}

export  function formHelper (store ) {
    
    /**
     * To set the submit status
     * @param {String} formName 
     * @param {Boolean} status 
     */
    this.submiting = function (formName, status) {
        store.dispatch('form/isSubmiting', {formName, status});
    }
    this.errors = function (formName, getters) {
        getters = getters ? getters : store.getters;
        return getters['form/errros'](formName);
    }
    /**
     * TO submit the form.
     * @param {String} formName 
     */
    this.submit = function(formName, data, shouldEmitEvents, getters) {
        getters = getters ? getters : store.getters;
        let settings = getters['form/settings'](formName);
        return settings.submit(data, shouldEmitEvents);
    }
    /**
     * To get Element value
     * @param {String} formName 
     * @param {String} elementName 
     * @param {String} value 
     */
    this.setElementVal = function (formName, elementName, value) {
        store.dispatch('form/setElementValue', {formName, elementName, value });
    }
    /**
     * To set the initialized values
     * @param {String} formName 
     * @param {Object} values 
     */
    this.initializeValues = function (formName, values) {
        store.dispatch('form/initializeValues', {formName, values});
        this.validateIfHas(formName);
    }
    this.validate = function (formName, getters) {
        getters = getters ? getters : store.getters;
        let settings = getters['form/settings'](formName);
        if(typeof settings.test === 'function') {
            settings.test();
        }
    }
    this.validateIfHas = function (formName) {
        if (!window.validatejs.isEmpty(this.errors(formName))) {
            this.validate(formName)
        }
    }

    /**
     * To reset the form data.
     * @param {String} formName 
     */
    this.resetForm = function (formName) {
        store.dispatch('form/resetForm', {formName});
        this.validateIfHas(formName);
    }

    /**
     * To delete the element key
     * @param {*} formName 
     * @param {*} elementName 
     */
    this.removeElement = function (formName, elementName) {

        store.dispatch('form/removeElement', {formName, elementName});
    }

    this.addErrors = function (formName, errors) {

        store.dispatch('form/addErrors', {formName, errors});
    }

    this.addError = function (formName, elementName, errors) {
        store.dispatch('form/addError', {formName, elementName, errors});
    }

    this.removeError = function (formName, elementName) {
        
        store.dispatch('form/removeError', {formName, elementName});
    }
    this.removeErrors = function (formName) {
        
        store.dispatch('form/removeErrors', {formName});
    }

    /**
     * To delete the complete form.
     */
    this.deleteForm = function (formName) {
        store.dispatch('form/removeForm', {formName});
    }
    
    this.ready  = function (formName, status) {
        store.dispatch('form/isReady', {formName, status});
    }
    /**
     * To set the form permission
     */
    this.setPermission = function (formName, permission) {   
        store.dispatch('form/setPermission', {formName, permission});
    }

    /**
     * To make the element as touch/untouch.
     * @param {String} formName 
     * @param {String} elementName 
     */
    this.touchStatus = function (formName, elementName, value) {
        store.dispatch('form/addProp', {formName, elementName, key: 'touch', value});
    }
    /**
     * change element validating status.
     * @param {String} formName 
     * @param {String} elementName 
     */
    this.validatingStatus = function (formName, elementName, value) {
        store.dispatch('form/addProp', {formName, elementName, key: 'validating', value});
    }

    /**
     * To add setting data.
     * @param {String} formName 
     * @param {String} elementName 
     * @param {String} key [setting key]
     * @param {String} value [setting value]
     */
    this.addProp = function (formName, elementName, key, value) {
        store.dispatch('form/addProp', {formName, elementName, key, value});
    }
    
    /**
     * To add all props of element.
     * @param {String} formName 
     * @param {String} elementName 
     * @param {Object} props 
     */
    this.addProps = function(formName, elementName, props) {
        store.dispatch('form/addProps', { formName, elementName, value: props});
    }
    
    this.addTransformKey = function(formName, key) {
        store.dispatch('form/addTransformKey', { formName, key});
    }
    /**
     * Get valid form data.
     */
    this.formData = function(formName, getters) {
        getters = getters ? getters : store.getters;
        const formData = cloneDeep(getters['form/values'](formName));
        let settings = getters['form/settings'](formName);
        let fields =  getters['form/fields'](formName);
        let transformKeys = settings.transformKeys ? settings.transformKeys : null;
        let extraDataKeys = settings.extraDataKeys ? settings.extraDataKeys : null;

        let data = {};
        // Get element value and make it formatted.
        const fields_arr = Object.keys(fields);
        fields_arr.forEach((fieldName) => {
            let formatter = helper.getProp(fields, [fieldName, 'formatter']);
            let value = (typeof formatter === 'function') ? formatter() : helper.getProp(formData, fieldName);
            value = value ? value : null;
            helper.setProp(data, fieldName, value);
        });

        extraDataKeys && extraDataKeys.forEach(extraKey => {
           const val = helper.getProp(formData, extraKey, '');
           helper.setProp(data, extraKey, val);
        });
        // Replace the object key name.
        this.transformDataKey(data, transformKeys, fields);
        return data;
    }
    /**
     * To delete unnecessary 
     */
    this.deleteDirtyData = function (data, excludeInput) {
        if(excludeInput &&  helper.isArray(excludeInput) && excludeInput.length) {
            excludeInput.map(function(excludeKey) {
                helper.deleteProp(data, excludeKey);
            })
        }			
    }
    /**
     * To Replace the Object key
     */
    this.transformDataKey = function (data, transformKeys, fields) {
        if(!transformKeys) return;
        transformKeys.forEach( (tk) => {      
            const keys = tk.split(':');
            if(keys.length === 2) {
                const dataKeyFrom = keys[0];
                const dataKeyto = keys[1];
                if (fields[dataKeyFrom]) {
                    if (helper.getProp(data, dataKeyFrom)) {
                        const val = helper.getProp(data, dataKeyFrom);
                        helper.deleteProp(data, dataKeyFrom);
                        helper.setProp(data, dataKeyto, val)
                    } else {
                        helper.setProp(data, dataKeyto, null)
                    }
                } else {
                    helper.deleteProp(data, dataKeyFrom);
                }
            }
        });
    }
}