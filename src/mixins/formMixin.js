import helper from 'vuejs-object-helper';
import cloneDeep from 'lodash/cloneDeep'
import axios from 'axios'
import { lqFormOptions } from '../defaultOptions'

const formMixin = {

	props: {
		name: {
			type: String,
			required: true,
		},
		keepAlive: {
			type: Boolean,
			default: function () { return false; }
		},
		transformKeys: Array,
		scrollToErrorField: {
			type: Boolean,
			default: () => true
		},
		initialvalues: {
			type: Object,
			default: function () { return {}; }
		},
		requestMethod: {
			type: String,
			default: () => 'POST'
		},
		action: String,
		contentType: {
			type: String,
			default: () => 'json'
		},
		autoAssignErrors: {
			type: Boolean,
			default: function () { return true }
		},
		rules: Object,
		extraDataKeys: Array,
		disabled: {
			type: Boolean,
			default: function () { return false }
		},
		errorKey: {
			type: [String, Array],
			default: () => lqFormOptions.formErrorKey
		}
	},
	data: function () {
		return {
			formName: null,
			renderComponent: true,
			elementVisibility: {}
		}
	},
	provide() {
		return {
			lqForm: this
		};
	},
	/*
	 |-------------------------------------------------------
	 | Check that is the form  already have the values ?
	 |-------------------------------------------------------
	 * Form does have the values and `keepAlive` setting is true,
	 * then no need to re-initialize the form value else hit the event to intialize the value
	 *
	 */
	mounted: function () {

	},
	created: function () {
		this.setup();
	},
	/*
	 |--------------------------------------------------------------------------------
	 | Check if Keep alive is false then delete the all form value and assign the null.
	 |--------------------------------------------------------------------------------
	 *
	 */
	destroyed: function () {
		this.destroyedForm();
	},
	computed: {

		formValues: function () {

			return cloneDeep(helper.getProp(this.$store.state.form, `${this.formName}.values`, {}));
		},
		formInitialvalues: function () {

			return helper.getProp(this.$store.state.form, `${this.formName}.initialize_values`, null);
		},
		formErrors: function () {

			return helper.getProp(this.$store.state.form, `${this.formName}.errors`, {});
		},
		isReady: function () {

			return helper.getProp(this.$store.state.form, `${this.formName}.isReady`, true);
		},
		dirty: function () {

			const fields = helper.getProp(this.$store.state.form, `${this.formName}.fields`, {});
			const fieldNames = Object.keys(fields);
			return fieldNames.some(fieldName => fields[fieldName].dirty === true)
		},
		isSubmiting: function () {

			return helper.getProp(this.$store.state.form, `${this.formName}.isSubmiting`, false);
		},
		/**
		 * Get the form permission form store.
		 */
		formPermission: function () {
			return helper.getProp(this.$store.state.form, `${this.formName}.permission`, null);
		},
		formData: function () {
			return this.$lqForm.formData(this.formName);
		}
	},

	methods: {
		forceRerender() {
			// Remove my-component from the DOM
			this.renderComponent = false;

			this.$nextTick(() => {
				// Add the component back in
				this.renderComponent = true;
			});
		},
		setup: function () {
			this.formName = this.name;
			this.ready(true);
			this.submiting(false);
			this.$store.dispatch('form/addSettings', {
				formName: this.formName, settings: {
					transformKeys: this.transformKeys,
					extraDataKeys: this.extraDataKeys,
					submit: this.submit,
					test: this.validate,
					// dirty: false
				}
			});
		},
		/*
		 |-----------------------------------
		 | To get given element value
		 |-----------------------------------
		 * @param elementName => String
		 * If element is an array then name path should be concat with comma like
		 * element is name: [1,2,3,4] and you want to delete the second element than
		 * name value should be like: `name.1`
		 */
		getElement: function (elementName, defaultValue) {

			const val = helper.getProp(this.formValues, elementName, []);
			return val && val.length ? val : (defaultValue ? [defaultValue] : []);
		},

		/*
		 |----------------------------------------
		 | To add new Element in last of an Array
		 |----------------------------------------
		 * @param elementName => String,
		 * @param default_value => any,
		 */

		push: function (elementName, defaultValue) {
			this.$store.dispatch('form/addNewElement', { formName: this.formName, elementName: elementName, value: defaultValue })
		},

		/*
		 |----------------------------------------
		 | To add new Element in start of an Array
		 |----------------------------------------
		 * @param elementName => String,
		 * @param default_value => any,
		 * Note after that we will re-arrange the error index.
		 */

		unshift: function (elementName, defaultValue) {
			this.$store.dispatch('form/addNewElementUnshift', { formName: this.formName, elementName: elementName, value: defaultValue })
		},

		/*
		 |-----------------------------------
		 | To remove the element
		 |-----------------------------------
		 * @param elementName => String
		 * If element is an array then name path should be concat with comma like
		 * element is name: [1,2,3,4] and you want to delete the second element than
		 * name value should be like: `name.1`
		 */
		remove: function (elementName) {

			this.$store.dispatch('form/removeElement', { formName: this.formName, elementName: elementName });
		},

		/*
		 |-----------------------------------
		 | To get the element error
		 |-----------------------------------
		 * @param elementName => String
		 * If element is an array then name path should be concat with comma like
		 * element is name: [1,2,3,4] and you want to delete the second element than
		 * name value should be like: `name.1`
		 */
		getErrors: function (elementName) {

			return elementName ? this.formErrors.elementName : this.formErrors;
		},
		addErrors: function (errors) {

			this.$lqForm.addErrors(this.formName, errors);
		},
		addError: function (elementName, errors) {

			this.$lqForm.addError(this.formName, elementName, errors);
		},
		removeError: function (elementName) {

			this.$lqForm.removeError(this.formName, elementName);
		},
		ready: function (status) {

			this.$lqForm.ready(this.formName, status);
		},
		submiting: function (status) {

			this.$lqForm.submiting(this.formName, status);
		},
		hasError: function () {
			const errors = this.getErrors();
			if (window.validatejs.isEmpty(errors)) {
				return false;
			}
			return true;
		},
		canShow(elementName) {
			return this.elementVisibility[elementName] || this.elementVisibility[elementName] === undefined
		},
		touchStatus: function (elementName, status) {
			this.$lqForm.touchStatus(this.formName, elementName, status);
		},

		validate: async function () {
			const fields = { ...this.$store.getters['form/fields'](this.formName) };
			const elementNames = Object.keys(fields);
			this.ready(false);
			let tests = [];
			elementNames.forEach(elementName => {
				let test = fields[elementName].test;
				if (typeof test === "function") {
					tests.push(test(false, false, false));
				}
			});
			return Promise.all(tests).then(() => {
				this.ready(true);
			});
		},

		submit: async function (more_data, shouldEmitEvents, cancle) {
			shouldEmitEvents = shouldEmitEvents === undefined ? true : shouldEmitEvents;
			if (!this.canSubmit()) {
				this.$root.$emit('can-not-submit', this);
				return Promise.reject({ reason: 'can-not-submit' })
			}
			this.$lqForm.removeErrors(this.formName);

			await this.validate();

			if (this.hasError()) {
				this.$root.$emit('has-error', this);
				this.$emit('errors', this)
				return Promise.reject({ reason: 'loacl-error' })
			}

			const _method = this.requestMethod.toString().toLowerCase()
			const CancelToken = axios.CancelToken;

			let axiosConfig = {
				url: this.action,
				method: this.requestMethod,
				cancelToken: typeof cancle === 'function' ? new CancelToken(cancle) : undefined
			}

			let data = this.formData;
			if (more_data) {
				data = { ...data, ...more_data };
			}

			/**
			 * Assign Data In Config 
			 */

			if (_method === 'get') {
				axiosConfig.url = axiosConfig.url + '?' + helper.objectToQueryString(data)
				// axios.paramsSerializer = (params) => helper.objectToQueryString(params)
			} else {
				// console.log('data', data)
				axiosConfig.data = (this.contentType === 'formdata') ? helper.objectToFormData(data) : data
			}


			// When form data is valid
			if (!this.action || !this.$axios) {
				console.error('You must have to define the action in form props and $axios as vue property.')
				return;
			}
			this.submiting(true);
			if (this.contentType === 'formdata' && _method === 'GET') {
				console.error('For get Method formdata is not possible.');
				return;
			}

			return this.$axios(axiosConfig)
				.then((response) => {
					this.submiting(false);
					if (shouldEmitEvents) {
						this.$emit('submited-success', response, this);
						this.$root.$emit('submited-success', response, this);
					}
					if (typeof lqFormOptions.afterRequestResolved === 'function') {
						lqFormOptions.afterRequestResolved.call(this, response)
					}
					return Promise.resolve(response);
				})
				.catch((error) => {

					this.submiting(false);
					if (shouldEmitEvents) {
						this.$emit('submited-error', error, this);
						this.$root.$emit('submited-error', error, this);
					}
					if (typeof lqFormOptions.afterRequestResolved === 'function') {
						lqFormOptions.afterRequestResolved.call(this, error)
					}
					if (helper.getProp(error, 'response.status') === 422 && this.autoAssignErrors) {

						let errors = helper.getProp(error, this.errorKey, {})
						this.compliesErrors(errors)
						this.addErrors(errors);
						const error_field_names = Object.keys(errors)
						if (error_field_names.length && this.scrollToErrorField) {
							const element = document.getElementById(error_field_names[0]);
							element ? element.scrollIntoView() : null;
						}
					}
					return Promise.reject(error)
				})
		},
		compliesErrors(errors) {
			if (this.transformKeys) {
				this.transformKeys.forEach(tk => {
					const keys = tk.split(':');
					if (keys.length === 2) {
						const dataKeyFrom = keys[1];
						const dataKeyto = keys[0];
						const hasAsterisk = dataKeyFrom.includes('*')
						if (hasAsterisk && typeof errors === 'object') {
							// 
							const error_keys = Object.keys(errors)
							error_keys.forEach((k) => {
								let replace_digit_to_asterisk = k.replace(/\.+([0-9]+)+\./gi, '.*.');
								if (replace_digit_to_asterisk === dataKeyFrom) {
									const _val = errors[k]
									if (_val) {
										delete errors[k]
										// Now Time to Transform
										let to_key_arr = dataKeyto.split('.');
										const lastToKey = to_key_arr.pop();
										let current_key = k.split('.')
										current_key.pop()
										current_key.push(lastToKey)
										errors[current_key.join('.')] = _val
									}
								}
							})
						} else {
							const error_val = helper.getProp(errors, [dataKeyFrom]);
							if (error_val) {
								helper.deleteProp(errors, [dataKeyFrom]);
								helper.setProp(errors, [dataKeyto], error_val)
							}
						}
					}
				})
			}
		},
		canSubmit: function () {
			return this.isReady && !this.isSubmiting;
		},
		destroyedForm() {
			if (!this.keepAlive) {
				this.$lqForm.deleteForm(this.formName);
			}
		}
	},
	watch: {
		name: function () {
			this.setup();
			this.forceRerender();
		}
	}
}

export default formMixin;