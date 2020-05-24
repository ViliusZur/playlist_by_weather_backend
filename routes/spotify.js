"use strict";

// import libraries
var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
var SpotifyWebApi = require('spotify-web-api-node');
var randomstring = require("randomstring");
var DelayedResponse = require("http-delayed-response");

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

    valence = ctx.request.query.valence;
    valence = parseFloat(valence);
    displayValence = valence;
    if(valence === 0.0) valence = 0.01; 

    var state = randomstring.generate();
    var authoriseURL = await authoriseSpotify.getSpotifyResponseCode(spotifyApi, state);
    console.log(authoriseURL);
    
    ctx.body = authoriseURL;
});


router.get("/setTokens", bodyParser(), async (ctx, next) => {
    // Get code from query and set tokens
    var code = ctx.request.query.code;
    await authoriseSpotify.setSpotifyTokens(spotifyApi, code);
    ctx.response.redirect("https://moodyface.herokuapp.com/loading");
});


router.get("/refreshToken", bodyParser(), async (ctx, next) => {
    // sets a new access token

    await authoriseSpotify.refreshToken(spotifyApi);
});


router.get("/createPlaylist", bodyParser(), async (ctx, next) => {
    
    // set a new timeout of 5 minutes
    ctx.request.socket.setTimeout(5 * 60 * 1000); 

    if(valence === undefined) return;

    // Get users top artists 
    let topArtists = await getUserInfo.getTopArtists(spotifyApi);

    // Get followed artists, returns an array of both top and followed artists
    let artists = await getUserInfo.getFollowedArtists(spotifyApi, topArtists);
    console.log("Number of artists: ", artists.length);

    // Get an artist's top tracks for each artist in array
    let tracks = await getUserInfo.getArtistsTopTracks(spotifyApi, artists);
    let topTracks = tracks[0];
    let topTracksIDs = tracks[1];
    console.log("Number of tracks: ", topTracks.length);

    // Scramble topTracks array and assign track features to each track
    console.log("started shuffling array and getting track features");

    tracks = await createPlaylist.shuffleArray(topTracks, topTracksIDs);
    topTracks = tracks[0];
    topTracksIDs = tracks[1];

    console.log("finished shuffling");
    console.log("starting getting features. topTracksIDs.length: ", topTracksIDs.length);

    topTracks = await createPlaylist.getTrackFeatures(spotifyApi, topTracks, topTracksIDs);

    console.log("get track features completed. topTracks.length: ", topTracks.length);

    // Discard songs that don't fit the mood and weather
    let selectedTracks = await createPlaylist.reduceByMood(topTracks, valence);

    // Make sure there are 30 tracks in the playlist
    // Rise/lower the mood until you get 30
    let newTracks = [];

    console.log("Mood and number of selected tracks: ", valence, selectedTracks.length);

    if(valence >= 0.90){
        while(selectedTracks.length < 30 && valence >= 0.00){
            valence -= 0.01;
            newTracks = await createPlaylist.reduceByMood(topTracks, valence);
            selectedTracks = arrayUnique(selectedTracks.concat(newTracks));
            console.log("Mood and number of selected tracks: ", valence, selectedTracks.length);
        }
    } else{
        while(selectedTracks.length < 30 && valence <= 1.00){
            valence += 0.01;
            newTracks = await createPlaylist.reduceByMood(topTracks, valence);
            selectedTracks = arrayUnique(selectedTracks.concat(newTracks));
            console.log("Mood and number of selected tracks: ", valence, selectedTracks.length);
        }
        if(selectedTracks.length < 30){
            while(selectedTracks.length < 30 && valence >= 0.00){
                valence -= 0.01;
                newTracks = await createPlaylist.reduceByMood(topTracks, valence);
                selectedTracks = arrayUnique(selectedTracks.concat(newTracks));
                console.log("Mood and number of selected tracks: ", valence, selectedTracks.length);
            }   
        }
    }

    // Create playlist
    let message = await createPlaylist.createPrivatePlaylist(spotifyApi, selectedTracks, displayValence);

    ctx.body = message;
});

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

module.exports = router;