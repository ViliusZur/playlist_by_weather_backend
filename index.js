"use strict";

var Koa = require("koa");
const cors = require("@koa/cors");
var bodyParser = require("koa-bodyparser");

var app = new Koa();

app.use(cors());
app.use(bodyParser());

//import all routes
var main = require("./routes/main.js");
var authoriseSpotify = require("./routes/spotify.js");

app.use(main.routes());
app.use(authoriseSpotify.routes());

var port = process.env.PORT || 3300;
app.listen(port);
