"use strict";

var Koa = require("koa");
const cors = require("@koa/cors");
var bodyParser = require("koa-bodyparser");
var DelayedResponse = require("http-delayed-response");

var app = new Koa();

app.use(cors());

//import all routes
var main = require("./routes/main.js");
var authoriseSpotify = require("./routes/spotify.js");
var weather = require("./routes/weather.js");

app.use(main.routes());
app.use(function (req, res) {
    var delayed = new DelayedResponse(req, res);
    delayed.start();
    authoriseSpotify.routes()
    // will eventually end when the promise is fulfilled
    delayed.end();
});
app.use(weather.routes());

var port = process.env.PORT || 3300;
app.listen(port);
