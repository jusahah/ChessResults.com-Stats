// Utils
var _ = require('lodash');
var htmlparser = require("htmlparser2");

// Domain deps
var executors = require('./executors');

// Errors
var ExecutorMissingError = require('./errors/executor-missing');

// Other deps

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
	console.log(crossTable);

	return _
	.chain(allMethods)
	.difference(options.exclude)
	.zipObject() 
	.mapValues(function(value, methodName) {
		if (_.has(executors, methodName)) {
			return executors[methodName](crossTable);
		}

		// Not found
		throw new ExecutorMissingError(methodName);
	}).value();
}

function processCrosstableText(text) {
	// Parser state
	var currentlyOnCrossTable = false;
	var currentTr;
	var insideTd;

	var currRowCount = -1;

	var collecting = {
		header: [],
		rows: []
	}

	var parser = new htmlparser.Parser({
	    onopentag: function(name, attribs){
	        if(name === "table" && attribs['class'] === "CRs1"){
	            console.log("CROSSTABLE STARTS");
	            currentlyOnCrossTable = true;
	        } else if (name === "tr") {
	        	if (!currentlyOnCrossTable) return;

	        	if (attribs['class'] === 'CRng1b') {
	        		// Header row
	        		currentTr = 'header';
	        	} else if (_.truncate(attribs['class'], {length: 4, omission: ''} === 'CRng')) {
	        		currentTr = 'row';
		        	currRowCount++;
		        	//console.log("Curr row count: " + currRowCount);
		        	collecting.rows[currRowCount] = [];	        		
	        	}

	        } else if (name === "td") {
	        	if (!currentTr) return;
	        	insideTd = true;

	        }
	    },
	    ontext: function(text){
	    	if (!insideTd) return;

	    	text = _.trim(text);

	    	if (currentTr === 'header') {
	    		collecting.header.push(text);
	    	} else if (currentTr === 'row') {
	    		console.log("PUSHING NON-HEADER: " + text);
	    		collecting.rows[currRowCount].push(text);
	    	}
	
	    },
	    onclosetag: function(tagname){
	        if(tagname === "table"){
	        	console.log("TABLE ENDS");
	            currentlyOnCrossTable = false;
	        } else if (tagname === 'td') {
	        	insideTd = false;
	        } else if (tagname === 'tr') {
	        	currentTr = null;
	        }
	    }
	}, {decodeEntities: false});
	parser.write(text);
	parser.end();

	var crosstable = {
		'header' : collecting.header

	};

	_.forEach(collecting.rows, function(row) {
		crosstable[row[0]] = row;
	});

	return crosstable;
}