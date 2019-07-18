import helper from 'vuejs-object-helper';
import { cloneDeep } from 'lodash/core'
const formElementMix = {
  props: {
    id: {
      type: String,
      required: true
    },
    validateOnEvent: {
      type: String,
      validator: (val) => ['blur', 'change', 'keypress', 'keyup','keydown','click'].includes(val),
      default: function () {
        return 'change';
      }
    },
    customValueTransformer: Function,
    initValue: {
      type: [String, Array, Object, undefined],
      default: () => null
    },
    disabled: Boolean,
  },
  computed: {
    /**
     * To get the Element Error Message.
     */
    elError: function () {
      return helper.getProp(this.$store.state.form, [this.formName, 'errors', this.id], null);
    },
    /**
     * Get All errors those are contains in form.
     */
    formErrors: function () {
      return helper.getProp(this.$store.state.form, [this.formName, 'errors'], null);
    },
    simpleName: function() {
      return this.id.replaceAll(new RegExp("\.[0-9]+\."), '.*.');
    },
    /**
     * Get all error of element, if there is any validation rule in nested data.
     */
    errors: function () {
      let errors = [];
      this.errorInKeys.forEach((key) => {
        let error = this.formErrors[key];
        error.forEach(e => errors.push(e));
      });
      return errors;
    },
    /**
     * Get error Keys of the element.
     */
    errorInKeys: function () {
      const keys = this.formErrors ? Object.keys(this.formErrors) : [];
      let elementErrorKeys = [];
      keys.forEach((key) => {
        if (key.startsWith( this.id + '.')) {
          elementErrorKeys.push(key);
        }
        if(key === this.id) {
          elementErrorKeys.push(this.id);
        }
      });
      return elementErrorKeys;
    },
    /**
     * To get the Element Setting..
     */
    field: function () {
      return helper.getProp(this.$store.state.form, [this.formName, 'fields', this.id], {});
    },
    touch: function () {
      return helper.getProp(this.$store.state.form, [this.formName, 'fields', this.id, 'touch'], false);
    },
    validating: function() {
      return this.field.validating ? true : false;
    },
    /**
     * TO get the element initial value
     */
    initializevalue: function () {
      return helper.getProp(this.$store.state.form, this.formName+'.initialize_values.'+ this.id, null);
    },
    name: function () {
      return this.id.split('.').map(function(item, index)  { return index >0 ? '['+item+']': item  }).join('');
    },
    /**
     * Get form values
     */
    formValues: function () {
      return cloneDeep(helper.getProp(this.$store.state.form,`${this.formName}.values`, {}));
    },
    LQElement: {

      get: function () {
        return helper.getProp(this.$store.state.form,`${this.formName}.values.${this.id}`);
      },
      set: function (value, event) {
        this.setValue(value);
      }
    }
  },
  data: function () {

    return {
      formName: null,
      validationCallback: null,
      makeInItVal: undefined,
      asyncValidation: false,
      lqElRules: null,
    }
  },
  inject: ['lqForm'],
  created () {
    this.formName = this.lqForm.name;
    
    if (helper.isArray(this.initValue)) {
      this.makeInItVal = this.initValue.slice();
    }else if (helper.isObject(this.initValue)) {
      this.makeInItVal = {...this.initValue}
    } else {
      this.makeInItVal = this.initValue;
    }

    // Add initial value if does not already have the value.
    if (window.validatejs.isEmpty(this.LQElement) && this.makeInItVal !== undefined) {
      this.setValue( this.makeInItVal, false);
    }
    /**
     * Add Element props
     */
    this.$lqForm.addProps(this.formName, this.id, {
      touch: false,
      test: this.validate
    });

    /**
     * Get Validation rule from form class.
     */
    this.lqElRules = this.lqForm.rules ? helper.getProp(this.lqForm.rules, this.simpleName, null) : null;
  },

  methods: {
    /**
     * To get element value.
     * @param {Any} defulatValue 
     */
    getValue: function (defulatValue) {

      defulatValue = defulatValue !== undefined ? defulatValue : null;
      return this.LQElement || this.LQElement === undefined ? this.LQElement : defulatValue;
    },

    setValue: function (value, informToroot= true, checkValidation = true) {

      if(!this.lqElRules && this.elError){
        this.removeError();
      }
      
      if (typeof this.customValueTransformer === 'function') {
        value = this.customValueTransformer(value);
      }

      // For: Element name should always present in data collecton.
      if(this.makeInItVal !== undefined || value){
        value = !value ? this.makeInItVal : value;
        this.$lqForm.setElementVal(this.formName, this.id, value)
      }
      else {
        this.$lqForm.removeElement(this.formName, this.id);
      }
      if(informToroot){
        this.$root.$emit(this.formName + '_changed');
      }
      /**
       * Check validation rules.
       */
      if(checkValidation && this.validateOnEvent === 'change') {
        this.validate();
      }
    },
    /**
     * To Add Errors in element.
     * @param {Array} errors
     * @param {String} elementName
     */
    addError: function (errors, elementName) {
      elementName = elementName ? elementName : this.id;
      errors = !helper.isArray(errors) ? [errors] : errors;
      this.$lqForm.addError(this.formName, elementName, errors);
    },

    /**
     * To remove the Element error
     * @param {String} elementName
     */
    removeError: function (elementName) {
      elementName = elementName ? elementName : this.id;
      this.$lqForm.removeError(this.formName, elementName);
    },

    /**
     * To change the form Ready status
     * @param {Boolean} status
     */
    ready: function (status) {
      this.$lqForm.ready(this.formName, status);
    },
    /**
     * Change the element touch status
     * @param {Boolean} status
     */
    touchStatus: function (status) {
      this.$lqForm.touchStatus(this.formName, this.id, status);
    },
    /**
     * Change validation status.
     * @param {Boolean} status 
     */
    validatingStatus: function (status) {
      this.$lqForm.validatingStatus(this.formName, this.id, status);
    },
    /**
     * Remove all error from element.
     */
    removeAllErrors: function () {
      if(this.errorInKeys.length) {
        this.errorInKeys.forEach((errorKey) => {
          this.removeError(errorKey);
        })
      }
    },

    /**
     * Validate the element.
     * @param {Boolean} changeReadyStatus
     */
    validate: async function (changeReadyStatus = true, whenTouched = true) {
      if(!this.lqElRules) {
        this.removeAllErrors();
        return;
      }
      if (!this.touch && whenTouched) {
        return;
      }
      if (this.validating && this.validationCallback === null) {
        this.validationCallback = () => this.validate(changeReadyStatus);
        return;
      }
      this.removeAllErrors();
      this.validatingStatus(true);
      changeReadyStatus ? this.ready(false) : null;
      const options = {
        id: this.id,
        formName: this.formName,
        formValues: this.formValues
      }
      let validation_rules = {};
      let element_values = {};

      if (this.validateArrayIndex && window.validatejs.isArray(this.LQElement)) {
        this.LQElement.forEach((singleVal, index) => {
          validation_rules[this.id + '\\.' + index] = this.lqElRules;
          element_values[this.id + '.' + index] = singleVal;
        })
      } else {
        validation_rules[this.id] = this.lqElRules;
      }
      element_values[this.id] = this.LQElement;
      const test = await new Promise((resolve) => {
        window.validatejs.async(element_values, validation_rules, options)
          .then( (response) => {
            this.validationCallback ? this.validationCallback():  resolve();
            this.validationCallback = null;
          })
          .catch((errors) => {
            const error_elements = Object.keys(errors);
            error_elements.forEach( (error_element) => {
              this.addError(errors[error_element],  error_element.replaceAll('\\',''));
            })
            resolve(errors);
          })
      });
      changeReadyStatus ? this.ready(true) : null;
      this.$root.$emit('element-validated', this.id, this.formName);
      this.validatingStatus(false);
      return test;
    },

    /**
     * To Emit Custom Event
     * @param {Object} event
     */
    emitNativeEvent: function(event) {
      if (!event) {return}
      this.$emit(event.type, event, this.LQElement);
      /**
       * Check the Validation
       */
      if(this.validateOnEvent === event.type){
        this.validate()
      }

      /**
       * make Element as touch on focus event
       */
      if (event.type === 'focus' && !this.field.touch) {
        this.touchStatus(true);
      }
    }
  }

}

export default formElementMix;