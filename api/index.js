const child_process = require('./child_process');
const environment   = require('./environment').get(process)
const config        = require('./config')(environment);
const files         = require('./files')(environment);

module.exports = {
  api: {
    child_process,
    config,
    files
  },
  environment
};
