
const request = require('request');
const fbAuth = require('./facebook_auth.js')
const mongoDB = require('./db') // require db to routes.js
const tmdb = require('./tmdb.js')
const { spawn } = require('child_process'); // for running external scripts
const pythonProgramPath = './src/pythonML/recommend.py'

module.exports = function(app) {
  // useful middleware for express
  app.use(require('morgan')('combined'));
  app.use(require('cookie-parser')());
  app.use(require('body-parser')
    .urlencoded({ extended: true }));
  app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));

  mongoDB.setup(app)   // give route to modle mongoDB,express app
  fbAuth.setup(app)  // pass function from db.js


  app.get('/', function(req, res) {
    res.redirect('/profile')
  })

  // a user hits this endpoint to search for a movie
  // this endpoint sends a request to omdbAPI and caches the response
  // rendered in "search.pug"
  app.get('/search', function(req, res) {
    let movieName = req.query.moviename
    if (movieName) {
      mongoDB.getSearch(movieName, (err, search) => {
        // check if this movie is in the db
        if (err) {
          throw err
        }
        if (search) {
          // cache hit
          console.log('cache HIT')
          res.render('search', {
            moviename: search._id,
            searchresult: search.results,
            user: req.user
          })
        } else {
          // cache miss -- call omdbapi
          console.log('cache MISS')
          request(
            'http://www.omdbapi.com/?s=' + movieName + '&apiKey=' + process.env.OMDB_API_KEY,
            (error, response, body) => {
              body = JSON.parse(body)
              console.log(body)
              listOfMovies = body.Search
              mongoDB.addSearch({  // store response in db to cache
                query: movieName,
                results: listOfMovies
              })
              res.render('search', {
                moviename: movieName,
                searchresult: listOfMovies,
                user: req.user
              })
            })
        }
      })
    } else {
      res.render('search', {
        user: req.user
      })
    }
  })

  // may have query string "status". status=1 means display seen list
  // if "status" query does not exist, display the watch list (default)
  app.get('/profile',function(req, res) {
    if (req.user) {
      mongoDB.getUser(req.user.id, (err, usr) => {
        if (err) {
          throw err
        }
        else {
          // determine type of list to show, default is watch list
          let list = "Watch List"
          let movieList = usr.watchList

          let status = req.query.status
          if (status === "1") {
            list = "Seen List"
            movieList = usr.seenMovies;
          }
          res.render('profile', {
            user: usr,
            listOfMovies: movieList,
            listType: list
          })
        }
      })
    }
    else {
      res.render('profile')
    }
  })

  // calls a python program to recommend movies based on what the user's seen
  app.get('/recommend', function(req, res) {
    if (req.user) {
      // get user information
      mongoDB.getUser(req.user.id, (err, usr) => {
        if (err) {
          throw err
        }
        else {
          let seenList = usr.seenMovies
          let movieList = []
          // construct input to python program based on user's seenMovies
          // if user has no seen movies, give them default recommendations
          for (let movie of seenList) {
            movieList.push(movie.imdbID)
          }

          // call an external python program that returns a list of movie ids
          const recommend = spawn('python', [pythonProgramPath, movieList])
          recommend.on('error', (err) => {
            console.log('Failed to start subprocess.');
            res.render('recommend', { user: usr })
          });

          // use output of python program
          recommend.stdout.on('data', (data) => {
            data = String(data)
            data = data.replace(/[\n\r]/g, '') // remove newlines
            let listOfIDs = String(data).split(',');
            // get all of the trailers for the above movies
            tmdb.getTrailers(listOfIDs, (trailerIDs) => {
              let movieResults = []
              let completed = 0;
              // make an omdbapi request for every recommended movie
              for (let id of listOfIDs) {
                request('http://www.omdbapi.com/?i=' + id + '&apiKey=' + process.env.OMDB_API_KEY, (error, response, body) => {
                  body = JSON.parse(body)
                  movieResults.push(body)
                  // wait for all requests to finish before rendering page
                  if (++completed == listOfIDs.length) {
            
                    var movieChunks = [];
                    var chunkSize = 3; 
                    for(var i = 0; i < movieResults.length; i+=chunkSize){
                        movieChunks.push(movieResults.slice(i, i+chunkSize));
                        
                    }
                    res.render('recommend', {
                      user: usr,
                      searchresult: movieChunks,
                      trailers: trailerIDs
                    })
                  }
                })
              }
            })
          });
        }
      })
    } else {
      // redirect to login prompt
      res.render('profile')
    }
  })

  app.get('/api/addSeenMovie', (req, res) => {
    // note: posterURL will be the string "N/A" if movie has no poster
    if (req.user && req.query.movieName && req.query.movieID && req.query.posterURL) {
      mongoDB.addSeenMovie(req.user.id, req.query.movieName, req.query.movieID, req.query.posterURL)
      res.sendStatus(200)
    }
    else {
      res.sendStatus(400)
    }
  })

  app.get('/api/addToWatchList', (req, res) => {
    if(req.user && req.query.movieName && req.query.movieID && req.query.posterURL) {
      mongoDB.toWatchList(req.user.id, req.query.movieName, req.query.movieID, req.query.posterURL)
      res.sendStatus(200)
    }
    else {
      res.sendStatus(400)
    }
  })

  app.get('/api/removeMovie', (req, res) => {
    if (req.user && req.query.movieID && req.query.listName) {
      if (req.query.listName == "watchlist") {
        mongoDB.removeWatchlistMovie(req.user.id, req.query.movieID)
      }
      else if (req.query.listName == "seenlist") {
        mongoDB.removeSeenMovie(req.user.id, req.query.movieID)
      }
      res.sendStatus(200)
    }
    else {
      res.sendStatus(400)
    }
  })

}


