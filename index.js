"use strict";

var Koa = require("koa");

var app = new Koa();

//import all routes
var main = require("./routes/main.js");

app.use(main.routes());

var port = process.env.PORT || 3300;
app.listen(port);
