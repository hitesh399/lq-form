import helper from 'vuejs-object-helper';
import cloneDeep from 'lodash/cloneDeep'

const state = {

}
const actions = {
    add({ commit }, { formName, values }) {
        commit('save', { formName, values })
    },
    delete({ commit }, { formName }) {
        commit('destroy', { formName })
    }
}
const mutations = {
    save(state, { formName, values }) {
        helper.setProp(state, formName, cloneDeep(values), true);
    },
    destroy(state, { formName }) {
        helper.deleteProp(state, formName);
    }
}
export default {
    namespaced: true,
    state,
    actions,
    mutations
}