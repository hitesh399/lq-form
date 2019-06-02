import Vue from 'vue';
import rForm from '../../mixins/formMixin';
import helper from 'vuejs-object-helper';

export default Vue.extend({
    mixins: [rForm],
    name: 'r-form-list',
    render: function (createElement) {
        let props = this.$attrs;
        return createElement(this.tag, {
            props
        }, this.$scopedSlots.default({
            items: this.items,
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
        }))
    },
    props: {
        requestMethod: {
			type: String,
			default: () => 'GET'
		},
        dataKey: {
            type: [String, Array],
            default: () => 'data.data'
        },
        totalKey: {
            type: [String, Array],
            default: () => 'data.total'
        },
        primaryKey: {
            type: String,
            default: () => 'id'
        },
        pageSizeKey: {
            type: String,
            default: () => 'page_size'
        },
        pageKey: {
            type: String,
            default: () => 'page'
        },
        currentPageKey: {
            type: [String, Array],
            default: () => 'data.current_page'
        },
        type: {
            type: String,
            validate: (v) => ['table', 'list'].indexOf(value) !== -1,
            default: () => 'list'
        },
        tag: {
            type: String,
            default: () => 'div'
        },
        staticData: Object
    },
    computed: {

        currentData: function () {
            let dataKey = ['table', this.name, 'data'];
            if (this.type === 'table') {
                dataKey.push('page_' + this.currentPage);
            }
            return helper.getProp(this.$store.state, dataKey, []);
        },
        items: function () {
            if (this.type === 'table') {
                return this.requesting ? this.previousPageData : this.currentData;
            } else {
                return this.currentData;
            }
        },
        currentPage: function () {
            return helper.getProp(this.$store.state, ['form', this.formName, 'values', 'page'], 1);
        },
        previousPageData: function() {
            return helper.getProp(this.$store.state, ['table', this.name, 'data', 'page_' + this.previousPage], []);
        },
        previousPage: function (){
            return helper.getProp(this.$store.state, ['table', this.name, 'settings', 'prev_page'], 1);
        },
        pageSize: function () {
            return helper.getProp(this.$store.state, ['form', this.formName, 'values', 'page_size'], 15);
        },
        total: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'settings', 'total'], 0);
        },
        requesting: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'requesting'], false);
        }
    },
    methods: {
        setup: function() {
            /**
             * Define Form Namne
             */
            this.formName = this.name + '_list';
            /**
             * Add Form initial setting in state
             */
            this.ready(true);
			this.submiting(false);
			this.$store.dispatch('form/addSettings', {formName: this.formName, settings: {
				transformKeys: this.transformKeys,
				extraDataKeys: Object.assign([], [this.pageSizeKey, this.pageKey], this.extraDataKeys),
				submit: this.submit,
				test: this.validate
            }});

            /**
             * Store table setting data in state
             */
            this.$store.dispatch('table/updateSettings', {tableName: this.name, settings: {
                data_key: this.dataKey,
                total_key: this.totalKey,
                current_page_key: this.currentPageKey,
                primary_key: this.primaryKey,
                type: this.type,
                static_data: this.staticData,
                page_size_key: this.pageSizeKey,
                page_key: this.pageKey
            }})

            /**
             * Request to server
             */
            this.$store.dispatch('table/get', {tableName: this.name});

            /**
             * Form Element value changes.
             */
            this.$root.$on(this.formName + '_changed', () => {
                this.$lqTable.filter(this.name);
            })
        },
        switchPage: function(page) {
            this.$lqTable.switchPage(this.name, page);
        },
        changePageSize: function (page_size) {
            this.$lqTable.changePageSize(this.name, page_size);
        },
        next: function() {
            const page = this.currentPage + 1;
            this.$lqTable.switchPage(this.name, page);
        },
        filter: function() {
            this.$lqTable.filter(this.name);
        },
        refresh: function(changePage = false) {
            this.$lqTable.refresh(this.name, changePage);
        },
        updateRow: function(row ) {
            this.$lqTable.updateRow(this.name, row);
        },
        deleteRow: function(row) {
            this.$lqTable.deleteRow(this.name, row);
        }
    },
    beforeDestroy() { 
        this.$lqTable.deletePagesData(this.name);
        this.$root.$off(this.formName + '_changed');
    },
    watch: {
        staticData: function (newStaticData, oldStaticData) {
            this.$store.dispatch('table/addStaticData', {tableName: this.name, data: newStaticData});
            this.refresh(true);
        }
    }
})


    