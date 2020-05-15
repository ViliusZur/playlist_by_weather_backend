"use strict";

var Koa = require("koa");
const cors = require("@koa/cors");
var bodyParser = require("koa-bodyparser");

var app = new Koa();

app.use(cors());

//import all routes
var main = require("./routes/main.js");
var authoriseSpotify = require("./routes/spotify.js");
var weather = require("./routes/weather.js");

app.use(main.routes());
app.use(authoriseSpotify.routes());
app.use(weather.routes());

var port = process.env.PORT || 3300;
app.listen(port);
