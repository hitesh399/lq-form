// vue.config.js
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	configureWebpack: config => {
		const externalPackages = {
			'axios': 'axios',
			'validate.js': 'validate.js',
			'vuex': 'vuex',
			'vuejs-object-helper': 'vuejs-object-helper',
			'vue': 'vue',
			'lodash/cloneDeep': 'lodash/cloneDeep',
			'lodash/core': 'lodash/core',
		}
		config.externals = {
			...config.externals,
			...(process.env.NODE_ENV === 'production' ? externalPackages : {})
		}
	}
}