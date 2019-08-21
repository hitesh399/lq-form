// vue.config.js
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    configureWebpack: {
      plugins: [
        // new BundleAnalyzerPlugin()
      ]
    },
    configureWebpack: config => {
	    config.externals = {
	       ...config.externals,
	      'axios': 'axios',
	      'validate.js': 'validate.js',
	      'vuex': 'vuex',
	      'vuejs-object-helper': 'vuejs-object-helper',
	      'vue': 'vue'
	    }
	}
 }