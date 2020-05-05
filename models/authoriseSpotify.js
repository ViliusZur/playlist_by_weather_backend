"use strict";

exports.getSpotifyResponseCode = async (spotifyApi, state) => {
    // authenticate Spotify with credentials

    var scopes = ["user-library-read", "user-top-read", "playlist-modify-public", "user-follow-read"];

    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

    return authorizeURL;
};

exports.setSpotifyTokens = async (spotifyApi, code) => {
    // Retrieve an access token and a refresh token

    await spotifyApi.authorizationCodeGrant(code).then(
        function(data) {
            /*
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);
            */
            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);

        },
        function(err) {
            console.log('Something went wrong!', err);
        }
    );
};

exports.refreshToken = async (spotifyApi) => {
    // refhreshes spotify access token

    spotifyApi.refreshAccessToken().then(
        function(data) {
          console.log('The access token has been refreshed!');
      
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
          console.log('Could not refresh access token', err);
        }
      );
};