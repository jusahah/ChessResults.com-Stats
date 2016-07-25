module.exports = function ExecutorMissing(message) {
	Error.captureStackTrace(this, this.constructor);
	this.message = "Missing executor: " + message;
}
require('util').inherits(module.exports, Error);