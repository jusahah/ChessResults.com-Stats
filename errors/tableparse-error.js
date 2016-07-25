module.exports = function CrossTableParseError(message) {
	Error.captureStackTrace(this, this.constructor);
	this.message = "Corss table parsing failed: " + message;
}
require('util').inherits(module.exports, Error);