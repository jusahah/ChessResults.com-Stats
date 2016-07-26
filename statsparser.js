// Utils
var _ = require('lodash');
var htmlparser = require("htmlparser2");

// Domain deps
var executors = require('./executors');

// Errors
var ExecutorMissingError = require('./errors/executor-missing');
var CrossTableParseError = require('./errors/tableparse-error');
// Other deps

/*
var allMethods = [
	'longestStreaks',
	'boxDiagrams',
	'countryComparisons',
	'eloComparisons',
	'bestUpsets'
]
*/

module.exports = function(crosstableText, options) {

	options = options || {};

	/*
		options = {
			exclude: ['longestStreaks', 'boxDiagrams', 'countryComparisons'],

		}
	*/

	var executorNames = _.keys(executors);

	


	var crossTable = processCrosstableText(crosstableText);
	//console.log("Cross table")
	//console.log(crossTable);

	return _
	.chain(executorNames)
	// Exclude those executors client does not care about.
	.difference(options.exclude)
	.map(function(methodName) {
		if (_.has(executors, methodName)) {
			// Returns Promise!!
			return executors[methodName](crossTable);
		}
		if (options.ignoreMissingExecutors) {
			return Promise.resolve({executor: methodName, res: null});
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
	var currTdCount  = -1;

	var collecting = {
		header: [],
		rows: []
	}

	var parser = new htmlparser.Parser({
	    onopentag: function(name, attribs){
	        if(name === "table" && attribs['class'] === "CRs1"){
	            //console.log("CROSSTABLE STARTS");
	            currentlyOnCrossTable = true;
	        } else if (name === "tr") {
	        	if (!currentlyOnCrossTable) return;

	        	var className = attribs['class'];

	        	if (className.indexOf('CRng1b') !== -1 || className.indexOf('CRg1b') !== -1) {
	        		// Header row
	        		currentTr = 'header';
	        	} else if (className.indexOf('CRng') !== -1 || className.indexOf('CRg') !== -1) {
	        		currentTr = 'row';
		        	currRowCount++;
		        	////console.log("Curr row count: " + currRowCount);
		        	collecting.rows[currRowCount] = [];	        		
	        	}

	        } else if (name === "td") {
	        	if (!currentTr) return;
	        	insideTd = true;
	        	currTdCount++;

	        	if (currentTr === 'header') {
	        		collecting.header[currTdCount] = '';

	        	} else if (currentTr === 'row') {
	        		//console.log("row count is: " + currRowCount);
	        		collecting.rows[currRowCount][currTdCount] = '';
	        	}

	        }
	    },
	    ontext: function(text){
	    	if (!insideTd) return;

	    	text = _.trim(text);

	    	if (currentTr === 'header') {
	    		collecting.header[currTdCount] = text;
	    	} else if (currentTr === 'row') {
	    		////console.log("PUSHING NON-HEADER: " + text);
	    		collecting.rows[currRowCount][currTdCount] = text;
	    	}
	
	    },
	    onclosetag: function(tagname){
	        if(tagname === "table"){
	        	//console.log("TABLE ENDS");
	            currentlyOnCrossTable = false;
	        } else if (tagname === 'td') {
	        	insideTd = false;
	        } else if (tagname === 'tr') {
	        	currentTr = null;
	        	currTdCount = -1;
	        }
	    }
	}, {decodeEntities: false});
	parser.write(text);
	parser.end();

	console.log(collecting.header);


	var crosstable = {
		header : collecting.header,
		roundsIntervalInHeader: getRoundsInterval(collecting.header)
	
	};

	//console.log(collecting.rows)

	_
	.chain(collecting.rows)
	.map(function(row) {
		//console.log("ROW SPINNING")
		//console.log(row);
		return processRow(row, crosstable.header, crosstable.roundsIntervalInHeader);
	})
	.forEach(function(row) {
		//console.log("ROW IN FOREACH")
		console.log(row);
	
		crosstable[row.playerInfo[0]] = row;
	}).value();



	return crosstable;
}



function processRow(row, header, roundsInterval) {
	// Use header to find out the structure of the row
	// For now we just hardcode it in

	//console.log("ROW IS: " + row);
	console.log(header);

	var playerStuff = _.take(row, roundsInterval[0]);
	var rounds = _.slice(row, roundsInterval[0], roundsInterval[1] + 1);
	var scores = _.slice(row, roundsInterval[1] + 1);

	var rowObj = _.zipObject(header, row);

	//console.log(row);
	//console.log(rounds);

	return {
		rowObj: rowObj,
		playerInfo: playerStuff,
		rounds: processRounds(rounds),
		scores: scores
	}

	return _.concat(playerStuff, processRounds(rounds), scores);

}

function processRounds(rounds) {

	//console.log("ROUNDS")
	//console.log(rounds)

	return _.compact(_.map(rounds, function(roundScore) {

		// Split by either b or w
		var wSplit = _.split(roundScore, 'w');
		var bSplit = _.split(roundScore, 'b');

		//console.log(wSplit);
		//console.log(" vs. split ");
		//console.log(bSplit);

		if (wSplit.length === 2 && bSplit.length < 2) {
			//console.log("W sep")
		
			return {opponent: wSplit[0], color: 'w', score: wSplit[1]}
		} else if (bSplit.length === 2 && wSplit.length < 2) {
			//console.log("B sep");
			return {opponent: bSplit[0], color: 'b', score: bSplit[1]}
		} else {
			// Its probably point or 1/2 point from free round
			return null;
		}

		//throw new CrossTableParseError(roundScore);
	}));
}

function getRoundsInterval(header) {

	//console.log(header);


	var firstRoundIdx = header.indexOf('1.Rd');

	if (firstRoundIdx === -1) throw "First round token not found in table header!";

	var restFromFirst = _.slice(header, firstRoundIdx);

	var rounds = _.takeWhile(restFromFirst, function(token) { 
		return token.indexOf('.Rd') !== -1;
	})

	//console.log([firstRoundIdx, firstRoundIdx + rounds.length - 1])


	return [firstRoundIdx, firstRoundIdx + rounds.length - 1];




}