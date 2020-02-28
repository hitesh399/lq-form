import Vue from 'vue'
import formMixin from '../mixins/formMixin'

export default Vue.extend({
    name: 'lq-v-form',
    inheritAttrs: false,
    mixins: [formMixin],
    props: {
        tag: {
            type: String,
            default: () => 'form'
        }
    },
    render(createElement) {
        return createElement(this.tag, {
            on: {
                submit: e => { e.preventDefault(); this.submit() },
                ...this.$listeners
            },
            // domProps: this.$attrs,
            staticClass: 'v-form lq-v-form',
            attrs: Object.assign({
                novalidate: true
            }, this.$attrs),
        }, this.$scopedSlots.default({
            model: this.formValues,
            errors: this.formErrors,
            push: this.push,
            canShow: this.canShow,
            unshift: this.unshift,
            remove: this.remove,
            removeError: this.removeError,
        }))
    }
})