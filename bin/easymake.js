#!/usr/bin/env node

const logger = require('../utilities/logger');
const tasks = require('../utilities/tasks');
const config = require('../api/config');
const {
  constants: { CONFIG },
  options,
  help,
  initialize: optionsInitialize
} = require('../utilities/commandLineArguments');
const environment = require('../api/environment');

function entry(process, context) {
  if (!optionsInitialize(logger) || options('help')) {
    process.stdout.write(help(require('../package.json')));

    process.exit(0);
  } else {
    const env = environment.create(
      context,
      options('mode', 'production', 'environment')
    );

    environment.set(process, env);

    const optionConfig = options(CONFIG);

    if (Object.keys(optionConfig).length > 0) {
      config(env).create(optionConfig.default);

      process.exit(0);
    } else {
      tasks.initialize(logger);

      tasks.run(options('run'), function(error) { process.exit(error || 0); });
    }
  }
}

entry(process, process.cwd());
