import Vue from 'vue';
import rForm from '../../mixins/formMixin';

export default Vue.extend({
    mixins: [rForm],
    name: 'r-list-filter',
    render: function (createElement) {
        let props = this.$attrs;
        return createElement(
            this.tag, 
            {
                props
            }, 
            this.$scopedSlots.default()
        )
    },

    methods: {
        setup: function() {
            this.formName = this.name + '_list';
        }
    }
})


    