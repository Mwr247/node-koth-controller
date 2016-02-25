/* globals cfg, util, bots */

/*****
Private
*****/
const local = {};

// What data to give to each bot
local.data = function(id) {
	return id + ',' + local.rounds + ',' + bots[id].args;
};

// Handles bot responses
local.response = function(result) {
	util.out.print(result.data.trim(), 6);
};

/*****
Public
*****/
const self = {};

// Initial setup
self.init = function(data) {
  local.rounds = cfg.game.rules.rounds = data[0] || cfg.game.rules.rounds;

  util.out.log('Starting run (' + local.rounds + ' rounds)...', 3);

  self.time = Date.now();
  self.run();
};

// Run a round
self.run = function() {
    util.run.async(bots, local.data, local.response);

};

// Handle post-round logic
self.postRun = function() {
	local.rounds--;
	if (local.rounds > 0) {
		self.run();
	} else {
		util.out.log('Run complete: ' + (Date.now() - self.time) / 1000 + ' seconds.', 3);
	}
};

/*****
Export
*****/
module.exports = self;
