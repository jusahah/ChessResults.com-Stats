// Util, node.js deps
var fs = require('fs');
var Promise = require('bluebird');

// Domain deps
var stats = require('./statsparser');

// Errors
var ExecutorMissingError = require('./errors/executor-missing');

// Load test page
var testHTML = fs.readFileSync(__dirname + '/test/testpage/naantali2015.html', 'utf8');

function processHTML(html) {

	stats(testHTML, {
		exclude: ['boxDiagrams2']
	});
}


Promise.try(function() {
	processHTML(testHTML);
})
.catch(ExecutorMissingError, function(err) {
	console.log(err.toString());
})
