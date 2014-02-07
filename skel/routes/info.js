module.exports = exports = function (kabam) {
  kabam.app.get('/info', function (request, response) {
    response.send('HI!');
  });
};