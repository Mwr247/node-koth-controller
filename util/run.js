/* globals cfg, util, game */

const child = require('child_process');

/*****
Public
*****/
const self = {};

// Synchronous bot calls, always processed and handled in order
self.sync = function(botList, fetchData, callback) {
	for (var bot in botList) {
		callback({
			id: botList[bot].id,
			output: child.execSync(botList[bot].cmd + ' ' + fetchData(botList[bot].id), cfg.game.process)
		});
	}
	game.run();
};

// Asynchronous bot calls, run at the same time
self.async = function(botList, fetchData, callback) {
	var remaining = botList.length;
	for (var bot in botList) {
		(function(botList, bot, fetchData, callback) {
			return child.exec(botList[bot].cmd + ' ' + fetchData(botList[bot].id), cfg.game.process, function(error, stdout) {
				callback({
					id: botList[bot].id,
					output: stdout
				});
				if (--remaining === 0) {
					game.run();
				}
				if (error !== null) {
					util.out.error(error);
				}
			});
		})(botList, bot, fetchData, callback);
	}
};

/*****
Export
*****/
module.exports = self;
