const request = require('request')
const util = require('util')
const async = require('async')

module.exports = {
	getTrailers
}

const movieLookupUrl = [
	"https://api.themoviedb.org/3",
	"/find/%s",
	"?api_key=%s",
	"&language=en-US&external_source=imdb_id"
].join("")
const trailerLookupUrl = "https://api.themoviedb.org/3/movie/%s/videos?api_key=%s"

function getTrailers(ids, callback) {
	// asynchronously fetch all movie trailers at the same time
	return async.map(ids, 
		(id, callback) => {
			// look up the tmdb ID
			let url = util.format(movieLookupUrl, id, process.env.TMDB_API_KEY)
			request(url, (err, res, body) => {
				if (err) {
					return callback(err, "")
				}
				body = JSON.parse(body)
				if (!body["movie_results"]) {
					return callback(null, "")
				}
				let tmdbId = body["movie_results"][0]["id"]
				// look up the movie trailer
				let url2 = util.format(trailerLookupUrl, tmdbId, process.env.TMDB_API_KEY)
				request(url2, (err, res, body) => {
					if (err) {
						return callback(err, "")
					}
					body = JSON.parse(body)
					if (body.results) {
						for (res of body.results) {
							if (res.type == "Trailer" && res.site == "YouTube") {
								return callback(null, {
									"id": id,
									"key": res.key
								})
							}
						}
					}
					return callback(null, "")
				})
			})
		},
		(err, results) => {
			if (err) {
				console.log("ERR:", err)
				callback({})
			}
			else {
				res = {}
				results.forEach(r => {
					if (typeof r == "object") {
						res[r.id] = r.key
					}
				})
				callback(res)
			}
		}
	)
}
