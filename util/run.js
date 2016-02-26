/* globals cfg, util */

const child = require('child_process');

/*****
Public
*****/
const self = {};

// Synchronous bot calls, always processed and handled in order
self.sync = function(botList, botData, botResponse, gameCallback) {
	for (var bot in botList) {
		botResponse({
			id: botList[bot].id,
			data: (child.execSync(botList[bot].cmd + ' ' + botData(botList[bot].id), cfg.game.process) || '').trim()
		});
	}
	gameCallback();
};

// Asynchronous bot calls, run at the same time
self.async = function(botList, botData, botResponse, gameCallback) {
	var remaining = botList.length;
	for (var bot in botList) {
		(function(botList, bot, botData, botResponse) {
			return child.exec(botList[bot].cmd + ' ' + botData(botList[bot].id), cfg.game.process, function(error, stdout) {
				botResponse({
					id: botList[bot].id,
					data: (stdout || '').trim()
				});
				if (--remaining === 0) {
					gameCallback();
				}
				if (error !== null) {
					util.out.error(error);
				}
			});
		})(botList, bot, botData, botResponse);
	}
};

/*****
Export
*****/
module.exports = self;
