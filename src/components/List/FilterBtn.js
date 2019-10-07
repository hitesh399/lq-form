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
    render(h) {
        const self = this;
        return h(
            this.tag, {
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
            this.lqForm.filter();
        },
        _makeSlotReadyToRender(slots) {
            const slotNames = Object.keys(slots);
            return slotNames.map(
                slotName => this.$createElement(
                    'template', { slot: slotName },
                    slots[slotName]
                )
            )
        },
        renderSlots() {
            return this._makeSlotReadyToRender(this.$slots);
        }
    }
})