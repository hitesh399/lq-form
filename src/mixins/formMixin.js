import helper from 'vuejs-object-helper';
const _  = require('lodash');
// const validateJs = require('validate.js');

const formMixin = {

	props: {
		name: {
			type: String,
			required: true,
		},
		keepAlive: {
			type: Boolean,
			default: function(){ return false;}
		},
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
		displayInlineError: {
			type: Boolean,
			default: function () {return true}
		},
		rules: Object,
		extraDataKeys: Array,
	},
	data: function(){
		return {
			formName: null
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
		this.formName = this.name;
		this.ready(true);
		this.submiting(false);
		this.$store.dispatch('form/addSettings', {formName: this.formName, settings: {
			transformKeys: this.transformKeys,
			extraDataKeys: this.extraDataKeys,
			submit: this.submit,
			test: this.validate
		}});
	},
	/*
	 |--------------------------------------------------------------------------------
	 | Check if Keep alive is false then delete the all form value and assign the null.
	 |--------------------------------------------------------------------------------
	 *
	 */
	destroyed: function () {	
		
		if(!this.keepAlive) {
			this.$lqForm.deleteForm(this.formName);
		}
	},
	computed: {

		formValues: function () {

			return _.cloneDeep(helper.getProp(this.$store.state.form,`${this.formName}.values`, {}));
		},
		formInitialvalues: function () {

			return helper.getProp(this.$store.state.form,`${this.formName}.initialize_values`, null);
		},
		formErrors: function () {

			return helper.getProp(this.$store.state.form,`${this.formName}.errors`, {});
		},
		isReady: function () {

			return helper.getProp(this.$store.state.form,`${this.formName}.isReady`, true);
		},
		isSubmiting: function () {

			return helper.getProp(this.$store.state.form,`${this.formName}.isSubmiting`, false);
		},		
		/**
		 * Get the form permission form store.
		 */
		formPermission: function () {
			return helper.getProp(this.$store.state.form,`${this.formName}.permission`, null);
		},
		formData: function () {
			return this.$lqForm.formData(this.formName);
		}
	},

	methods: {


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
		 	
			 const val =  helper.getProp(this.formValues, elementName , []);
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
			this.$store.dispatch('form/addNewElement', {formName: this.formName, elementName: elementName, value: defaultValue})
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
			this.$store.dispatch('form/addNewElementUnshift', {formName: this.formName, elementName: elementName, value: defaultValue})
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
			
			this.$store.dispatch('form/removeElement', {formName: this.formName, elementName: elementName});
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
			
			this.$lqForm.addErrors(this.formName,  errors);
		},
		addError: function (elementName, errors) {

			this.$lqForm.addError(this.formName, elementName, errors);
		},
		removeError: function (elementName) {
			
			this.$lqForm.removeError( this.formName, elementName);
		},
		ready: function (status) {
			
			this.$lqForm.ready( this.formName, status);			
		},
		submiting: function (status) {
			
			this.$lqForm.submiting( this.formName, status);
		},
		hasError: function () {
			const errors = this.getErrors();
			if(window.validatejs.isEmpty(errors)){
				return false;
			}
			return true;
		},
		touchStatus: function(elementName, status) {
			this.$lqForm.touchStatus(this.formName, elementName, status);
		},
		

		validate: async function () {
			const fields = {...this.$store.getters['form/fields'](this.formName)};
			const elementNames = Object.keys(fields);
			this.ready(false);
			let tests = [];
			elementNames.forEach(elementName => {
				let test = fields[elementName].test;
				if(typeof test === "function") {
					tests.push(test(false));
				}
			});
			return Promise.all(tests).then(() => {
				this.ready(true);
			});
		},

		submit: async function(more_data, shouldEmitEvents) {
			shouldEmitEvents = shouldEmitEvents === undefined ? true : shouldEmitEvents;
			if (!this.canSubmit()) {
				this.$root.$emit('can-not-submit', this);
				return;
			}
			await this.validate();
			
			if (this.hasError()) {
				this.$root.$emit('has-error', this);
				this.$emit('errors', this)
				return;
			}

			let data =  this.formData;
			if(more_data) {
				data = {...data, ...more_data};
			}
			// When form data is valid
			if (!this.action || !this.$axios) {
				console.warn('You must have to define the action in form props and $axios as vue property.')
				return;
			}
			this.submiting(true);
			if (this.contentType === 'formdata' && this.requestMethod === 'GET') {
				console.warn('For get Method fordata is not possible.');
				return;
			}			
			if (this.contentType === 'formdata') {
				data = helper.objectToFormData(data);
			}
			let url = this.action;
			if (this.requestMethod === 'GET') {
				url += '?' + helper.objectToQueryString(data)
			}
			return this.$axios({
				url: url,
				method: this.requestMethod,
				data
			})
			.then((response) => {
				this.submiting(false);
				if(shouldEmitEvents) {
					this.$emit('submited-success', response, this);
					this.$root.$emit('submited-success', response, this);
				}
				return Promise.resolve(response);
			})
			.catch((error) => {

				this.submiting(false);
				if (shouldEmitEvents) {
					this.$emit('submited-error', error, this);
					this.$root.$emit('submited-error', error, this);
				}
				if (helper.getProp(error, 'response.status') === 422 && this.displayInlineError) { 					  
					this.addErrors(error.response.data.errors);
					const error_field = helper.getProp(error, 'response.data.errors', {});
					const error_field_names = error_field ? Object.keys(error_field) : [];

					if (error_field_names.length && this.scrollToErrorField) {
						const element = document.getElementById(error_field_names[0]);
						element ? element.scrollIntoView(): null;
					}
				}
				return Promise.reject(error)
			})
		},
		canSubmit: function() {
			return this.isReady && !this.isSubmiting;
		}
	}
}

export default formMixin;