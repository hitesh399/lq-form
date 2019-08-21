import List from './index';
export default List.extend({
    name: 'r-list-filter',
    props: {
        tag: {
            type: String,
            default: () => 'div'
        }
    },
    render: function (createElement) {
        let props = this.$attrs;
        return createElement(
            this.tag, 
            {
                props
            }, 
            this.$scopedSlots.default({
                items: this.items,
                model: this.formValues,
                currentPage: this.currentPage,
                previousPage: this.previousPage,
                pageSize: this.pageSize,
                total: this.total,
                requesting: this.requesting,
                switchPage: this.switchPage,
                next: this.next,
                filter: this.filter,
                refresh: this.refresh,
                changePageSize: this.changePageSize,
                newIds: this.newIds
            })
        )
    },

    methods: {
        setup: function() {
            this.formName = this.name;
        },
        destroyedForm: function () {}
    }
})