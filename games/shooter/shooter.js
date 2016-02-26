/* globals cfg, util, bots */

const local = {};

// Initial setup
local.init = function(data) {
  cfg.game.rules.rounds = data[0] || cfg.game.rules.rounds;
	local.rounds = 1;
	local.maxHealth = cfg.game.rules.bots.baseHealth + (bots.length / 3 | 0);

	for (var bot in bots) {
		bots[bot].state = {
			health: local.maxHealth,
			ammo: [],
			dodges: 0,
			healed: 0,
			incapacitated: 0,
			kills: 0,
			cmd: ['N']
		};
	}

  util.out.log('Starting game (' + cfg.game.rules.rounds + ' rounds)...', 3);

  local.time = Date.now();
  local.run();
};

// Run a round
local.run = function() {
	util.out.log('*** Round ' + local.rounds + ' ***', 6);
  util.run.async(bots.filter(function(bot) {
		return bot.state.health > 0;
	}), local.botData, local.botResponse, local.postRun);
};

// Handle post-round logic
local.postRun = function() {
	var tmp, target, list = bots.filter(function(val) {return val.state.health > 0;});
	for (var bot in list) {
		if (list[bot].state.cmd.slice(-1)[0][0] === 'S') {
			tmp = +list[bot].state.cmd.slice(-1)[0].slice(1);
			target = list.filter(function(tBot) {
				return tBot.id === tmp && (tBot.state.cmd.slice(-1)[0] !== 'D' || (tBot.state.cmd.slice(-1)[0] === 'D' && tBot.state.dodges !== 1));
			});
			if (target.length > 0) {
				tmp = target[0].state.cmd.slice(-1)[0];
				if (!(tmp[0] === 'S' && +tmp.slice(1) === list[bot].id)) {
					var killers = list.filter(function(tBot) {
						return tBot.state.cmd.slice(-1)[0] === 'S' + target[0].id && !(tmp[0] === 'S' && +tmp.slice(1) === list[bot].id);
					});
					var killersForward = killers.filter(function(tBot) {
						return !tBot.state.done;
					});
					var healthLoss = (target[0].state.cmd.slice(-1)[0] !== 'D' ? 1 : Math.round((target[0].state.dodges - 1) / (cfg.game.rules.bots.maxDodges - 1 || 1) * 1000) / 1000);
					if (target[0].state.health - (killersForward.length * healthLoss) <= 0) {
						list[bot].state.kills += Math.round(1 / killers.length * 1000) / 1000;
					}
					target[0].state.health -= healthLoss;
				}
			}
		} else if (list[bot].state.cmd.slice(-1)[0][0] === 'M') {
			tmp = +list[bot].state.cmd.slice(-1)[0].slice(1);
			target = list.filter(function(tBot) {
				return tBot.id === tmp && (tBot.state.cmd.slice(-1)[0] === 'D' || tBot.state.cmd.slice(-1)[0][0] === 'M');
			});
			if (target.length > 0) {
				tmp = target[0].state.cmd.slice(-1)[0];
				if (!(tmp[0] === 'M' && +tmp.slice(1) === list[bot].id)) {
					target[0].state.incapacitated = 1;
				} else {
					target[0].state.incapacitated = 1;
					list[bot].state.incapacitated = 1;
				}
			}
		}
		list[bot].state.done = true;
	}

	var alive = bots.filter(function(bot) {
		delete bot.state.done;
		return bot.state.health > 0;
	}).length;

	if (local.rounds < cfg.game.rules.rounds && alive > 1) {
		local.rounds++;
		local.run();
  } else {
    util.out.log('Game complete (' + local.rounds + ' rounds): ' + (Date.now() - local.time) / 1000 + ' seconds.', 3);
		var finals = bots.slice().sort(function(a, b) {
			if ((a.state.health > 0) === (b.state.health > 0)) {
				if (b.state.kills === a.state.kills) {
					return b.state.health - a.state.health;
				}
				return b.state.kills - a.state.kills;
			}
			return b.state.health - a.state.health;
		});

		util.out.log('Rank: Name - Health | Kills', 1);

		finals.forEach(function(bot, i) {
			util.out.print((i + 1) + ': [' + bot.id + ']' + bot.name + ' - ' + bot.state.health + ' | ' + bot.state.kills, 1);
		});
  }
};

// What data to give to each bot
local.botData = function(id) {
	return [
		[
			local.rounds,
			cfg.game.rules.rounds,
			local.maxHealth
		].join(),
		[
			bots[id].state.health,
			bots[id].state.ammo.length,
			bots[id].state.dodges,
			bots[id].state.incapacitated,
			bots[id].state.healed,
			bots[id].state.kills,
			bots[id].state.cmd.slice(local.rounds - 5, local.rounds).join('_')
		].join(),
		bots.filter(function(bot) {
			return bot.id !== id && bot.state.health > 0;
		}).map(function(bot) {
			return [
				bot.id,
				bot.state.health,
				bot.state.kills,
				bot.state.cmd.slice(local.rounds - 3, local.rounds).join('_')
			].join(':');
		}).join()
	].join(';');
};

// Handles bot responses
local.botResponse = function(result) {
	var bot = bots[result.id], cmd = result.data;
	util.out.print('[' + bot.id + ']' + bot.name + '(' + [
		bot.state.health,
		bot.state.ammo.length,
		bot.state.dodges,
		bot.state.incapacitated,
		bot.state.healed,
		bot.state.kills
	] + '): ', 7, true);

	bot.state.dodges -= (bot.state.dodges > 0 && cmd !== 'D');
	bot.state.healed -= (bot.state.healed > 0);

	if (bot.state.incapacitated > 0) {
		bot.state.incapacitated = 0;
		cmd = 'N';
	} else {
		if (cmd === 'D') {
			bot.state.dodges += (bot.state.dodges < cfg.game.rules.bots.maxDodges);
	  } else if (cmd === 'H' && bot.state.healed === 0) {
			bot.state.healed = 5;
			bot.state.health++;
		} else if (cmd === 'L' && bot.state.ammo.length < 6) {
			bot.state.ammo.push(1);
			if (bot.state.cmd.slice(-1)[0] === 'L' && bot.state.ammo.length < 6) {
				bot.state.ammo.push(1);
			}
		} else if (/^S\d+$/.test(cmd) && bots[+cmd.slice(1)].state.health > 0 && bot.state.ammo.length > 0) {
			bot.state.ammo.pop();
		} else if (/^M\d+$/.test(cmd) && bots[+cmd.slice(1)].state.health > 0) {

		} else {
			cmd = 'N';
		}
	}

	bot.state.cmd.push(cmd);
	util.out.print(cmd, 7);
};

module.exports = {
	init: local.init
};
