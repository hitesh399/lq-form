import helper from 'vuejs-object-helper';
const _  = require('lodash');

const state = {
	
}
const getters = {

	errros: (state) => (formName) => {
		return state[formName] && state[formName].errors ? state[formName].errors : {};
	},
	values: (state) => (formName) => {
		return state[formName] && state[formName].values ? state[formName].values : {};
	},
	settings: (state) => (formName) => {
		return state[formName] && state[formName].settings ? state[formName].settings : {};
	},
	fields: (state) => (formName) => {
		return state[formName] && state[formName].fields ? state[formName].fields : {};
	}
}

const actions = {

	setElementValue({commit}, {formName, elementName, value}) {

		commit('saveElementValue', { formName,  elementName,  value});
	},
	addNewElement({commit}, {formName, elementName, value}) {

		commit('pushNewElement', {formName, elementName,  value});
	},
	addNewElementUnshift({commit}, {formName, elementName, value}) {

		commit('unshiftNewElement', { formName, elementName,  value});
	},
	removeElement({commit}, {formName, elementName}) {

		commit('deleteElement', {formName, elementName});
	},
	/**
	 * Errors Functions
	 */

	addErrors({commit}, {formName, errors}) {

		commit('saveDataKey', { formName, data: errors, dataKey: 'errors'});
	},
	addError({commit}, {formName, elementName, errors}) {

		commit('updateDataKey', { formName, elementName, data: errors, dataKey: 'errors'});
	},
	removeErrors({commit}, {formName}) {

		commit('destroyDataKey', { formName, dataKey: 'errors'});
	},
	removeError({commit}, {formName, elementName}) {

		commit('deleteDataKey', { formName, elementName, dataKey: 'errors'});
	},
	addSettings({commit}, {formName, settings}) {

		commit('saveDataKey', { formName, data: settings, dataKey: 'settings'});
	},
	addSetting({commit}, {formName, name, value}) {

		commit('updateDataKey', { formName, elementName: name, data: value, dataKey: 'settings'});
	},
	addTransformKey({commit}, {formName, key}) {
		commit('addNewTransformKey', {formName, key})
	},
	isReady({commit}, {formName, status}) {

		commit('changeStatus', {formName, statusKey: 'isReady', status})
	},
	isSubmiting({commit}, {formName, status}) {
		
		commit('changeStatus', {formName, statusKey: 'isSubmiting', status})
	},
	addProps({commit}, {formName, elementName, value}) {
		
		commit('saveFieldProps', {formName, elementName, value});
	},
	addProp({commit}, {formName, elementName, key, value}) {
		
		commit('saveFieldProp', {formName, elementName, key, value});
	},
	removeField({commit}, {formName, elementName}) {
		
		commit('deleteField', {formName, elementName});
	},
	removeForm({commit}, {formName}) {

		commit('deleteForm', {formName})
	},
	addFields({commit}, {formName, fields}) {
		
		commit('saveFields', {formName, fields});
	},	

	initializeValues({commit}, {formName, values}) {

		commit('saveInitializeValues', {formName, values});
	},
	resetForm({commit, state}, {formName}) {

		const initialize_values = helper.getProp(state, [formName, 'initialize_values'], {});
		commit('saveValues', {formName, values: _.cloneDeep(initialize_values)});
	},
	
	/**
	 * To set the form Permissions
	 * @param {Object} param0 
	 * @param {Object} param1 
	 */
	setPermission({commit}, {formName, permission}) {

		commit('savePermission', {formName, permission});
	}
}

const mutations = {
	
	addNewTransformKey(state, {formName, key}) {

		helper.pushProp(state, `${formName}.settings.transformKeys`, key);
	},
	saveElementValue(state, {formName, elementName, value}) {

		helper.setProp(state, `${formName}.values.${elementName}`, value, true)
	},
	pushNewElement(state, {formName, elementName, value}) {

		helper.pushProp(state, `${formName}.values.${elementName}`, value)
	},
	unshiftNewElement(state, {formName, elementName, value}) {

		helper.unshiftProp(state, `${formName}.values.${elementName}`, value)
	},

	updateDataKey(state, {formName, elementName, data, dataKey}){

		helper.setProp(state, [formName, dataKey, elementName], data, true); 
	},
	saveDataKey(state, {formName, data, dataKey}){

		helper.setProp(state, [formName, dataKey ], data, true);
	},
	deleteDataKey(state, {formName, elementName, dataKey}) {

		helper.deleteProp(state, [formName, dataKey, elementName]); 
	},
	destroyDataKey(state, {formName, dataKey}) {

		helper.deleteProp(state, [formName, dataKey ]);
	},

	/**
	 * Save the initialize form value and also update the value key
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	saveInitializeValues(state, {formName, values}) {
		
		helper.setProp(state, [formName, 'initialize_values'], _.cloneDeep(values), true);
		helper.setProp(state, [formName, 'values'], _.cloneDeep(values), true);
	},

	saveValues(state, {formName, values}) {

		helper.setProp(state, [formName, 'values'], values, true);
	},

	deleteForm(state, {formName}) {
		helper.deleteProp(state, [formName]);
	},

	/**
	 * To change the Form status like isReady or isSubmiting
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	changeStatus(state, {formName, statusKey, status}){

		helper.setProp(state, [formName, statusKey ], status, true);	
	},

	/**
	 * To save the Field single Properties
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	saveFieldProp(state, {formName, elementName, key, value}) {

		helper.setProp(state, [formName, 'fields', elementName, key ], value, true);	
	},

	/**
	 * To save field all properties.
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	saveFieldProps(state, {formName, elementName, value}) {

		helper.setProp(state, [formName, 'fields', elementName ], value, false);
	},
	/**
	 * To save all elements properties.
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	saveFields(state, {formName, fields}) {

		helper.setProp(state, [formName, 'fields' ], fields, true);
	},
	/**
	 * To Delete element key form the Field Object. 
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	deleteField(state, {formName, elementName}){

		helper.deleteProp(state, [formName, 'fields', elementName]);
	},

	/**
	 * To Delete the element
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	deleteElement(state, {formName, elementName}) {

		// Removing the Error
		this.dispatch('form/removeError', { formName, elementName});

		// Rearrange the Errors index
		let errors = {...this.getters['form/errros'](formName)};
		let updatedErrors = helper.reArrangeObjectIndex(errors, elementName);		
		if(updatedErrors){
			this.dispatch('form/addErrors', { formName, errors: updatedErrors});
		}

		/**
		 * Deleting the Field Index from Fields Object and Re-arrange the Indexing.
		 */
		// Removing Field
		this.dispatch('form/removeField', { formName, elementName});

		// Rearrange the Errors Information index
		let fields = {...this.getters['form/fields'](formName) };
		let updatedfields = helper.reArrangeObjectIndex(fields, elementName);

		if(updatedfields){
			this.dispatch('form/addFields', { formName, fields: updatedfields});
		}

		// Deleting the element
		helper.deleteProp(state, `${formName}.values.${elementName}`);
	},

	/**
	 * To save the form permission
	 * @param {Object} state 
	 * @param {Object} param1 
	 */
	savePermission(state, {formName, permission}) {

		helper.setProp(state, [formName, 'permission' ], permission, true);
	}
}


export default  {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
