const child_process = require('child_process');

module.exports = {
  spawn: function(command, args, params = {}) {
    return child_process.spawn(
      command,
      args,
      Object.assign(
        {},
        {
          cwd: process.cwd(),
          env: process.env,
          stdio: 'inherit'
        },
        params
      )
    );
  }
}
