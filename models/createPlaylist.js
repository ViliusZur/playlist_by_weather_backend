"use strict";


exports.shuffleArray = async (topTracks, topTracksIDs) => {
    // Shuffles a given array

    var j, x, i;
    for (i = topTracks.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        // shuffle topTracks
        x = topTracks[i];
        topTracks[i] = topTracks[j];
        topTracks[j] = x;
        // shuffle topTracksIDs
        x = topTracksIDs[i];
        topTracksIDs[i] = topTracksIDs[j];
        topTracksIDs[j] = x;
    }

    return [ topTracks, topTracksIDs ];
};

exports.getTrackFeatures = async (spotifyApi, topTracks, topTracksIDs) => {
    // Retrieves track features (danceability, energy, valence) from Spotify API
    
    let trackFeatures = {};
    let j = 100;
    for(let i = 0; i < topTracks.length; i = i + 100){
        console.log(i);
        await spotifyApi.getAudioFeaturesForTracks(topTracksIDs.slice(i, j))
        .then(function(data) {
            console.log("data.body.audio_features_length: ", data.body.audio_features.length);
            for(let u = 0; u < data.body.audio_features.length; u++){
                trackFeatures[topTracks[i + u]] = [ data.body.audio_features.danceability, data.body.audio_features.energy, data.body.audio_features.valence ];
            }
            console.log("trackFeatures.length: ", trackFeatures.length);
        }, function(err) {
            console.log("error in getting track features", err);
        });
        j = j + 100;
    }

    /*for(let i = 0; i < topTracks.length; i++){
        
        await spotifyApi.getAudioFeaturesForTrack(topTracksIDs[i])
        .then(function(data) {
            //console.log(data.body);
            console.log("inside track features. i: ", i, " features: ", data.body.danceability, data.body.energy, data.body.valence);
            trackFeatures[topTracks[i]] = [ data.body.danceability, data.body.energy, data.body.valence ];
        }, function() {
            // the only error I've been getting is 429 'Too many requests', so I reduce i to try again
            console.log("error in track features with track ", i);
            i--;
        });
    }*/
    console.log("final trackFeatures.length: ", trackFeatures.length);
    return trackFeatures;
};

exports.reduceByMood = async (topTracks, valence) => {
    // discards all songs that do not fit users mood and weather

    let selectedTracks = [];
    let mood1, mood2, danceability, energy;

    for (const [key, value] of Object.entries(topTracks)) {
        // conditional statements taken from: https://medium.com/@mohithsubbarao/moodtape-using-spotify-api-to-create-mood-generated-playlists-6e1244c70892
        
        if(valence < 0.10){
            mood1 = valence + 0.15;
            danceability = valence * 8;
            energy = valence * 10
            if(0 <= value[2] && value[2] <= mood1 && value[0] <= danceability && value[1] <= energy){
                selectedTracks.push(key);
            }
        }
        else if(0.10 <= valence && valence < 0.25){
            mood1 = valence - 0.075;
            mood2 = valence + 0.075;
            danceability = valence * 4;
            energy = valence * 5;
            if(mood1 <= value[2] && value[2] <= mood2 && value[0] <= danceability && value[1] <= energy){
                selectedTracks.push(key);            
            }
        }
        else if(0.25 <= valence && valence < 0.50){
            mood1 = valence - 0.05;
            mood2 = valence + 0.05;
            danceability = valence * 1.75;
            energy = valence * 1.75;
            if(mood1 <= value[2] && value[2] <= mood2 && value[0] <= danceability && value[1] <= energy){
                selectedTracks.push(key);            
            }
        }
        else if(0.50 <= valence && valence < 0.75){
            mood1 = valence - 0.075;
            mood2 = valence + 0.075;
            danceability = valence / 2.5;
            energy = valence / 2;
            if(mood1 <= value[2] && value[2] <= mood2 && value[0] >= danceability && value[1] >= energy){
                selectedTracks.push(key);            
            }
        }
        else if(0.75 <= valence && valence < 0.90){
            mood1 = valence - 0.075;
            mood2 = valence + 0.075;
            danceability = valence / 2;
            energy = valence / 1.75;
            if(mood1 <= value[2] && value[2] <= mood2 && value[0] >= danceability && value[1] >= energy){
                selectedTracks.push(key);            }
        }
        else if(valence >= 0.90){
            mood1 = valence - 0.15;
            danceability = valence / 1.75;
            energy = valence / 1.5;
            if(mood1 <= value[2] && value[2] <= 1 && value[0] >= danceability && value[1] >= energy){
                selectedTracks.push(key);
            }
        }
    }

    return selectedTracks;
};

exports.createPrivatePlaylist = async (spotifyApi, topTracks, valence) => {
    // creates a private playlist and adds songs

    let userID, playlistID;
    const playlistName = "Mood: " + Math.ceil(valence * 100);
    if(topTracks.length > 30) topTracks = topTracks.slice(0, 30); // we will only add 30 tracks

    // get user id
    await spotifyApi.getMe()
    .then(function(data) {
        userID = data.body.id;
    }, function() {
        console.log('Error in getting user data (user id)!');
    });

    // create playlist
    await spotifyApi.createPlaylist(userID, playlistName, { 'public' : true })
    .then(function(data) {
        playlistID = data.body.id;
    }, function() {
        console.log('Error in creating a playlist!');
    });

    // Add tracks to a playlist
    await spotifyApi.addTracksToPlaylist(playlistID, topTracks)
    .then(function(data) {
        console.log('Added tracks to playlist!');
        return ("Check your Spotify! Look for a playlist named " + playlistName);
    }, function() {
        console.log('Error in adding songs to the playlist!');
        return ("There are no songs that match your mood. Try again");
    });
};