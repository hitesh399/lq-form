const lqFormOptions = {
    options: {
        pageSize: 30,
        dataKey: 'data.data',
        totalKey: 'data.total',
        primaryKey: 'id',
        pageSizeKey: 'page_size',
        pageKey: 'page',
        currentPageKey: 'data.current_page'
    },
    get pageSize() {
        return this.options.pageSize
    },
    get dataKey() {
        return this.options.dataKey
    },
    get totalKey() {
        return this.options.totalKey
    },
    get primaryKey() {
        return this.options.primaryKey
    },
    get pageSizeKey() {
        return this.options.pageSizeKey
    },
    get pageKey() {
        return this.options.pageKey
    },
    get currentPageKey() {
        return this.options.currentPageKey
    },
    merge: function (options) {
        this.options = {
            ...this.options,
            ...this.extractOptions(options)
        }
    },
    extractOptions(attrs) {
        const option_keys = Object.keys(this.options)
        let data = {}
        option_keys.forEach(k => {
            const val = attrs[k]
            if (val !== undefined) {
                data[k] = val
            }
        })
        return data;
    }
}
export { lqFormOptions }