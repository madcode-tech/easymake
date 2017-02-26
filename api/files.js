/* eslint-disable */
const fs = require('fs-extra');
const path = require('path');

module.exports = function(environment) {
  const { context } = environment;

  function resolve(...args) { return path.resolve(...args); }

  function resolveAll(context, paths = {}) {
    if (Array.isArray(paths)) {
      return paths.map(function(path) { return resolve(context, path); });
    } else {
      return Object.keys(paths).reduce(function(result, name) {
        result[name] = resolve(context, paths[name]);

        return result;
      }, {});
    }
  }

  function fileExists(path) {
    return fs.existsSync(path);
  }

  function fileCopy(from, to) {
    fs.copySync(resolve(context, from), resolve(context, to));
  }

  function folderCreate(folder) {
    fs.mkdirpSync(resolve(context, folder));
  }

  function folderClean(folder) {
    fs.emptyDirSync(resolve(context, folder));
  }

  function fileWrite(path, text, encoding = 'utf8') {
    fs.writeFileSync(path, text, encoding);
  }

  function folderCopyContents(
    from,
    to,
    { changes = {}, noOverwrite, encoding = 'utf8' }
  ) {
    function changeFile(source, destination, changer, relativePath) {
      fileWrite(
        destination,
        changer(fs.readFileSync(source, encoding), relativePath),
        encoding
      );
    }

    function cutSlash(value) {
      return (value[value.length - 1] == '/')
        ? value.substring(0, value.length - 1)
        : value;
    }

    from = cutSlash(resolve(context, from));
    to = cutSlash(resolve(context, to));

    const resolvedChanges = Object.keys(changes).reduce(
      function(result, name) {
        (name != '*') && (result[resolve(context, from, name)] = changes[name]);

        return result;
      },
      { '*': changes['*'] }
    );

    const files = fs.walkSync(from);
    const exclude = noOverwrite ? fs.walkSync(to) : [];

    files && files.forEach(function(source) {
      const relativePath = source.replace(from, '');
      const destination = to + relativePath;
      const changer = resolvedChanges[source] || resolvedChanges['*'];

      if (exclude.indexOf(destination) == -1) {
        if (changer) {
          changeFile(
            source,
            destination,
            changer,
            relativePath.substring(1, relativePath.length)
          );
        } else {
          fileCopy(source, destination);
        }
      }
    })
  }

  return {
    resolve,
    resolveAll,

    folderCreate,
    folderClean,
    folderCopyContents,

    fileCopy,
    fileExists,
    fileWrite
  };
}
