var Kabam = require('./../index.js'),
  request = require('request'),
  should = require('should');

describe('general build test', function () {
  var kabam;
  before(function (done) {
    kabam = Kabam({
      'hostUrl': 'http://vvv.msk0.ru/',
      'mongoUrl': 'mongodb://localhost/mwc_dev',
      'secret': 'Long_and_hard_secret',
      'redis': 'redis://mwcKernel:@localhost:6379',
      'emailConfig': ((process.env.emailConfig) ? (process.env.emailConfig) : 'myemail@gmail.com:1234567'),
      'passport': {
        'GITHUB_CLIENT_ID': '--insert-github-client-id-here--',
        'GITHUB_CLIENT_SECRET': '--insert-github-client-secret-here--',
        'TWITTER_CONSUMER_KEY': '--insert-twitter-consumer-key-here--',
        'TWITTER_CONSUMER_SECRET': '--insert-twitter-consumer-secret-here--',
        'FACEBOOK_APP_ID': '--insert-facebook-app-id-here--',
        'FACEBOOK_APP_SECRET': '--insert-facebook-app-secret-here--'
      },
      'spine': {
        'domains': ['urgentTasks']
      }
    });

    kabam.extendRoutes(function (core) {
      core.app.get('/', function (request, response) {
        response.render('index', {
          userAgent: request.headers['user-agent'],
          title: 'Welcome!'
        });
      });
    });
    kabam.start(3008);
    setTimeout(done, 1000);
  });
  describe('npm can build and run this application', function () {
    var response, body;
    before(function (done) {
      request.get('http://localhost:3008/', function (err, res, b) {
        if (err) {
          throw err;
        }
        response = res;
        body = b;
        done();
      });
    });

    it('it starts HTTP server on port localhost:3008', function () {
      response.statusCode.should.equal(200); //this is ok
    });

    it('this server runs a ExpressJS application', function () {
      response.headers['x-powered-by'].should.be.equal('Express');
    });
  });
  after(function (done) {
    kabam.stop();
    done();
  });
});