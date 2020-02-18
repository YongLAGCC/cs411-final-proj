require('dotenv').config()
const db = require('./db.js')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const users = {}

module.exports = {
	setup,
	passport,
	users
}

passport.serializeUser(function(user, done) {
  done(null, user);
})

passport.deserializeUser(function(user, done) {
  done(null, user);
})

passport.use(
	new FacebookStrategy({
		clientID: process.env.FACEBOOK_APP_ID,
		clientSecret: process.env.FACEBOOK_APP_SECRET,
		callbackURL: "/auth/facebook/callback",
		// profileFields: ["id", "email", "displayName"]
	}, 
	function(accessToken, refreshToken, profile, done) {
    console.log("USER LOGGED IN:", profile)
    db.addUser(profile)
		users[profile.id] = profile
		return done(null, profile)
	}))	

function setup(app) {

  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/login/facebook',
    passport.authenticate('facebook', {
    	failureRedirect: '/profile',
    	successRedirect: '/profile',
    	// scope: ["id", "email", "displayName"]
    }))

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
    	failureRedirect: '/profile',
    	successRedirect: '/profile',
    	// scope: ["id", "email", "displayName"]
		}))
		
}
