const { throwIf } = require('madcode-utils-checkers');
const orchestrator  = new (require('orchestrator'))();

function listenEvents(logger) {
  orchestrator.on('start',
    function(evt) { logger.print('TASK SEQUENCE start.'); }
  );
  orchestrator.on('stop',
    function(evt) { logger.print('TASK SEQUENCE stop.'); }
  );
  orchestrator.on('err',
    function(evt) { logger.error('TASK SEQUENCE failed.'); process.exit(1); }
  );

  orchestrator.on('task_start',
    function(evt) { logger.print('TASK start: "' + evt.task + '"'); }
  );
  orchestrator.on('task_stop',
    function(evt) {
      logger.print('TASK stop: "' + evt.task + '". Duration: ' + evt.duration);
    }
  );
  orchestrator.on('task_err',
    function(evt) {
      logger.error('TASK failed: "' + evt.task + '" error: ' + evt.err);
    }
  );

  orchestrator.on('task_not_found',
    function(evt) { logger.error('Unknown task "' + evt.task + '".'); }
  );
  orchestrator.on('task_recursion',
    function(evt) { logger.error(evt.message); }
  );
}

let DEFAULT;

function initialize(logger) {
  listenEvents(logger);

  const { environment, api } = require('../api/index');
  const environmentJSON = JSON.stringify(environment);

  const tasks = api.config.load('common.tasks');

  Object.keys(tasks).forEach(
    function(id) {
      const { module, dependencies = [], empty, default: isDefault } = tasks[id] || {};

      isDefault && (DEFAULT = id);

      let wrapper;

      if (!empty) {
        const name = (module == null ? id : module) + '/task';
        const path = api.config.path(name, false, 'task');

        throwIf(path == null, "Can not find task " + name);

        const work = require(path);

        wrapper = (work.length > 1)
          ? function(end) {
              work({ environment: JSON.parse(environmentJSON), api }, end);
            }
          : function(end) {
              work({ environment: JSON.parse(environmentJSON), api });
              end();
            };
      }

      !Array.isArray(dependencies) && (dependencies = [dependencies]);

      orchestrator.add(id, dependencies, wrapper);
    }
  );
}

function run(ids, end) {
  orchestrator.start(
    ids.map(function(id) { return (id == 'default' ? DEFAULT : id); }),
    end
  );
}

module.exports = {
  initialize,
  run
};
