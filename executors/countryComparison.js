var Promise = require('bluebird');

var NAME = 'countryComparison';

module.exports = function(crosstable) {

	return Promise.delay(Math.random()*1000).return({executor: NAME, res: [1,2,3,4]})
}