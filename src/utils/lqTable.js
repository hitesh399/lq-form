
export default {

    install (Vue, options) {
        const store = options.store;
        Object.defineProperty(Vue.prototype, '$lqTable',   {value: new helper(store) });
    }
}

function helper(store) {

    this.pageChange =  function (tableName, page) {

        store.dispatch('table/switchPage',{tableName, page})
    },
    this.pageSizeChange = function (tableName, page_size) {

        store.dispatch('table/changePageSize',{tableName, page_size})
    },
    this.updateRow = function (tableName, row, primaryKey) {

        store.dispatch('table/updateRow', {tableName, row, primaryKey});
    },
    this.filter = function (tableName, page) {

        store.dispatch('table/filter',{tableName, page})
    },
    this.refresh = function (tableName ) {

        store.dispatch('table/filter',{tableName, changePage: false})
    },
    this.getCurrentPage = function (tableName) {

        const formData = store.getters['table/formValue'](tableName)
        return formData && formData.page ? formData.page : 1;
    }
    this.getPageSize = function (tableName, defaultPageSzie) {

        const formData = store.getters['table/formValue'](tableName)
        return formData && formData.page_size ? formData.page_size : (defaultPageSzie ? defaultPageSzie : 15);
    },
    this.getElemnetVal = function (tableName, name) {

        const formData = store.getters['table/formValue'](tableName)
        return formData && formData[name] ? formData[name] : null;
    },
    this.getElemnetSortBy = function (tableName) {

        const formData = store.getters['table/formValue'](tableName)
        return formData && formData['sort_by'] ? formData['sort_by'] : null;
    },
    /**
     * To remove all page data.
     * @param {String} tableName 
     */
    this.deletePagesData = function (tableName) {

        store.dispatch('table/removePagesData', {tableName});
    },
    /**
     * Set the list Data 
     */
    this.fetchListData = function (tableName, request, settings) {
        
        settings = settings ? settings : {};
        store.dispatch('table/updateSettings', {tableName, settings: {...settings, request: request, type: 'list'} })        
        store.dispatch('table/get', {tableName});        
    }
}