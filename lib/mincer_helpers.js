var
  express = require('express'),
  path = require('path'),
  mincer = require('mincer');


function rewriteExtension(source, ext) {
  var source_ext = path.extname(source);
  return (source_ext === ext) ? source : (source + ext);
}


/**
 * Returns an object with js and css functions that should be used in templates
 * to generate required tag to load jss/css either minified or normal
 * @param env Mincer environment
 * @returns {{js: Function, css: Function}}
 */
exports.makeHelpers = function (env) {
  // returns a list of asset paths
  function findAssetPaths(logicalPath, ext) {
    var asset = env.findAsset(logicalPath),
      paths = [];

    if (!asset) {
      return null;
    }

    if ('production' !== process.env.NODE_ENV) {
      asset.toArray().forEach(function (dep) {
        paths.push('/assets/' + rewriteExtension(dep.logicalPath, ext) + '?body=1');
      });
    } else {
      paths.push('/assets/' + rewriteExtension(asset.digestPath, ext));
    }

    return paths;
  }
  return {
    js: function javascript(logicalPath) {
      var paths = findAssetPaths(logicalPath, '.js');

      if (!paths) {
        // this will help us notify that given logicalPath is not found
        // without "breaking" view renderer
        return '<script type="application/javascript">alert("Javascript file ' +
          JSON.stringify(logicalPath).replace(/"/g, '\\"') +
          ' not found.")</script>';
      }

      return paths.map(function (path) {
        return '<script type="application/javascript" src="' + path + '"></script>';
      }).join('\n');
    },

    css: function stylesheet(logicalPath) {
      var paths = findAssetPaths(logicalPath, '.css');

      if (!paths) {
        // this will help us notify that given logicalPath is not found
        // without "breaking" view renderer
        return '<script type="application/javascript">alert("Stylesheet file ' +
          JSON.stringify(logicalPath).replace(/"/g, '\\"') +
          ' not found.")</script>';
      }

      return paths.map(function (path) {
        return '<link rel="stylesheet" type="text/css" href="' + path + '" />';
      }).join('\n');
    }
  }
};