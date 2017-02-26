const { throwIf } = require('madcode-utils-checkers');

module.exports = function(environment) {
  const files = require('./files')(environment);

  const { packageJSON, context } = environment;

  const PRESET = (function() {
    const result = ((packageJSON.config || {})['easymake'] || {}).preset;

    throwIf(
      typeof result != 'string',
      'Preset must be a string. Preset can be only one.'
    );

    return require(result);
  })();

  const folder = (
    function(context, preset) {
      return {
        project:    files.resolve(context, './.configuration/'),
        'default':  files.resolve(context, preset, 'default/'),
        empty:      files.resolve(context, preset, 'empty/')
      };
    }
  )(context, PRESET)

  function path(name, noCheckParent, subFolder = 'config') {
    let path = files.resolve(context, folder.project, subFolder, name + '.js');

    if (files.fileExists(path)) {
      return path;
    } else {
      if (noCheckParent) { return undefined; }
    }

    path = files.resolve(context, folder['default'], subFolder, name + '.js');

    if (files.fileExists(path)) {
      return path;
    }

    return undefined;
  }

  function load(name, arg) {
    function safeLoad(path) {
      return (path && files.fileExists(path)) ? require(path) : undefined;
    }

    function args(root) {
       return [
         root,
         {
           environment: JSON.parse(JSON.stringify(environment)),
           config: { load, path }
         },
         arg
       ];
    }

    let configDefault = safeLoad(files.resolve(context, folder['default'], 'config', name + '.js'));
    let configProject = safeLoad(path(name, true, 'config'));

    configDefault = configDefault
      ? configDefault(...args(undefined))
      : configDefault;

    return configProject
      ? configProject(...args(configDefault))
      : configDefault;
  }

  return {
    path,
    load,

    create: function(defaults) {
      const project = folder.project;

      files.folderCreate(project);

      files.folderCopyContents(
        folder[defaults ? 'default' : 'empty'],
        project,
        { noOverwrite: true }
      );
    }
  };
};
