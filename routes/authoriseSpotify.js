"use strict";

var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
var SpotifyWebApi = require('spotify-web-api-node');
var authoriseSpotify = require("../models/authoriseSpotify");
var randomstring = require("randomstring");

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

    var state = randomstring.generate();
    var authoriseURL = await authoriseSpotify.getSpotifyResponseCode(spotifyApi, state);
    ctx.response.redirect(authoriseURL);
});

router.get("/setTokens", bodyParser(), async (ctx, next) => {
    // gets access and refresh tokens with authotisation code

    var code = ctx.request.query.code;
    await authoriseSpotify.setSpotifyTokens(spotifyApi, code);
    console.log("Access token: ", spotifyApi.getAccessToken());
});

router.get("/refreshToken", bodyParser(), async (ctx, next) => {
    // sets a new access token

    await authoriseSpotify.refreshToken(spotifyApi);
});

module.exports = router;