/* globals cfg, util, bots */

const local = {};

// Initial setup
local.init = function(data) {
  local.rounds = cfg.game.rules.rounds = data[0] || cfg.game.rules.rounds;

  util.out.log('Starting run (' + local.rounds + ' rounds)...', 3);

  local.time = Date.now();
  local.run();
};

// Run a round
local.run = function() {
    util.run.async(bots, local.botData, local.botResponse, local.postRun);
};

// Handle post-round logic
local.postRun = function() {
	local.rounds--;
	if (local.rounds > 0) {
		local.run();
	} else {
		util.out.log('Run complete: ' + (Date.now() - local.time) / 1000 + ' seconds.', 3);
	}
};

// What data to give to each bot
local.botData = function(id) {
	return [id, local.rounds, bots[id].args].join();
};

// Handles bot responses
local.botResponse = function(result) {
	util.out.print(result.data.trim(), 6);
};

module.exports = {
	init: local.init
};
