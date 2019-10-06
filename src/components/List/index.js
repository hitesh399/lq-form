import Vue from 'vue';
import rForm from '../../mixins/formMixin';
import helper from 'vuejs-object-helper';
import { isEqual } from 'lodash/core'
import { lqFormOptions } from '../../defaultOptions';
import cloneDeep from 'lodash/cloneDeep'

export default Vue.extend({
    mixins: [rForm],
    name: 'r-list',
    render: function (createElement) {
        let props = this.$attrs;
        const slotProps = {
            model: this.formValues,
            switchPage: this.switchPage,
            filter: this.filter,
            refresh: this.refresh,
            changePageSize: this.changePageSize,
        };
        // console.log('I am her to go', this.$lqFormOptions)

        return createElement(
            this.tag,
            { props },
            [
                this.$scopedSlots['lq.top'] ? this.$scopedSlots['lq.top'](slotProps) : null,
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
                }),
                this.$scopedSlots['lq.bottom'] ? this.$scopedSlots['lq.bottom'](slotProps) : null,
            ]
        )
    },
    props: {
        requestMethod: {
            type: String,
            default: () => 'GET'
        },
        dataKey: {
            type: [String, Array],
            default: () => lqFormOptions.dataKey
        },
        totalKey: {
            type: [String, Array],
            default: () => lqFormOptions.totalKey
        },
        primaryKey: {
            type: String,
            default: () => lqFormOptions.primaryKey
        },
        pageSizeKey: {
            type: String,
            default: () => lqFormOptions.pageSizeKey
        },
        pageKey: {
            type: String,
            default: () => lqFormOptions.pageKey
        },
        defaultPageSize: {
            type: Number,
            default: () => lqFormOptions.pageSize
        },
        currentPageKey: {
            type: [String, Array],
            default: () => lqFormOptions.currentPageKey
        },
        type: {
            type: String,
            validate: (v) => ['table', 'list'].indexOf(value) !== -1,
            default: () => 'list'
        },
        keepAlive: {
            type: Boolean,
            default: function () { return true }
        },
        tag: {
            type: String,
            default: () => 'div'
        },
        autoFilter: {
            type: Boolean,
            default: () => true
        },
        staticData: Object,
        keepSelectedOnPageChange: {
            type: Boolean,
            default: () => true
        },
        otherServerData: Array
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
        manulFilterValues: function () {
            return helper.getProp(this.$store.state, ['manualfilter', this.name], {});
        },
        currentPage: function () {
            return helper.getProp(this.$store.state, ['form', this.name, 'values', 'page'], 1);
        },
        previousPageData: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'data', 'page_' + this.previousPage], []);
        },
        previousPage: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'settings', 'prev_page'], 1);
        },
        pageSize: function () {
            return helper.getProp(this.$store.state, ['form', this.name, 'values', 'page_size'], null);
        },
        total: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'settings', 'total'], 0);
        },
        newIds: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'settings', 'new_ids'], []);
        },
        requesting: function () {
            return helper.getProp(this.$store.state, ['table', this.name, 'requesting'], false);
        }
    },
    methods: {
        setup: function () {
            /**
             * Define Form Namne
             */
            this.formName = this.name;
            if (!this.pageSize) {
                this.$lqForm.setElementVal(this.name, this.pageSizeKey, this.defaultPageSize)
            }

            /**
             * Add Form initial setting in state
             */

            this.ready(true);
            this.submiting(false);
            this.$store.dispatch('form/addSettings', {
                formName: this.formName, settings: {
                    transformKeys: this.transformKeys,
                    extraDataKeys: [this.pageSizeKey, this.pageKey].concat(this.extraDataKeys ? this.extraDataKeys : []),
                    submit: this.submit,
                    test: this.validate
                }
            });

            /**
             * Store table setting data in state
             */
            this.$store.dispatch('table/updateSettings', {
                tableName: this.name, settings: {
                    data_key: this.dataKey,
                    total_key: this.totalKey,
                    current_page_key: this.currentPageKey,
                    primary_key: this.primaryKey,
                    type: this.type,
                    static_data: this.staticData,
                    page_size_key: this.pageSizeKey,
                    page_key: this.pageKey,
                    otherServerData: this.otherServerData
                }
            })

            /**
             * Request to server
             */
            this.$nextTick(() => {
                const response = this.$store.dispatch('table/get', { tableName: this.name });
                if (response) {
                    this.emitDataLoaded(response)
                }
            })

            /**
             * Form Element value changes.
             */
            if (this.autoFilter) {
                this.$root.$on(this.formName + '_changed', () => {
                    this.$lqTable.filter(this.name);
                })
            }
        },
        switchPage: function (page) {
            if (!this.keepSelectedOnPageChange) {
                this.$lqForm.removeElement(this.name, 'selected')
            }
            this.$lqTable.switchPage(this.name, page);
        },
        changePageSize: function (page_size) {
            this.$lqTable.changePageSize(this.name, page_size);
        },
        next: function (sendOffset = false, force = false) {
            const page = this.currentPage + 1;
            this.$lqTable.switchPage(this.name, page, sendOffset, force);
        },
        filter: function () {
            const response = this.$lqTable.filter(this.name);
            if (response) {
                this.emitDataLoaded(response)
            }
        },
        refresh: function (changePage = false) {
            const response = this.$lqTable.refresh(this.name, changePage);
            if (response && changePage) {
                this.emitDataLoaded(response)
            }
        },
        updateRow: function (row) {
            this.$lqTable.updateRow(this.name, row);
        },
        deleteRow: function (row) {
            this.$lqTable.deleteRow(this.name, row);
        },
        emitDataLoaded(response) {
            response.then((response) => {
                this.$emit('initial-data', response)
            })
        },
        goingToDestroy() {
            this.$lqTable.deletePagesData(this.name);
            if (this.type === 'list') {
                this.$store.dispatch(
                    'form/removeElement',
                    {
                        formName: this.name, elementName: this.pageKey
                    }
                );
            }
            if (!this.autoFilter) {
                this.$store.commit('form/saveValues', { formName: this.name, values: cloneDeep(this.manulFilterValues) })
            }
            this.$root.$off(this.formName + '_changed');
        }
    },
    beforeDestroy() {
        this.goingToDestroy();
    },
    watch: {
        staticData: {
            handler(newStaticData, oldStaticData) {
                if (!isEqual(newStaticData, oldStaticData)) {
                    this.$store.dispatch('table/addStaticData', { tableName: this.name, data: newStaticData });
                    this.refresh(true);
                }
            },
            deep: true
        }
    }
})