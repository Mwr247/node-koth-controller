/* globals cfg, util, bots */
const pokedex = require('./pokedex.json');
const local = {};
const game = {};

// Initial setup
local.init = function(data) {
  local.rounds = cfg.game.rules.rounds = data[0] || cfg.game.rules.rounds;

  local.pairings = util.list.shuffle(bots);

  util.out.log(local.pairings, pokedex.damageEquation);

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

game.calculateDamage = function(attacker, defender, attackName) {
  var level = attacker.level;
  var attack = attacker.attack;
  var enemyDefense = defender.defense;
  var power = pokedex.moves[attackName].power;
  var typeBonus = pokedex.types[pokedex.moves[attackName].type].damage[defender.types[0]];
  var stab = attacker.type === pokedex.moves[attackName].type ? 1.5 : 1;
  return ((2 * level + 10) / 250 * attack / enemyDefense * power + 2) * typeBonus * stab * (Math.random() * 0.15 + 0.85) | 0;
};

game.calculateExp = function(loser) {
  var exp = pokedex.pokemon[loser.species].exp;
  var level = loser.level;
  return exp * level / 7 | 0;
};

module.exports = {
	init: local.init
};
