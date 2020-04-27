"use strict";

var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
//var authenticate = require("../models/authenticate.js");
//var artists = require("../models/artists.js");
//var aidopFeatures = require("../models/audioFeatures.js");
//var playlist = require("../models/playlist.js");

var router = Router({
    prefix: "/main"
});

router.post("/", async (ctx, next) => {
/*
    // first, authenticate spotify app
    await authenticate.authenticateSpotify();
*/
    const body = ctx.request.body;

    // receive mood and danceability from front end
    const mood = ctx.request.body.values.mood;
    const danceability = ctx.request.body.values.danceability;
    console.log(mood, danceability);
/*
    // receive Spotify username from front end, get user's favourite artists
    const username = ctx.request.body.values.username;
    const favouriteArtists = await artists.getFavouriteArtists(username);

    // get top 10 tracks for all artists in favouriteArtists (top10 is a dictionary)
    let tracks = await artists.getTop10(favouriteArtists);

    // get audio features for each track (each track is a key, a list with each audio feature is value)
    tracks = await audioFeatures.getAudioFeatures(tracks);

    // create a playlist for the user
    await playlist.createPlaylist(username, mood);
    await playlist.addSongs(tracks, mood);
*/
});
  
module.exports = router;