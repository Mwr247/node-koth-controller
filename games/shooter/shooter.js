/* globals cfg, util, bots */

/*****
Private
*****/
const local = {};

// What data to give to each bot
local.data = function(id) {
	return [
		[local.rounds, cfg.game.rules.rounds].join(),
		[bots[id].state.health, bots[id].state.ammo.length, bots[id].state.dodged, bots[id].state.kills].join(),
		bots.filter(function(bot) {
			return bot.id !== id && bot.state.health > 0;
		}).map(function(bot) {
			return [bot.id, bot.state.health, bot.state.cmd.slice(local.rounds - 1, local.rounds)[0]].join(':');
		}).join()
	].join(';');
};

// Handles bot responses
local.response = function(result) {
	var bot = bots[result.id], cmd = result.data;
	util.out.print('[' + bot.id + ']' + bot.name + '(' + [bot.state.health, bot.state.ammo.length, bot.state.dodged, bot.state.kills] + '): ', 7, true);

	if (cmd === 'D' && bot.state.dodged === 0) {
		bot.state.dodged = 1;
	} else {
		bot.state.dodged = 0;
		if (/^S\d+$/.test(cmd) && bots[+cmd.slice(1)].state.health > 0 && bot.state.ammo.length > 0) {
			bot.state.ammo.pop();
		} else {
			if (cmd === 'L' && bot.state.ammo.length < 6) {
				bot.state.ammo.push(1);
				if (bot.state.cmd.slice(-1)[0] === 'L' && bot.state.ammo.length < 6) {
					bot.state.ammo.push(1);
				}
			} else {
				cmd = 'N';
			}
		}
	}

	bot.state.cmd.push(cmd);
	util.out.print(cmd, 7);
};

/*****
Public
*****/
const self = {};

// Initial setup
self.init = function(data) {
  cfg.game.rules.rounds = data[0] || cfg.game.rules.rounds;
	local.rounds = 1;

	for (var bot in bots) {
		bots[bot].state = {
			health: ((cfg.game.rules.bots || {}).health || 3) + (bots.length / 3 | 0),
			ammo: [],
			dodged: 0,
			kills: 0,
			cmd: ['N']
		};
	}

  util.out.log('Starting game (' + cfg.game.rules.rounds + ' rounds)...', 3);

  self.time = Date.now();
  self.run();
};

// Run a round
self.run = function() {
	util.out.log('*** Round ' + local.rounds + ' ***', 6);
  util.run.async(bots.filter(function(bot) {
		return bot.state.health > 0;
	}), local.data, local.response);
};

// Handle post-round logic
self.postRun = function() {
	var tmp, list = bots.filter(function(val) {return val.state.health > 0;});
	for (var bot in list) {
		if (list[bot].state.cmd.slice(-1)[0][0] === 'S') {
			tmp = +list[bot].state.cmd.slice(-1)[0].slice(1);
			var target = list.filter(function(tBot) {
				return tBot.id === tmp && tBot.state.dodged === 0;
			});
			if (target.length > 0) {
				tmp = target[0].state.cmd.slice(-1)[0];
				if (!(tmp[0] === 'S' && +tmp.slice(1) === list[bot].id)) {
					target[0].state.health--;
					var killers = list.filter(function(tBot) {return tBot.state.cmd.slice(-1)[0] === 'S' + target[0].id && !(tmp[0] === 'S' && +tmp.slice(1) === list[bot].id);}).length;
					if (target[0].state.health - killers <= 0) {
						list[bot].state.kills += Math.round(1 / killers * 1000) / 1000;
					}
				}
			}
		}
	}

	var alive = bots.filter(function(bot) {
		return bot.state.health > 0;
	}).length;

	if (local.rounds < cfg.game.rules.rounds && alive > 1) {
		local.rounds++;
		self.run();
  } else {
    util.out.log('Game complete (' + local.rounds + ' rounds): ' + (Date.now() - self.time) / 1000 + ' seconds.', 3);
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

/*****
Export
*****/
module.exports = self;
