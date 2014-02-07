var kabam = require('kabam'),
  fs = require('fs'),
  path = require('path');

var models = fs.readdirSync('./models'),
  routes = fs.readdirSync('./routes'),
  serviceConfig = require('./config/service.json'),
  appConfig = require('./config/app.json');

function createConfig(serviceConfig, appConfig) {
  var config = {};
  for (var prop in serviceConfig) {
    config[prop] = serviceConfig[prop];
  }
  for (prop in appConfig) {
    config[prop] = appConfig[prop];
  }
  config.views = path.join(__dirname, 'views');
  return config;
}

var main = kabam(createConfig(serviceConfig, appConfig));

models.map(function(modelName) {
  var modelObj = require('./models/' + modelName);
  main.extendModel(modelObj.name, modelObj.initFunction);
});

routes.map(function(routeName) {
  //console.log(routeName);
  main.extendRoutes(require('./routes/'+routeName));
});

if(main.config.startCluster){
  main.startCluster();//to start application as cluster
} else {
  main.start();//to start single process
}


