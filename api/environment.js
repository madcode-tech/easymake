const path = require('path');
const PARAMETER = 'EASYMAKE_ENVIRONMENT';

module.exports = {
  create: function(context, ...parameters) {
    const env = parameters.reduce(
      function(result, params) {
        return Object.assign(result, params);
      },
      {
        context,
        packageJSON: require(path.resolve(context, './package.json'))
      }
    );

    const paths = require('./config')(env).load('common.paths');

    paths.folder = require('./files')(env).resolveAll(context, paths.folder);

    env.paths = paths;

    return env;
  },

  set: function(process, environment) {
    process.env = Object.assign(
      process.env || {},
      { [PARAMETER]: JSON.stringify(environment) }
    );

    return process.env;
  },

  get: function(process) {
    return JSON.parse(process.env[PARAMETER] || '{}');
  }
};
