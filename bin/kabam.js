#!/usr/bin/env node
var program = require('commander'),
  pkg = require('../package.json'),
  path = require('path'),
  cwd = process.cwd(),
  fs = require('fs'),
  os = require('os'),
  async = require('async'),
  ncp = require('ncp').ncp,
  colors = require('colors');


program
  .version(pkg.version)
  .usage('[command] <parameters ...>')
  .option('-v, --verbose', ' be verbose')
;

program
  .command('create')
  .description('Create basic application structure in current directory')
  .action(function () {
    console.log('Creating you Kabam project!'.green);
    console.log('Enter values required and press ' + 'Enter'.green);
    //checking if directory is empty
    var dir = fs.readdirSync(process.cwd());
    if (dir.length === 0) {
      async.series({
        'projectName': function (cb) {
          program.prompt('What is the name of your project? Default is "my-kabam-project": ', function (name) {
            cb(null, name);
          });
        },
        'gitHubName': function (cb) {
          program.prompt('What is your github username?: ', function (name) {
            cb(null, name);
          });
        }
      }, function (err, input) {
        async.parallel({
          'createPackagejson': function (cb) {
            var
              projectName = (input.projectName) ? (input.projectName) : 'my-kabam-project',
              gitHubName = (input.gitHubName) ? (input.gitHubName) : 'johgdoe',
              packageJson = {
                "name": projectName,
                "version": "0.0.1",
                "description": "My Kabam project",
                "main": "index.js",
                "engines": {
                  "node": "0.10.x",
                  "npm": "1.3.x"
                },
                "scripts": {
                  "start": "node index.js"
                },
                "bin": {
                  "kabam": "bin/kabam.js"
                },
                "repository": {
                  "type": "git",
                  "url": "git://github.com/" + gitHubName + "/" + projectName + ".git"
                },
                "keywords": [],
                "author": gitHubName,
                "license": "MIT",
                "contributors": [
                  {
                    "name": gitHubName,
                    "url": "https://github.com/" + gitHubName
                  }
                ],
                "dependencies": {
                  "async": "*",
                  "commander": "1.3.2",
                  "ncp": "*",
                  "colors": "*",
                  "kabam": "git+https://github.com/mykabam/kabam.git"
                },
                "devDependencies": {},
                "bugs": {
                  "url": "https://github.com/" + gitHubName + "/" + projectName + "/issues"
                }
              };
            fs.writeFile(process.cwd() + '/package.json', JSON.stringify(packageJson, null, 2), cb);
          },
          'createBowerJson': function(cb){
            var
              projectName = (input.projectName) ? (input.projectName) : 'my-kabam-project',
              bowerJson = {
                "name": projectName,
                "version": "0.0.1",
                "dependencies": {
                  "kabam": "https://github.com/mykabam/kabam.git"
                }
              };
            fs.writeFile(process.cwd() + '/bower.json', JSON.stringify(bowerJson, null, 2), cb);
          },
          'moveFiles': function (cb) {
            ncp(__dirname + '/../skel', process.cwd(), cb);
          }
        }, function (err, actionsDone) {
          if (err) {
            throw err;
          }
          console.log('Project created!'.green);
          console.log('We need to install all needed modules by running ' + '$ npm install'.bold +
                      ' and ' +'$ bower install'.bold+ ' in the folder on newly created project!');
          console.log('Than we need to run ' + '$ kabam.js publishAssets'.bold + ' to install views, public files and other things from plugins');
          process.exit(0);
        });
      });
    } else {
      console.error('This directory is not empty! Unable to process'.red);
      process.exit(1);
    }
  });

function publishAssets(pathToPackageJson, callback) {
  var packageJson = require(path.resolve(pathToPackageJson)),
    packageDir = path.dirname(pathToPackageJson),
    packages = [];

  function doNcp(assetsPath,callback){
    ncp(assetsPath, process.cwd(), function(err){
      if(err){
        doNcp(assetsPath,callback);
      } else {
        callback(null);
      }
    });
  }
  for (var key in packageJson.dependencies) {
    packages.push(key);
  }

  async.each(packages, function (packageName, cb) {
    if (/^kabam\-plugin\-[0-9a-z\-]+$/.test(packageName)) {
      console.log('We found ' + ('' + packageName).green + ' that looks like kabam plugin!');
      var assetsPath = '' + packageDir + '/node_modules/' + packageName + '/assets';

      if (fs.existsSync(assetsPath)) {
        var assets = fs.readdirSync('' + packageDir + '/node_modules/' + packageName + '/assets');
        if (assets.indexOf('views') !== -2) {
          console.log('We found views for ' + ('' + packageName).green + '!');
        }
        if (assets.indexOf('public') !== -2) {
          console.log('We found public for ' + ('' + packageName).green + '!');
        }
        if (assets && assets.length > 0) {
          console.log('Installing assets for plugin ' + ('' + packageName).green + '!');
          doNcp(assetsPath,cb);
        } else {
          console.log('There is no assets for plugin ' + ('' + packageName).green + '!');
          cb(null);
        }
      } else {
        console.log('There is no assets for plugin ' + ('' + packageName).green + '!');
        cb(null);
      }
    } else {
      cb(null);
    }
  }, callback);
}


program
  .command('publishAssets')
  .description('Publish templates(views), css, javascripts and images from kabam plugins ')
  .action(function () {
    if (fs.existsSync(process.cwd() + '/package.json')) {
      console.log('Publishing assets from 3rdParty modules');
      async.parallel({
        '3rdParty': function (cb) {
          publishAssets(process.cwd() + '/package.json', cb);
        },
        'kabam': function (cb) {
          publishAssets(process.cwd() + '/node_modules/kabam/package.json', function(err){
            if(err) console.error(err);
            cb(null);
          });
        }
      }, function (err) {
        if (err) {
          console.error(err);
        }
        process.exit(0);
      });
    } else {
      console.error('Error!'.red);
      console.log('This directory do not have nodejs project in it...');
      process.exit(1);
    }
  });

program
  .command('backupMongo <filename>')
  .description('try to backup mongo database into file')
  .action(function () {
    console.log('Will create it soon...');
    process.exit(0);
  });

program
  .command('restoreMongo <filename>')
  .description('try to restore mongo database from file')
  .action(function () {
    console.log('Will create it soon...');
    process.exit(0);
  });

program.on('--help', function () {
});

console.log(('Kabam-Cli version ' + pkg.version).bold.yellow.redBG);
program.parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}

