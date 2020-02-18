// for caching search results
let mongoose = require ('mongoose');
let Schema = mongoose.Schema;

let searchSchema = new Schema ({
    _id: {type: String, required: true}, // the search query
    results: [{Title: String, Year: String, imdbID: String, Type: String, Poster: String}]
});

module.exports = mongoose.model('search', searchSchema);
