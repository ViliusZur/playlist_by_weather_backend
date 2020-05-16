"use strict";

exports.getTopArtists = async (spotifyApi) => {
    // Retrieve user's top artists from Spotify API

    const ranges = ["short_term", "medium_term", "long_term"];
    let artistIDs = [];

    for (let index in ranges) {
        // Iterate through ranges

        await spotifyApi.getMyTopArtists({ time_range: ranges[index], limit : 50 })
        .then(function(data) {
            // 'This user is following 1051 artists!'
            for(let i = 0; i < data.body.items.length; i++){
                // add artists ids to an array
                artistIDs.indexOf(data.body.items[i].id) === -1 ? artistIDs.push(data.body.items[i].id): false;
            }
        }, function(err) {
            console.log("Something went wrong!", err);s
        });    
      }

    return artistIDs;  
};

exports.getFollowedArtists = async (spotifyApi, artists) => {
    // Retrieve user's followed artists from Spotify API

    await spotifyApi.getFollowedArtists({ limit : 50 })
    .then(function(data) {
        for(let i = 0; i < data.body.artists.items.length; i++){
            // iterate through followed artists and add their ids to an array
            artists.indexOf(data.body.artists.items[i].id) === -1 ? artists.push(data.body.artists.items[i].id): false;
        }
    }, function(err) {
        console.log("Something went wrong!", err);
    });

    return artists;
};

exports.getArtistsTopTracks = async (spotifyApi, artists) => {
    // Retrieve artists top tracks

    let topTracks = [];

    for (let index in artists) {
        // iterate through all artists
        await spotifyApi.getArtistTopTracks(artists[index], "GB")
        .then(function(data) {
            for(let i = 0; i < data.body.tracks.length; i++){
                // iterate through top tracks and add their ids to an array
                topTracks.indexOf(data.body.tracks[i].id) === -1 ? topTracks.push(data.body.tracks[i].id): false;
            }
        }, function(err) {
            console.log('Something went wrong!', err);
        });
    }
    
    return topTracks;
};
