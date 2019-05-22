import helper from 'vuejs-object-helper';
const tableFormSuffix = '_lq_table_form';
import { lqFormHelper } from '../../utils/formhelper';
const Formhelper = new lqFormHelper(null);

let _call_back = {};
/**
 * Fetch data from server.
 * @param {Function} commit 
 * @param {Function} request 
 * @param {Object} data 
 * @param {String} tableName 
 * @param {Boolean} shouldDeleteAllData, if true then system will delete all data before adding the new data 
 */
function fetch(commit, dispatch, request, tableName, state) {

    const data_key  = state[tableName].settings.data_key;
    const total_key  = state[tableName].settings.total_key;
    const current_page_key  = state[tableName].settings.current_page_key;
    const type  = state[tableName].settings.type;
    const requesting  = state[tableName].requesting;
    if (requesting) {
        _call_back[tableName] = () => { fetch(commit, dispatch, request, tableName, state) }
        return ;
    }
    commit('updateRequestingStatus', {tableName, status: true});
    return request()
        .then((response) => {
                /**
             * Deleting the all data when page changed.
             */
            
            if(shouldDeleteAllData)
                commit('deleteAllData', {tableName});
            /**
             * Changing the request status as false
             */
            commit('updateRequestingStatus', {tableName, status: false});
            /**
             * Geting the data, current_page  veriable value from the serevr response.
             */
    
            const current_page = current_page_key ? helper.getProp(response, current_page_key , 1) : 1;
            const data = helper.getProp(response, data_key, []);

            /**
             * Current page is greater than 1 and doesn't have data before request resolve then move to previous page
             * So the page does not display blank when switching page. it is usefull when using the pagination.
             */
            if (current_page > 1 && data.length === 0) {
                dispatch('table/switchPage', {tableName, page: current_page -1 });
                return;
            }

            /**
             * Get the total length of data and set in total key, 
             */
            if (current_page === 1) {
                const total = total_key ? helper.getProp(response, total_key , data.length): data.length;
                commit('updateSetting', {tableName, key: 'total', value: total} );
            }

            /**
             * Set the given page data 
             */
            if (type === 'table') {
                commit('saveData', {tableName, data, page: current_page});
            } else {
                commit('saveListData', {tableName, data});
            }
            /**
             * Set the key of loading page,
             * To maintain the record that how many page's data is loaded in state.
             */
            commit('addLoadedPage', {tableName, page: current_page});

            if (_call_back[tableName]) {
                _call_back[tableName]()
                delete _call_back[tableName]
            }

        }).catch((e) => {
            /**
             * Changing the request status as false
             */
            commit('updateRequestingStatus', {tableName, status: false});
            delete _call_back[tableName]
            throw Error(e);
        })
    
}

const getters = {

    formValue: (state, getters, rootState, rootGetters) => (tableName) => {
        return Formhelper.formData(tableName + tableFormSuffix, rootGetters);
    },
    request: (state, getters, rootState, rootGetters) => (tableName) => {
        const static_data = helper.getProp(state, [tableName, 'settings', 'static_data'], {});
        return () => Formhelper.submit(tableName + tableFormSuffix, static_data, false, rootGetters);
    },
    hasPages: (state) => (tableName) => {
        return helper.getProp(state, [tableName, 'settings', 'has_pages'], []);
    }
}
const state = {}

const actions = {

    filter({commit, state}, {tableName, changePage}) {
        
        const request = this.getters['table/request'](tableName);
        if(request) {
            /**
             * update previous page value, This will help to display the previous page data till the request resloved.
             */
            const current_page = helper.getProp(state,[tableName,'settings', 'prev_page'], 1);
            commit('updateSetting', {tableName, key: 'prev_page', value:  current_page})
            /**
             * Set the current page value 1
             */
            if(changePage === undefined || changePage)
                this.dispatch('form/setElementValue', {formName: tableName + tableFormSuffix, elementName: 'page', value: 1});

            commit('deleteAllData', {tableName});
            /**
             * Action to get the first page data
             */
            fetch(commit, this.dispatch, request, tableName, state);
        }
        else {

            throw Error('Request instance is not available.')
        }
    },
    switchPage({commit, state},  {tableName, page, force}) {
        
        const request = this.getters['table/request'](tableName);

        if (request) {
            /**
             * update previous page value, This will help to display the previous page data till the request resloved.
             */
            const current_page = helper.getProp(state,[tableName,'settings', 'prev_page'], 1);
            commit('updateSetting', {tableName, key: 'prev_page', value:  current_page})

            /**
             * Updating the current page value
             */
            this.dispatch('form/setElementValue', {formName: tableName + tableFormSuffix, elementName: 'page', value: page});         

            /**
             * Force is true, removing the data from data.
             */
            if (force) commit('deleteAllData', {tableName});

            /**
             * if this Page data is already in state and don't need to get the data from server
             */
            const has_pages = this.getters['table\hasPages'](tableName);
            if (!has_pages.includes('page_' + current_page) && !force) return;

            /**
             * Action to get the given page data.
             */
            fetch(commit, this.dispatch, request, tableName, state);
        } else {

            throw Error('Request instance is not available.')
        }
    },
    changePageSize({commit, state}, {tableName, page_size}) {
        const request = this.getters['table/request'](tableName);
        if (request) {
            /**
             * update previous page value, This will help to display the previous page data till the request resloved.
             */
            const current_page = helper.getProp(state,[tableName,'settings', 'prev_page'], 1);
            commit('updateSetting', {tableName, key: 'prev_page', value:  current_page})

            /**
             * updating the page size and set the current page value 1
             */
            this.dispatch('form/setElementValue', {formName: tableName +tableFormSuffix, elementName: 'page', value: 1});
            this.dispatch('form/setElementValue', {formName: tableName +tableFormSuffix, elementName: 'page_size', value: page_size});
            
            /**
             * Action to get the first page data on base of page size.
             */
            fetch(commit, this.dispatch, request, tableName, state);
        }
        else {

            throw Error('Request instance is not available.')
        }
    },
    /**
     * Action to change the requesting status
     * @param {Object} param0 
     * @param {Object} param1 
     */
    requestingStatus({commit}, {tableName, status}) {
        commit('updateRequestingStatus', {tableName, status})
    },
    
    updateSettings({commit}, {tableName, settings}) {
        commit('saveSettings', {tableName, settings})
    },

    /**
     * Get the data from server, this method also call to refresh the list
     * @param {TableName} param0 
     * @param {Static Data} param1 
     */
    get({commit, state}, {tableName}) {
        const request = this.getters['table/request'](tableName);
        if (request) {
            /**
             * Removing the data from data.
             */
            commit('deleteAllData', {tableName});

            /**
             * Fetching the data from server
             */
            fetch(commit, this.dispatch, request, tableName, state);

        } else {
            throw Error('Request instance is not available.')
        }
    },

    /**
     * Set the request static data
     * @param {Table Name} param0 
     * @param {Request Data} param1 
     */
    addStaticData({commit}, {tableName, data}) {
        commit('updateSetting', {tableName, key: 'static_data', value: data} );
    },
    /**
     * To removed all stored data.
     * @param {*} param0 
     * @param {*} param1 
     */
    removePagesData({commit }, {tableName}) {
        commit('deleteAllData', {tableName});
    },
    updateRow({commit }, {tableName, row, primaryKey}) {
        commit('updateDataRow', {tableName, row, primaryKey});
    }
}

const mutations = {

    /**
     * To update the setting's key value
     * @param {Object} state 
     * @param {Object} param1 
     */
    updateSetting(state, {tableName, key, value}) {
        helper.setProp(state, [tableName, 'settings', key], value, true);
    },
    /**
     * To update Requesting status
     * @param {Ibject} state 
     * @param {Object} param1 
     */
    updateRequestingStatus(state, {tableName, status}) {
        helper.setProp(state, [tableName, 'requesting'], status);
    },

    /**
     * mentain the index of page which data we have already in state.
     */
    addLoadedPage(state, {tableName, page}) {
        helper.pushProp(state, [tableName, 'settings', 'has_pages'], 'page_'+page);
    },

    /**
     * To Add all settings
     * @param {Object} state 
     * @param {Object} param1 
     */
    saveSettings(state, {tableName, settings}) {

        helper.setProp(state, [tableName, 'settings'], settings);
    },
    /**
     * To add a page data
     * @param {Object} state 
     * @param {Object} param1 
     */
    saveData(state, {tableName, data, page}) {
        helper.setProp(state, [tableName, 'data', 'page_' + page], data, true);
    },

    /**
     * To add a page data
     * @param {Object} state 
     * @param {Object} param1 
     */
    saveListData(state, {tableName, data}) {
        helper.pushProp(state, [tableName, 'data' ], data);
    },

    /**
     * Delete all data of table
     */
    deleteAllData(state, {tableName}) {
        const type  = state[tableName].settings.type;
        helper.setProp(state, [tableName, 'settings','has_pages' ], [], true);
        helper.setProp(state, [tableName, 'data'], (type ==='table' ? {}: []), true);
    },
    
    /**
     * To update the Data Row.
     * @param {Object} state 
     * @param {Object} param1 
     */
    updateDataRow(state, {tableName, row, primaryKey}) {
        const tablePrimaryKey = helper.getProp(state, [tableName, 'settings', 'primary_key'], null);
        const type = helper.getProp(state, [tableName, 'settings', 'type'], 'table');
        primaryKey = primaryKey ? primaryKey : (tablePrimaryKey ? tablePrimaryKey : 'id') ;

        /**
         * Update data row when view type is table
         */
        if (type == 'table') {
            const pages = helper.getProp(state, [tableName, 'settings', 'has_pages'], []);
            pages.map((page) => {
                
                const pageData = helper.getProp(state, [tableName, 'data', page], []);
                pageData.map((dataRow, dataIndex) => {

                    if (row[primaryKey] === dataRow[primaryKey]){
                        helper.setProp(state, [tableName, 'data', page, dataIndex], row);
                    }
                })
            })
        }
        /**
         * Update dats row when view type is list
         */
        else {
            const pageData = helper.getProp(state, [tableName, 'data' ], []);
            pageData.map((dataRow, dataIndex) => {
                if (row[primaryKey] === dataRow[primaryKey]){
                    helper.setProp(state, [tableName, 'data', dataIndex], row);
                }
            })
        }
    }    
}


export default  {
	namespaced: true,
	state,
	actions,
    mutations,
    getters
}