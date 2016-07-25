// Util, node.js deps
var fs = require('fs');
var Promise = require('bluebird');

// Domain deps
var stats = require('./statsparser');

// Errors
var ExecutorMissingError = require('./errors/executor-missing');

// Load test page


function processHTMLTest(html) {
	// Returns array of promises
	return stats(testHTML, {
		exclude: ['boxDiagrams2'],
		ignoreMissingExecutors: true
	});
}

function processHTML(html, parseOptions) {

	// Ah, beautiful
	return Promise.try(function() {
		// Returns array of promises
		return stats(html, parseOptions);
	})
	.reduce(function(collector, executorResult) {
		// Turn into object
		collector[executorResult.executor] = executorResult.res;
		return collector;
	}, {})
	.then(function(resultsObj) {
		console.log("RESULTS OBJECT READY");
		return resultsObj;
	})
	// Catch if executor was missing and error not suppressed by caller
	.catch(ExecutorMissingError, function(err) {
		console.log(err.toString());
	})
	// Catch all not specified, let crash.

}

module.exports = processHTML;

