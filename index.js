var Kernel = require('kabam-kernel'),
  express = require('express'),
  path = require('path'),
  mincer = require('mincer'),
  mincerHelpers = require('./lib/mincer_helpers.js');

module.exports = exports = function (config) {
  var kabam = Kernel(config);

//basic frontend
  kabam.usePlugin(require('kabam-plugin-hogan'));

  kabam.extendApp(function (kernel) {
    //core.app.locals.delimiters = '[[ ]]';
    var env;
    kernel.app.locals.javascripts.push({url: '/socket.io/socket.io.js'});

    env = kernel.app.locals.mincerEnvironment = new mincer.Environment();
    // append bower_components so that each component can be required in other components just with its name
    env.appendPath('public/bower_components');
    // all bower's`kabam-core-web-frontend` components will be served as `/assets/<component-name>`
    // `public/bower_components` folder is itself added to mincer by npm's `kabam-core-web-frontend` so
    // all bower components will be served as `/assets/<component-name>` too
    // we need to use `prependPath` because we need higher priority for /kabam-core-web-frontend/public/components
    // this will also make CWF components available for require in other js files just by component's name
    env.prependPath('public/bower_components/kabam-core-web-frontend/public/components');
    // this is needed for styles only, since they are lying in `/public/styles`, so we append public to the end
    // just to use `/assets/styles/<style-name>`
    env.appendPath('public/bower_components/kabam-core-web-frontend/public');
    env.appendPath('public');

    // Serve everything from /assets endpoint
    kernel.app.use('/assets', new mincer.createServer(env));
    // Helpers that help generate script and link tags
    kernel.app.locals.mincerHelpers = mincerHelpers.makeHelpers(env);
  });

  kabam.extendMiddleware(function(kernel){
    return express.static(path.join(__dirname, 'public'));
  });

  kabam.extendMiddleware(function(kernel){
    var helpers = kernel.app.locals.mincerHelpers;
    return function(request,response,next){
      var  user = {};
      if (request.user) {
        user = request.user.export();
      }

      response.locals.user =  JSON.stringify(user).replace('</', '<\/');
      response.locals.css = helpers.css;
      response.locals.js = helpers.js;
      next();
    };
  });

  kabam.catchAll(function(kernel){
    return function(request, response){
      if(request.user){
        response.status(200);
      } else {
        response.status(401);
      }
      response.render('angularBlank', {
        'title':'KabamApplication',
        'doIndex':false
      });
    }
  });

//end of basic frontend

//static html auth/register and edit my profile plugins
// NOTE(chopachom): disabling welcome plugin because it messes up with all other routes (requires auth)
//  kabam.usePlugin(require('kabam-plugin-welcome'));
  kabam.usePlugin(require('kabam-plugin-my-profile'));

//private messages api
  kabam.usePlugin(require('kabam-plugin-private-message'));

//geoip
  kabam.usePlugin(require('kabam-plugin-geoip'));

//enable plugin to send emails
  if (config.emailConfig) {
    kabam.usePlugin(require('kabam-plugin-notify-email'));
  }

  //rest api for mongoose models
  kabam.usePlugin(require('kabam-plugin-rest'));

  //rest api for mongoose models
  kabam.usePlugin(require('kabam-plugin-users'));

  //task queue
  if (config.spine) {
    //kabam.usePlugin(require('kabam-plugin-spine'));
  }

  if(config.logs){
    if(config.logs.filelog===true){
      kabam.usePlugin(require('kabam-plugin-logger-file'));
    }
    if(config.logs.httpMongo===true){
      kabam.usePlugin(require('kabam-plugin-logger-http-mongo'));
    }
    if(config.logs.errorMongo===true){
      kabam.usePlugin(require('kabam-plugin-logger-error-mongo'));
    }
  }
  return kabam;
};
