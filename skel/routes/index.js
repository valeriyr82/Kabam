module.exports = exports = function (kabam) {
  kabam.app.get('/', function (request, response) {
    response.render('index', {userAgent: request.headers['user-agent'], title: 'Welcome!'})
  });
};
