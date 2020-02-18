// database logic goes here
// const Product = require('../models/movie');
const mongoose = require('mongoose');
const userModel = require('../models/user.js')
const searchModel = require('../models/search.js')

mongoose.connect('mongodb://localhost:27017/Movies', { useNewUrlParser: true } );

module.exports = {  // pass to routes
	setup,
  addUser,
  addSeenMovie,
  getUser,
  toWatchList,
  removeSeenMovie,
  removeWatchlistMovie,
  addSearch,
  getSearch
}

function setup(app) {
    // app.get('/movie', function(req, res) {
    //     Product.find(function(err, movie) {
    //         res.render('movie', {title: 'Movie U LOVE', products: movie})
    //     })
    // })
}

function getUser(usrId, done) {
  userModel.findOne({"_id": usrId}, (err, usr) => done(err, usr))
  // userModel.findOne({"_id": usrId}, (err, usr) => {
  //   if (usr) {
  //     return usr
  //   }
  //   else {
  //     return null
  //   }
  // })
}

function toWatchList(userId, movieTitle, movieID, posterURL) {
  userModel.findOne({ "_id": userId}, (err, usr) => {
    usr.watchList.push({
      name: movieTitle,
      imdbID: movieID,
      poster: posterURL
    })
    userModel(usr).save((err) => {
      if(err) throw err
    })
  })
}

function addSeenMovie(userId, movieTitle, movieID, posterURL) {
  userModel.findOne({"_id": userId}, (err, usr) => {
    usr.seenMovies.push({
      name: movieTitle,
      imdbID: movieID,
      poster: posterURL
    })
    userModel(usr).save((err) => {
      if (err) throw err
    })
  })
}

function removeSeenMovie(userId, movieID) {
  userModel.findOne({"_id": userId}, (err, usr) => {
    let newList = []
    usr.seenMovies.forEach(m => {
      if (m.imdbID != movieID) {
        newList.push(m)
      }
    })
    usr.seenMovies = newList
    userModel(usr).save((err) => {
      if (err) throw err
    })
  })
}

function removeWatchlistMovie(userId, movieID) {
  userModel.findOne({"_id": userId}, (err, usr) => {
    let newList = []
    usr.watchList.forEach(m => {
      if (m.imdbID != movieID) {
        newList.push(m)
      }
    })
    usr.watchList = newList
    userModel(usr).save((err) => {
      if (err) throw err
    })
  })
}

function addUser(userObj) {
  userModel.findOne({"_id": userObj.id}, (err, usr) => {
    if (usr) {
      console.log("User " + usr + " has returned.")
    }
    else {
      console.log("Adding user " + userObj + " to database.")
      let thisUser = new userModel({
        displayName: userObj.displayName,
        _id: userObj.id,
      })
      thisUser.save((err) => {
        if (err) throw err
      })
    }
  })
}

// call this to cache search results
function addSearch(searchObj) {
  let search = new searchModel({
    _id: searchObj.query,
    results: searchObj.results
  })
  search.save((err) => {
    if (err) throw err
  })
}

// call this to look up searches in the db before calling omdbapi
function getSearch(searchQuery, done) {
  searchModel.findOne({"_id": searchQuery}, (err, usr) => done(err, usr))
}

