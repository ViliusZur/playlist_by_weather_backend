"use strict";

var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
// require and process .env file
require('dotenv').config()

var router = Router({
    prefix: "/main"
});

router.post("/", bodyParser(), async (ctx, next) => {

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

    // redirect to authorisation page
    ctx.response.redirect("http://localhost:3300/Spotify/authorise");
});
  
module.exports = router;