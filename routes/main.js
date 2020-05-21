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

    // redirect to authorisation page
    ctx.response.redirect(`http://localhost:3300/Spotify/authorise?valence=${valence}`);
});
  
module.exports = router;