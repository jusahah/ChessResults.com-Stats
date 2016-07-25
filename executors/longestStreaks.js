var _ = require('lodash');
var Promise = require('bluebird');

var NAME = 'longestStreaks';

module.exports = function(crossTable) {
	return Promise.delay(Math.random()*1000).return({executor: NAME, res: [1,2,3,4]})
}