"use strict";

var Koa = require("koa");
const cors = require("@koa/cors");
var bodyParser = require("koa-bodyparser");

var app = new Koa();

var options = {
    origin: '*'
};

app.use(cors(options));

//import all routes
var main = require("./routes/main.js");
var authoriseSpotify = require("./routes/authoriseSpotify.js");

app.use(main.routes());
app.use(authoriseSpotify.routes());

var port = process.env.PORT || 3300;
app.listen(port);
