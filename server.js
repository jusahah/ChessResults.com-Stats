// Utils
var fs = require('fs');
var request = require('request');

// Domain deps
var parseStats = require('./app');

// App 
var testaddr = 'http://www.chess-results.com/tnr223831.aspx?lan=18&art=4&wi=821';




function doRealFetch() {
	kkk; // Prevent running by accident
	request(testaddr, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		parseStats(body, {
	    	exclude: ['boxDiagram'],
	    	ignoreMissingExecutors: true
	    })
	    .then(function(stats) {
	    	console.log("---STATS IN SERVER.js---");
	    	console.log(JSON.stringify(stats, null, 2));
	    })
	  } else {
	  	console.log(error);
	  }
	})
}

function doDiskFetch() {
	var testHTML = fs.readFileSync(__dirname + '/test/testpage/hof2016.html', 'utf8');

	parseStats(testHTML, {
    	exclude: ['boxDiagram'],
    	ignoreMissingExecutors: true
    })
    .then(function(stats) {
    	console.log("---STATS IN SERVER.js---");
    	console.log(JSON.stringify(stats, null, 2));
    })
}

doDiskFetch();
