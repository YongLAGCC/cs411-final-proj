var mongoose = require ('mongoose');
var Schema = mongoose.Schema; 

var userSchema = new Schema ({
  displayName: {type: String, required: true},
  _id: {type: String, required: true},
  seenMovies: [{name: String, imdbID: String, poster: String}],
  watchList: [{name: String, imdbID: String, poster: String}]
});

module.exports = mongoose.model('user', userSchema);
