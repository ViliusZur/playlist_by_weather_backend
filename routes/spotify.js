"use strict";

// import libraries
var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
var SpotifyWebApi = require('spotify-web-api-node');
var randomstring = require("randomstring");
var open = require("open");

// import models
var authoriseSpotify = require("../models/authoriseSpotify");
var getUserInfo = require("../models/getUserInfo");
var createPlaylist = require("../models/createPlaylist");


var router = Router({
    prefix: "/Spotify"
});


// spotify credentials
var credentials = {
    clientId: process.env.SPOTIFY_API_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_API_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_API_REDIRECT_URI
};
// initiate spotifyApi
var spotifyApi = new SpotifyWebApi(credentials);

// create variables for valence so I could use them everywhere in this file
let valence, displayValence;

router.get("/authorise", bodyParser(), async (ctx, next) => {
    //gets authorisation url from which gets authorisation code
    ctx.body = "authorising";

    valence = ctx.request.query.valence;
    valence = parseFloat(valence);
    displayValence = valence;
    if(valence === 0.0) valence = 0.01; 

    var state = randomstring.generate();
    var authoriseURL = await authoriseSpotify.getSpotifyResponseCode(spotifyApi, state);

    // we use library "open" to open a new tab where user can log in with Spotify and authorise this app
    open(authoriseURL);
});


router.get("/setTokens", bodyParser(), async (ctx, next) => {
    // Get code from query and set tokens
    var code = ctx.request.query.code;
    await authoriseSpotify.setSpotifyTokens(spotifyApi, code);
    ctx.response.redirect("http://localhost:3000/loading");
});


router.get("/refreshToken", bodyParser(), async (ctx, next) => {
    // sets a new access token

    await authoriseSpotify.refreshToken(spotifyApi);
});


router.get("/createPlaylist", bodyParser(), async (ctx, next) => {

    // Get users top artists 
    let topArtists = await getUserInfo.getTopArtists(spotifyApi);

    // Get followed artists, returns an array of both top and followed artists
    let artists = await getUserInfo.getFollowedArtists(spotifyApi, topArtists);

    // Get an artist's top tracks for each artist in array
    let tracks = await getUserInfo.getArtistsTopTracks(spotifyApi, artists);
    let topTracks = tracks[0];
    let topTracksIDs = tracks[1];
    
    // Scramble topTracks array and assign track features to each track
    tracks = await createPlaylist.shuffleArray(topTracks, topTracksIDs);
    topTracks = tracks[0];
    topTracksIDs = tracks[1];
    topTracks = await createPlaylist.getTrackFeatures(spotifyApi, topTracks, topTracksIDs);

    // Discard songs that don't fit the mood and weather
    let selectedTracks = await createPlaylist.reduceByMood(topTracks, valence);
    
    while(selectedTracks.length != 30){
        if(valence >= 0.96) valence -= 0.01;
        else valence += 0.01;
        selectedTracks = await createPlaylist.reduceByMood(topTracks, valence);
    }
    // Create playlist
    let message = await createPlaylist.createPrivatePlaylist(spotifyApi, selectedTracks, displayValence);

    ctx.response.body = message;
});


module.exports = router;