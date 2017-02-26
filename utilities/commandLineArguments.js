const { throwIf } = require('madcode-utils-checkers');

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const CONFIG = 'config';

const group = { [CONFIG]: CONFIG };

const optionDefinitions = [
  {                         name: 'help',         alias: 'h', type: Boolean,  defaultValue: false,        description: "help." },
  { group: group[CONFIG],   name: 'empty',                    type: Boolean,                              description: 'make project empty configs.' },
  { group: group[CONFIG],   name: 'default',                  type: Boolean,                              description: 'make project configs the same as default.' },

  { multiple: true,         name: 'run',          alias: 'r', type: String,   defaultValue: ['default'],  description: 'which task need to run' },
  {                         name: 'mode',         alias: 'm', type: String,                               description: 'mode flag for environment for all tasks.' },

  {                         name: 'production',   alias: 'p', type: Boolean,  defaultValue: false,        description: 'is production.' },
  {                         name: 'environment',  alias: 'e', type: String,                               description: 'environment description.' }
].map(
  function(option) {
    if (option.group != null) {
      const name = option.name;

      option.name = option.group + (name.length > 0 ? '-' + name : '');
      option.description = option.group + ': ' + option.description;
    }

    return option;
  }
);

const names = optionDefinitions.reduce(
  function(result, option) {
    result[option.group || option.name] = true;

    return result;
  }, {}
);

function exists(name) {
  return !throwIf(!names[name], `Option "${name}" not exists.`);
}

function getValue(name) {
  const option = options[name];
  const groupName = group[name];

  if (groupName == null) {
    return options._none[name];
  } else {
    return !option
      ? option
      : Object.keys(option).reduce(
          function(result, key) {
            result[(key == groupName) ? key : key.substr(groupName.length + 1)] = option[key];

            return result;
          }, {}
        );
  }
}

let options;

module.exports = {
  constants: { CONFIG },
  initialize: function(logger) {
    try {
      options = commandLineArgs(optionDefinitions);
    }
    catch(e) {
      if (e.name == 'UNKNOWN_OPTION') {
        logger.error('> Unknown option. See help for usage <');
      }

      return false;
    }

    return true;
  },

  options: function(...names) {
    if (names.length == 1) {
      return exists(names[0]) && getValue(names[0]);
    } else {
      (names.length == 0) && (names = Object.keys(options));

      return names.reduce(function(result, name) {
        exists(name) && (result[name] = getValue(name));

        return result;
      }, {});
    }
  },

  help: function({name, description}) {
    return commandLineUsage([
      {
        header: name,
        content: description
      },
      {
        header: 'Options',
        optionList: optionDefinitions
      }
    ]);
  }
};
