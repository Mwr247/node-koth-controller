/* globals cfg, util, gamemode, bots */

const fs = require('fs');

try {
  global.cfg = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
	global.util = require('./util/util.js');
} catch(err) {
  process.stderr.write(err);
  process.exit(1);
}

var argPos = 2;
cfg.controller.logLevel = (+process.argv[argPos] >= 0 ? +process.argv[argPos++] : cfg.controller.logLevel);
cfg.controller.game = (process.argv[argPos] && /[a-z]/gi.test(process.argv[argPos]) ? process.argv[argPos++] : cfg.controller.game);

const tmpName = cfg.controller.name + (cfg.controller.game ? ' - "' + cfg.controller.game + '"' : '');
const tmpDecor = '+' + '-'.repeat(tmpName.length + 2) + '+';
util.out.print(tmpDecor + '\n| ' + tmpName + ' |\n' + tmpDecor, 4);
util.out.print('| Loading controller... ', 4, true);

if (cfg.controller.game != null && cfg.controller.game.length) {
	try {
		cfg.controller.dir = './games/' + cfg.controller.game + '/';
		global.gamemode = require(cfg.controller.dir + cfg.controller.game + '.js');
		cfg.game = JSON.parse(fs.readFileSync(cfg.controller.dir + cfg.controller.game + '.json', 'utf8'));
    if (typeof cfg.game.process !== 'object') {
			cfg.game.process = {};
		}
		cfg.game.process.cwd = cfg.controller.dir + 'bots/';
	} catch(err) {
		util.out.error(err);
		process.exit(1);
	}

	if (gamemode.init != null) {
		util.out.print('"' + cfg.game.name + '" script loaded.', 4);
    var botFile = null;
		try {
			botFile = fs.readFileSync(cfg.controller.dir + cfg.controller.botFile, 'utf8');
		} catch(err) {
			util.out.error(err);
			process.exit(1);
		}

		if (botFile != null && botFile.length != null) {
			util.out.print('| Reading bot entries... ', 4, true);

			global.bots = botFile.trim().split('\n').map(function(bot, id) {
				var tmp = bot.split(',').map(function(sub) {return sub.trim();});
				return {
					id: id,
					name: tmp[0],
					cmd: tmp[1],
					args: tmp.slice(2)
				};
			});

			if (bots != null && bots.length != null) {
				util.out.print('Found ' + bots.length + ' entries.', 4);
        util.out.print('| Setup complete. Starting "' + cfg.game.name + '".\n' + tmpDecor, 4);
        util.out.prefix(cfg.game.name);

				gamemode.init(process.argv.slice(process.argv.indexOf('*') + 1 || argPos));
			} else {
				util.out.error('Found no entries in the "' + cfg.controller.botFile + '" file.');
			}
		} else {
			util.out.error('Failed to load "' + cfg.controller.botFile + '" file.');
		}
	} else {
		util.out.error('Failed to load either the game or config file for "' + cfg.controller.game + '".');
	}
} else {
	util.out.error('Game not specified.');
}
