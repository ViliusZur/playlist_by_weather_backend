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
        }, function() {
            console.log("Error in getting top artists!");
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
    }, function() {
        console.log("Error in getting followed artists!");
    });

    return artists;
};

exports.getArtistsTopTracks = async (spotifyApi, artists) => {
    // Retrieve artists top tracks

    let topTracks = [];
    let topTracksIDs = [];
    let pass;

    for (let index in artists) {
        // iterate through all artists

        pass = false;
        while(pass === false){
            await spotifyApi.getArtistTopTracks(artists[index], "GB")
            .then(function(data) {
                for(let i = 0; i < data.body.tracks.length; i++){
                    // iterate through top tracks and add their URIs to an array
                    topTracks.indexOf(data.body.tracks[i].uri) === -1 ? topTracks.push(data.body.tracks[i].uri): false;
                    topTracksIDs.indexOf(data.body.tracks[i].id) === -1 ? topTracksIDs.push(data.body.tracks[i].id): false;
                }
                pass = true;
            }, function() {
                console.log('Error in getting artists top tracks!');
            });
        }
    }
    
    return [ topTracks, topTracksIDs ];
};
