import lqForm from '../main'
import store from '../store'
import Vue from 'vue'
Vue.config.productionTip = false
Vue.use(lqForm, { store })
import './axios'
import helper from 'vuejs-object-helper';
Object.defineProperty(Vue.prototype, '$helper',   {value: helper});

import App from './App'

export default  new  Vue({
    store,
    render: h => h(App)
}).$mount('#app')