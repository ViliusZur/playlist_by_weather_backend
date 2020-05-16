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


var router = Router({
    prefix: "/Spotify"
});


let times = 0; // to count how many times /topArtists has been visited


// spotify credentials
var credentials = {
    clientId: process.env.SPOTIFY_API_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_API_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_API_REDIRECT_URI
};
// initiate spotifyApi
var spotifyApi = new SpotifyWebApi(credentials);



router.get("/authorise", bodyParser(), async (ctx, next) => {
    //gets authorisation url from which gets authorisation code
    ctx.body = "authorising";
    var state = randomstring.generate();
    var authoriseURL = await authoriseSpotify.getSpotifyResponseCode(spotifyApi, state);

    // we use library "open" to open a new tab where user can log in with Spotify and authorise this app
    open(authoriseURL);
});

router.get("/setTokens", bodyParser(), async (ctx, next) => {
    // gets access and refresh tokens with authotisation code
    ctx.body = "byebye";
    var code = ctx.request.query.code;
    await authoriseSpotify.setSpotifyTokens(spotifyApi, code);
    //console.log("Access token: ", spotifyApi.getAccessToken());

    // we redirect to front end page which closes the tab
    ctx.response.redirect("http://localhost:3000/close");
});

router.get("/refreshToken", bodyParser(), async (ctx, next) => {
    // sets a new access token

    await authoriseSpotify.refreshToken(spotifyApi);
});

router.get("/topArtists", bodyParser(), async (ctx, next) => {
    // we get users top artists as well as artists user follows
    if(times === 0){ // this is a fix for a problem where close.jsx in front end would send a fetch request 2 times ending up in too many spotify calls
        times ++;
        // Get top artists 
        let topArtists = await getUserInfo.getTopArtists(spotifyApi);

        
        // Get followed artists, returns an array of both top and followed artists
        let artists = await getUserInfo.getFollowedArtists(spotifyApi, topArtists);

        // Get an artist's top tracks for each artist in array
        let topTracks = await getUserInfo.getArtistsTopTracks(spotifyApi, artists);
        console.log(topTracks.length);
        
        /*
        // Get Audio Features for several tracks
        spotifyApi.getAudioFeaturesForTracks(['4iV5W9uYEdYUVa79Axb7Rh', '3Qm86XLflmIXVm1wcwkgDK'])
        .then(function(data) {
            console.log(data.body);
        }, function(err) {
            done(err);
        });

        // Create a private playlist
        spotifyApi.createPlaylist('My Cool Playlist', { 'public' : false })
        .then(function(data) {
            console.log('Created playlist!');
        }, function(err) {
            console.log('Something went wrong!', err);
        });

        // Add tracks to a playlist
        spotifyApi.addTracksToPlaylist('5ieJqeLJjjI8iJWaxeBLuK', ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"])
        .then(function(data) {
            console.log('Added tracks to playlist!');
        }, function(err) {
            console.log('Something went wrong!', err);
        });

        // Upload a custom playlist cover image
        spotifyApi.uploadCustomPlaylistCoverImage('5ieJqeLJjjI8iJWaxeBLuK','longbase64uri')
        .then(function(data) {
            console.log('Playlsit cover image uploaded!');
        }, function(err) {
            console.log('Something went wrong!', err);
        });
        */
    }
});

module.exports = router;