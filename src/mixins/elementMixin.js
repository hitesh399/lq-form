import helper from 'vuejs-object-helper';
import cloneDeep from 'lodash/cloneDeep'
import { isEqual } from 'lodash/core'
import { EventBus } from '../components/event-bus';

const formElementMix = {
    props: {
        id: {
            type: String,
            required: true
        },
        validateOnEvent: {
            type: String,
            validator: (val) => ['blur', 'change', 'keypress', 'keyup', 'keydown', 'click'].includes(val),
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
        keepAlive: {
            type: Boolean,
            default: () => true
        }
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
        simpleName: function () {
            return this.id.replaceAll(new RegExp("\.[0-9]+\.?"), '.*.');
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
                if (key.startsWith(this.id + '.')) {
                    elementErrorKeys.push(key);
                }
                if (key === this.id) {
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
        validating: function () {
            return this.field.validating ? true : false;
        },
        /**
         * TO get the element initial value
         */
        initializevalue: function () {
            return helper.getProp(this.$store.state.form, this.formName + '.initialize_values.' + this.id, null);
        },
        name: function () {
            return this.id.split('.').map(function (item, index) { return index > 0 ? '[' + item + ']' : item }).join('');
        },
        myRulesInForm: function () {
            return helper.getProp(this.lqForm.rules, [this.simpleName], null)
        },
        /**
         * Get form values
         */
        formValues: function () {
            return cloneDeep(helper.getProp(this.$store.state.form, `${this.formName}.values`, {}));
        },
        LQElement: {

            get: function () {
                return helper.getProp(this.$store.state.form, `${this.formName}.values.${this.id}`);
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
    watch: {
        myRulesInForm: {
            handler(newval, oldVale) {
                if (!isEqual(newval, oldVale)) {
                    this.lqElRules = newval;
                }
            },
            immediate: true
        }
    },
    created() {
        this.formName = this.lqForm.name;

        if (helper.isArray(this.initValue)) {
            this.makeInItVal = this.initValue.slice();
        } else if (helper.isObject(this.initValue)) {
            this.makeInItVal = { ...this.initValue }
        } else {
            this.makeInItVal = this.initValue;
        }

        // Add initial value if does not already have the value.
        if (window.validatejs.isEmpty(this.LQElement) && this.makeInItVal !== undefined) {
            this.setValue(this.makeInItVal, false, false);
        }
        /**
         * Add Element props
         */
        this.$lqForm.addProps(this.formName, this.id, {
            touch: false,
            test: this.validate,
            formatter: null,
            dirty: false
        });
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

        setValue: function (value, broadcast = true, checkValidation = true) {

            if (!this.lqElRules && this.elError) {
                this.removeError();
            }

            if (typeof this.customValueTransformer === 'function') {
                value = this.customValueTransformer(value);
            }

            // For: Element name should always present in data collecton.
            if (this.makeInItVal !== undefined || value) {
                value = !value ? this.makeInItVal : value;
                this.$lqForm.setElementVal(this.formName, this.id, value, false)
            }
            else {
                this.$lqForm.removeElement(this.formName, this.id);
            }
            if (broadcast) {
                EventBus.$emit(this.formName + '_changed')
            }
            /**
             * Make form dirty
             * LQElement
             */
            this.testDirty(value)
            /**
             * Check validation rules.
             */
            if (checkValidation && this.validateOnEvent === 'change') {
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
        testDirty(value) {
            // if (typeof this.__formatter === 'function' ) {
            //     console.log('T1', this.__formatter(this.initializevalue))
            //     console.log('T2', this.__formatter(value))
            //     console.log('Compare', JSON.stringify( this.__formatter(value)) ==  JSON.stringify(this.__formatter(this.initializevalue)))
            // }
            // console.log('this.__formatter', this.__formatter, this.id,  {...this.initializevalue}, {...value    })
            if (!this.initializevalue && !value) {
                this.$lqForm.addProp(this.formName, this.id, 'dirty', false);
            } else if (this.initializevalue === value) {
                this.$lqForm.addProp(this.formName, this.id, 'dirty', false);
            } else if (typeof this.__formatter === 'function' && JSON.stringify(this.__formatter(this.initializevalue)) === JSON.stringify(this.__formatter(value))) {
                this.$lqForm.addProp(this.formName, this.id, 'dirty', false);
            } else if (!this.field.dirty) {
                this.$lqForm.addProp(this.formName, this.id, 'dirty', true);
            }
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
            if (this.errorInKeys.length) {
                this.errorInKeys.forEach((errorKey) => {
                    this.removeError(errorKey);
                })
            }
        },

        /**
         * Validate the element.
         * @param {Boolean} changeReadyStatus
         */
        validate: async function (changeReadyStatus = true, onlyTouchedTest = true, notify = true, returnRuleAndMessage = false) {
            // console.log('Test', this.id, this.LQElement, this.lqElRules)
            if (!this.lqElRules) {
                this.removeAllErrors();
                // console.log('Test 1', this.id)
                return;
            }
            if (!this.touch && onlyTouchedTest) {
                // console.log('Test 2', this.id)
                return;
            }
            if (this.validating && this.validationCallback === null) {
                this.validationCallback = () => this.validate(changeReadyStatus, onlyTouchedTest, notify, returnRuleAndMessage);
                // console.log('Test 3', this.id)
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
                    const elementFullName = this.id + '.' + index
                    validation_rules[this.id + '\\.' + index] = this.lqElRules;
                    element_values[elementFullName] = singleVal;
                })
            } else {
                validation_rules[this.id] = this.lqElRules;
                helper.setProp(element_values, this.id, this.LQElement)
            }
            // 

            // console.log('element_values', element_values, this.id, validation_rules)
            let _errorRoles = [];

            const test = await new Promise((resolve) => {
                window.validatejs.async(element_values, validation_rules, options)
                    .then((response) => {
                        // console.log('Test result s', response, this.id)
                        if (!this.validationCallback) {
                            resolve()
                            const error_elements = Object.keys(element_values);
                            error_elements.forEach((error_element) => {
                                const elName = error_element.replaceAll('\\', '')
                                if (notify) {
                                    EventBus.$emit('lq-element-validated-' + this.formName + '-' + elName, null, [])
                                }
                            })

                        } else {
                            this.validationCallback()
                            this.validationCallback = null
                        }
                    })
                    .catch((errors) => {
                        if (!this.validationCallback) {
                            // console.log('Test result E', errors, this.id)
                            let _error_messages = {};
                            const error_elements = Object.keys(errors);
                            error_elements.forEach((error_element) => {
                                const elName = error_element.replaceAll('\\', '')
                                let elErrors = errors[error_element];
                                let myErrorRules = [];
                                elErrors = elErrors.map(function (e) {
                                    const match = e.toString().match(/(\[\:\:)(.+)(\:\:\])/gi)
                                    if (match) {
                                        const str = match[0].replace('[::', '').replace('::]', '')
                                        myErrorRules.push(str)
                                        e = e.replace(/\[\:\:.+\:\:\]/g, '')
                                    }
                                    return e
                                })
                                _errorRoles.push({ [elName]: myErrorRules })
                                this.addError(elErrors, elName);
                                _error_messages[elName] = elErrors
                                if (notify) {
                                    EventBus.$emit('lq-element-validated-' + this.formName + '-' + elName, elErrors, myErrorRules)
                                }
                            })
                            resolve(_error_messages);
                        } else {
                            this.validationCallback()
                            this.validationCallback = null
                        }
                    })
            });
            changeReadyStatus ? this.ready(true) : null;
            this.validatingStatus(false);
            // console.log('Result', this.id, this.LQElement, test)
            if (notify) {
                this.$emit('element-validated', test, _errorRoles);
            }
            return (!returnRuleAndMessage) ? test : { test, rules: _errorRoles }
        },

        /**
         * To Emit Custom Event
         * @param {Object} event
         */
        emitNativeEvent: function (event) {
            if (!event) { return }
            this.$emit(event.type, event, this.LQElement);
            /**
             * Check the Validation
             */
            if (this.validateOnEvent === event.type) {
                this.validate()
            }

            /**
             * make Element as touch on focus event
             */
            if (event.type === 'focus' && !this.field.touch) {
                this.touchStatus(true);
            }
        }
    },
    beforeDestroy() {
        if (!this.keepAlive) {
            this.$lqForm.removeElement(this.formName, this.id)
        }
    }

}

export default formElementMix;
