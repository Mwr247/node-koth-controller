/* globals cfg, util, bots */
const fs = require('fs');
const pokedex = JSON.parse(fs.readFileSync('./pokedex.json', 'utf8'));
const local = {};

// Initial setup
local.init = function(data) {
  local.rounds = cfg.game.rules.rounds = data[0] || cfg.game.rules.rounds;

  local.pairings = local.shuffle(bots.length);

  util.out.log(local.pairings, pokedex.damageEquation);

  util.out.log('Starting run (' + local.rounds + ' rounds)...', 3);

  local.time = Date.now();
  local.run();
};

// Shuffle a list, or create a list of shuffled numbers
local.shuffle = function(list) {
  if (list.length == null && list >= 0) {
    list = Array(list).fill(0).map(function(val, i) {
      return i;
    });
  }
  for (var i = list.length - 1; i > 0; i--) {
    var j = Math.random() * (i + 1) | 0;
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

// Divide a list for tournaments
local.divide = function(list) {
  var i = list.length;
  var groups = [];
  while (i > 1) {
    groups.push([list[--i], list[--i]]);
  }
  return groups;
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
	return id + ',' + local.rounds + ',' + bots[id].args;
};

// Handles bot responses
local.botResponse = function(result) {
	util.out.print(result.data.trim(), 6);
};

module.exports = {
	init: local.init
};
