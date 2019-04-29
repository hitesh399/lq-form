import Vue from 'vue'
import App from './App.vue'
import store from './store';
import LQForm from './components/LQ-Form';
import JsonViewer from 'vue-json-viewer';
import formHelper from '@/utils/formhelper';
import ImageWithPreview from './components/file/ImageWithPreview'
import lqFile from './components/file/LQ-File'
import lqFileReader from './components/fileReader/LQ-FileReader';
import lqCropper from './components/fileReader/LQ-Cropper';

Vue.use(JsonViewer)
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './plugins/element.js'
import VueCroppie from 'vue-croppie';
Vue.use(VueCroppie);

Vue.use(ElementUI);
Vue.use(formHelper, {store});

Vue.config.productionTip = false

Vue.component('lq-image', ImageWithPreview);
Vue.component('lq-file', lqFile);
Vue.component('lq-file-reader', lqFileReader);
Vue.component('lq-cropper', lqCropper);

Vue.component('lq-form', LQForm)

new Vue({
  render: h => h(App),
  store
}).$mount('#app')