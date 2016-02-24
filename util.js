const child = require('child_process');

const local ={
  prefix: cfg.controller.name
};

module.exports = {
  out: {
    error: function(msg, logLevel, sameLine) {
      if (!(logLevel >= 0) || logLevel <= cfg.controller.logLevel) {
        process.stderr.write('Error: ' + (msg+'').replace(/^error:? ?/i, '') + (!sameLine ? '\n' : ''));
      }
    },
    log: function(msg, logLevel, sameLine) {
      if (!(logLevel >= 0) || logLevel <= cfg.controller.logLevel) {
        process.stdout.write('[' + local.prefix + '] ' + msg + (!sameLine ? '\n' : ''));
      }
    },
    print: function(msg, logLevel, sameLine) {
      if (!(logLevel >= 0) || logLevel <= cfg.controller.logLevel) {
        process.stdout.write(msg + (!sameLine ? '\n' : ''));
      }
    },
    prefix: function(prefix) {
      if (prefix) {
        local.prefix = prefix || cfg.controller.name;
      } else {
        return local.prefix;
      }
    }
  },
  run: {
    sync: function(botList, fetchData, callback) {
      for (bot in botList) {
        callback({
          id: bot,
          output: child.execSync(botList[bot].cmd + ' ' + fetchData(bot), cfg.game.process)
        });
      }
      game.run();
    },
    async: function(botList, fetchData, callback) {
      var remaining = botList.length;
      for (bot in botList) {
        (function(botList, bot, fetchData, callback) {
          return child.exec(botList[bot].cmd + ' ' + fetchData(botList[bot].id), cfg.game.process, function(error, stdout, stderr) {
            callback({
              id: botList[bot].id,
              output: stdout
            });
            if (--remaining == 0) {game.run();}
            if (error !== null) {util.error(error, 3);}
          });
        })(botList, bot, fetchData, callback);
      }
    }
  }
};
