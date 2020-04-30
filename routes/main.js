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

router.post("/", bodyParser(), async (ctx, next) => {
/*
    // first, authenticate spotify app
    await authenticate.authenticateSpotify();
*/
    const body = ctx.request.body;

    // receive valence, danceability and weatherID from front end
    const valence = body.valence;
    let weatherID = body.weatherID;

    // convert weatherID to energy range
    const energyRanges = {
        2: [0, 0.2],
        3: [0.3, 0.6],
        5: [0, 0.2],
        6: [0.1, 0.4],
        7: [0, 0.3],
        8: [0.5, 1]
    };
    weatherID = (weatherID / 100) | 0;
    let energy = energyRanges[weatherID];

    // generate random energy level from the given range
    let min = energy[0];
    let max = energy[1];
    energy = (Math.random() * (max - min) + min).toFixed(2);

    console.log(valence + " " + energy);
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