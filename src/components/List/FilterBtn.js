import Vue from 'vue';
import helper from 'vuejs-object-helper';

export default Vue.extend({
    name: 'filter-btn',
    props: {
        tag: {
            type: String,
            required: true
        }
    },
    inject: ['lqForm'],
    computed: {
        autoFilter: function () {
            return helper.getProp(this.$store.state, ['table', this.lqForm.name, 'settings', 'auto_filter'], true);
        },
    },
    render(h) {
        const self = this;
        return h(
            this.tag,
            {
                props: {
                    disabled: this.lqForm.requesting,
                    ...this.$attrs
                },
                attrs: this.$attrs,
                on: {
                    ...self.$listeners,
                    click: this.clickHandler
                },
                scopedSlots: this.$scopedSlots
            },
            this.renderSlots()
        )
    },
    methods: {
        clickHandler(event) {
            event.stopPropagation()
            this.$lqTable.filter(this.lqForm.name);
            if (!this.autoFilter) {
                const values = this.lqForm.formValues
                this.$store.dispatch('manualfilter/add', { formName: this.lqForm.name, values })
            }
        },
        _makeSlotReadyToRender(slots) {
            const slotNames = Object.keys(slots);
            return slotNames.map(
                slotName => this.$createElement(
                    'template',
                    { slot: slotName },
                    slots[slotName]
                )
            )
        },
        renderSlots() {
            return this._makeSlotReadyToRender(this.$slots);
        }
    }
})