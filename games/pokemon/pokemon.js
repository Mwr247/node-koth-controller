/* globals cfg, util, bots */
const pokedex = require('./pokedex.json');
const local = {};
const game = {};

// Initial setup
local.init = function(data) {
  bots.forEach(function(v, k) {
    bots[k].data = {
      matches: 0,
      wins: 0,
      losses: 0
    };
  });

  local.pokemon = util.arrayObjectMap(cfg.game.rules.pokemon, pokedex.pokemon);
  cfg.game.rules.pokemon.forEach(function(name) {
    local.pokemon[name].moves = util.arrayObjectMap(local.pokemon[name].moves, pokedex.moves);
  });

  local.queue = util.list.shuffle(bots);

  //util.out.log('Starting run (' + local.matches + ' matches)...', 3);

  local.time = Date.now();
  local.preRun();
};

// Handle pre-round logic
local.preRun = function() {
  // Reset pokemon stats for each bot
  bots.forEach(function(bot) {
    bot.data.pokemon = util.deepCopy(local.pokemon);
    bot.data.currentPokemon = '';
    bot.data.pokemon.status = [];
  });
};

// Run a round
local.run = function() {
    //util.run.sync(bots, local.botData, local.botResponse, local.postRun);
};

// Handle post-round logic
local.postRun = function() {
	/*local.rounds--;
	if (local.rounds > 0) {
		local.run();
	} else {
		util.out.log('Run complete: ' + (Date.now() - local.time) / 1000 + ' seconds.', 3);
	}*/
};

// What data to give to each bot
local.botData = function(id) {
	return [id, local.rounds, bots[id].args].join();
};

// Handles bot responses
local.botResponse = function(result) {
  bots[result.id].data.val = Math.random();
	util.out.print(result.data.trim(), 6);
};

// Damage calculation formula
game.calculateDamage = function(attacker, defender, attackName) {
  var level = attacker.level;
  var attack = attacker.attack;
  var enemyDefense = defender.defense;
  var power = pokedex.moves[attackName].power;
  var typeBonus = pokedex.types[pokedex.moves[attackName].type].damage[defender.types[0]];
  var stab = attacker.type === pokedex.moves[attackName].type ? 1.5 : 1;
  var randomElement = Math.random() * 0.15 + 0.85;
  return ((2 * level + 10) / 250 * attack / enemyDefense * power + 2) * typeBonus * stab * randomElement | 0;
};

// Experience gain formula
game.calculateExp = function(loser) {
  var exp = pokedex.pokemon[loser.species].exp;
  var level = loser.level;
  return exp * level / 7 | 0;
};

// Individual value calculation
game.calculateIV = function(ownerId, pokemon, offset) {
  return pokemon.toLowerCase().split('').reduce(function(prev, curr, index) {
    return prev + (curr.charCodeAt() - 31) * (index * ownerId + 1);
  }, 0) % (16 + offset) % 16;
};

module.exports = {
	init: local.init
};
