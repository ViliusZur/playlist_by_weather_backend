"use strict";

var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
var SpotifyWebApi = require('spotify-web-api-node');
var authoriseSpotify = require("../models/authoriseSpotify");
var randomstring = require("randomstring");
var open = require("open");

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
    console.log("Access token: ", spotifyApi.getAccessToken());

    // we redirect to front end page which closes the tab
    ctx.response.redirect("http://localhost:3000/close");
});

router.get("/refreshToken", bodyParser(), async (ctx, next) => {
    // sets a new access token

    await authoriseSpotify.refreshToken(spotifyApi);
});

router.get("/topArtists", bodyParser(), async (ctx, next) => {
    // we get users top artists as well as artists he/she follows
    
    console.log("topArtists");
});

module.exports = router;