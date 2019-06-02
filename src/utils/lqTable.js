
export default {

    install (Vue, options) {
        const store = options.store;
        Object.defineProperty(Vue.prototype, '$lqTable',   {value: new helper(store) });
    }
}

export function helper(store) {

    this.switchPage =  function (tableName, page) {
        store.dispatch('table/switchPage',{tableName, page})
    }
    this.changePageSize = function (tableName, page_size) {
        store.dispatch('table/changePageSize',{tableName, page_size})
    }
    this.updateRow = function (tableName, row, primaryKey) {
        store.dispatch('table/updateRow', {tableName, row, primaryKey});
    }
    this.deleteRow = function (tableName, row, primaryKey) {
        store.dispatch('table/deleteRow', {tableName, row, primaryKey});
    }
    this.filter = function (tableName) {
        store.dispatch('table/filter',{tableName})
    }
    this.refresh = function (tableName, changePage = false ) {
        store.dispatch('table/filter',{tableName, changePage})
    }
    this.getCurrentPage = function (tableName) {
        const formData = store.getters['table/formValues'](tableName)
        return formData && formData.page ? formData.page : 1;
    }
    this.getPageSize = function (tableName, defaultPageSzie) {
        const formData = store.getters['table/formValues'](tableName)
        return formData && formData.page_size ? formData.page_size : (defaultPageSzie ? defaultPageSzie : 15);
    }
    this.getElemnetVal = function (tableName, name) {
        const formData = store.getters['table/formValues'](tableName)
        return formData && formData[name] ? formData[name] : null;
    }
    this.getElemnetSortBy = function (tableName) {
        const formData = store.getters['table/formValues'](tableName)
        return formData && formData['sort_by'] ? formData['sort_by'] : null;
    }
    /**
     * To remove all page data.
     * @param {String} tableName 
     */
    this.deletePagesData = function (tableName) {
        store.dispatch('table/removePagesData', {tableName});
    }
}