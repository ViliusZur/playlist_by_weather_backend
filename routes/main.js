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
        2: 0.8,
        3: 0.6,
        5: 0.3,
        6: 0.3,
        7: 0.5,
        8: 0.8
    };
    weatherID = (weatherID / 100) | 0;
    let energy = energyRanges[weatherID];

    // redirect to authorisation page
    ctx.response.redirect(`http://localhost:3300/Spotify/authorise?valence=${valence}&energy=${energy}`);
});
  
module.exports = router;