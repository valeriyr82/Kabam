exports.name = 'Dog';

exports.initFunction = function (kabam) {
  var DogSchema = new kabam.mongoose.Schema({
    'nickname': String
  });

  DogSchema.index({
    nickname: 1
  });

  return kabam.mongoConnection.model('Dog', DogSchema);
};
