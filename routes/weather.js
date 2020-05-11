"use strict";

const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const fetch = require('node-fetch');
// require and process .env file
require('dotenv').config()

var router = Router({
    prefix: "/weather"
});

const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;

router.get("/", bodyParser(), async (ctx, next) => {
    // gets latitude and longitude from front end

    const lat = ctx.request.query.lat;
    const lon = ctx.request.query.lon;
    
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const json = await response.json();
        ctx.body = json;
    } catch (error) {
        console.log(error);
    }
});
  
module.exports = router;