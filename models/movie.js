var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var movieSchema = new Schema({
    movieTitle: {type: String, required: true},
    year: {type: String, required: true},
    genre: { type: String },
    director: {type: String },
});

module.exports = mongoose.model('movie', movieSchema); // specify name(Movie) of the model
