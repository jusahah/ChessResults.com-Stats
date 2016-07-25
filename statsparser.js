var _ = require('lodash');

// Importing custom error for methods not found
var ExecutorMissingError = require('./errors/executor-missing');

var executors = require('./executors');

var allMethods = [
	'longestStreaks',
	'boxDiagrams',
	'countryComparisons',
	'eloComparisons'
]

module.exports = function(crosstableText, options) {

	options = options || {};

	/*
		options = {
			exclude: ['longestStreaks', 'boxDiagrams', 'countryComparisons'],

		}
	*/


	var toBeExecuted = _.difference(allMethods, options.exclude);


	var crossTable = processCrosstableText(crosstableText);

	return _
	.chain(allMethods)
	.difference(options.exclude)
	.zipObject() 
	.mapValues(function(methodName, methodName) {
		console.log("mapValues: " + methodName)
		if (_.has(executors, methodName)) {
			console.log("Executing executor: " + methodName);
			return executors[methodName](crossTable);
		}

		// Not found
		throw new ExecutorMissingError();
	}).value();
}

function processCrosstableText(text) {
	return {};
}