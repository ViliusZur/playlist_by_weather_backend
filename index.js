"use strict";

var Koa = require("koa");
const cors = require("@koa/cors");

var app = new Koa();
app.use(cors());

//import all routes
var main = require("./routes/main.js");

app.use(main.routes());

var port = process.env.PORT || 3300;
app.listen(port);
