
var copy = require('recursive-copy');


var options = {

	overwrite: true,
	expand: false,
	dot: true,
	junk: false,
}

const locations = [
	{srcPath:'./dist', destPath: '../element-ui/node_modules/vuex-lq-form/dist' },
]


locations.map(async function(location, index) {
	
	///console.log('Copying files...', location.srcPath);

	await copy(location.srcPath, location.destPath, options)
		.on(copy.events.COPY_FILE_START, function(copyOperation) {
	        console.info('Copying file ' + copyOperation.src + '...');
	    })
	    .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
	        console.info('Copied to ' + copyOperation.dest);
	    })
	    .on(copy.events.ERROR, function(error, copyOperation) {
	        console.error('Unable to copy ' + copyOperation.dest);
	    })
	    .then(function(results) {
	        console.info(results.length + ' file(s) copied');
	    })
	    .catch(function(error) {
	        return console.error('Copy failed: ' + error);
	    });
})
