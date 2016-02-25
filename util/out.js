/* globals cfg */

/*****
Private
*****/
const local = {};

// Prefix for log entries
local.prefix = cfg.controller.name;

/*****
Public
*****/
const self = {};

// Error wrapper, outputs to stderr
self.error = function(msg, logLevel, sameLine) {
	if (logLevel == null || logLevel <= cfg.controller.logLevel) {
		process.stderr.write('Error: ' + (msg+'').replace(/^error:? ?/i, '') + (!sameLine ? '\n' : ''));
	}
};

// Log wrapper, outputs to stdout with a prefix tag
self.log = function(msg, logLevel, sameLine) {
	if (logLevel == null || logLevel <= cfg.controller.logLevel) {
		process.stdout.write('[' + local.prefix + '] ' + msg + (!sameLine ? '\n' : ''));
	}
};

// Log wrapper, outputs to stdout without a prefix tag
self.print = function(msg, logLevel, sameLine) {
	if (logLevel == null || logLevel <= cfg.controller.logLevel) {
		process.stdout.write(msg + (!sameLine ? '\n' : ''));
	}
};

// Allows the setting and retrieval of the current prefix tag
self.prefix = function(prefix) {
	if (prefix) {
		local.prefix = prefix || cfg.controller.name;
	} else {
		return local.prefix;
	}
};

/*****
Export
*****/
module.exports = self;
