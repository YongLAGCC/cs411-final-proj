# cs411-final-proj

This README contains everything you need to know about the project.

## Running the Project

* clone this repository
* run `npm install`
* copy `.env-SAMPLE` into a file `.env`
* populate the fields of `.env` as appropriate

## The Stack

We're using Node.js for the backend, Pug to render the frontend, and Express as the http server. Node.js business logic should go in `./src`, new views should go in `./views`.

## Project Requirements

* We use two APIs - `Open Movie Database` and `The Movie Database`. The former has information about movies, directors, actors, and movie posters, whereas the latter contains links to trailers for those moves, which the former does not have.
* We use caching to save search results. By saving these search results, we make fewer calls to OMDB and have quicker responses to our users.
* Users can log in to our application using Facebook OAuth.

## Docs

Documents, specifically the user stories, are in `/docs/user_stories`.
