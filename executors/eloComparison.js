var _ = require('lodash');
var Promise = require('bluebird');

var NAME = 'eloComparison';

module.exports = function(crossTable) {
	// Each function can independently decide if its sync or async
	return({executor: NAME, res: [1,2,3,4]});
	return Promise.delay(Math.random()*1000).return({executor: NAME, res: [1,2,3,4]})
}
