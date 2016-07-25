var _ = require('lodash');
var Promise = require('bluebird');

var NAME = 'bestUpsets';

module.exports = function(crossTable) {
	return getAllWinsWithEloDifferences(crossTable);
	return Promise.delay(Math.random()*1000).return({executor: NAME, res: [1,2,3,4]})
}

function getAllWinsWithEloDifferences(crossTable) {
	console.log("Cross table in bestUpsets");
	console.log("---------------")
	console.log(crossTable);
	console.log("---------------")

	var allWins = [];

	_.forOwn(
		_.omit(crossTable, ['header', 'roundsIntervalInHeader']), 
		function(resultsObj, playerID) {
			console.log("Results obnj");
			console.log(resultsObj);
			console.log("Calcling wins for: " + playerID);
			console.log(resultsObj.rounds.length);
			var rounds = resultsObj.rounds;
			var ownElo = getPlayerElo(playerID, crossTable);

			var allWinsForPlayer = _
			.chain(rounds)
			.map(function(round) {
				console.log("Score: " + round.score);
				console.log(round)
				if (round.score !== '1') return null;
				var opponentElo = getPlayerElo(round.opponent, crossTable);
				console.log("Elo diff: " + (opponentElo - ownElo))
				return {eloDiff: opponentElo - ownElo, winner: playerID, loser: round.opponent};
			})
			.compact()
			.value();


			allWins = _.concat(allWins, allWinsForPlayer); // Perhaps performance issue here?
			
		}
	);
	console.log(allWins);


	var topFive = _
	.chain(allWins)
	.sortBy(function(winobj) {
		return (-1) * winobj.eloDiff;
	})
	.take(5)
	.map(function(winobj) {
		return {
			eloDiff: winobj.eloDiff, 
			winner: getPlayerInfo(winobj.winner, crossTable),
			loser: getPlayerInfo(winobj.loser, crossTable)
		};
	})
	.value();

	console.log(topFive);

	return {executor: NAME, res: topFive};
}

function getPlayerElo(id, crossTable) {

	console.log(_.keys(crossTable))

	//console.log(crossTable);
	console.log("ID is: " + id);


	if (!_.has(crossTable, id)) throw "ID not found crosstable: " + id;

	var playerObj = crossTable[id];
	return parseInt(playerObj.playerInfo[3]);
}

function getPlayerInfo(id, crossTable) {

	if (!_.has(crossTable, id)) throw "ID not found crosstable: " + id;
	var playerObj = crossTable[id];
	return playerObj.playerInfo;

}