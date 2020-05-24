"use strict";

var Koa = require("koa");
const IO = require('koa-socket-2');
const cors = require("@koa/cors");
var bodyParser = require("koa-bodyparser");

var app = new Koa();
const io = new IO();

app.use(cors());
app.use(bodyParser());

//import all routes
var main = require("./routes/main.js");
var authoriseSpotify = require("./routes/spotify.js");

app.use(main.routes());
app.use(authoriseSpotify.routes());

// this is for opening up a web socket so the client wouldnt time out when generating a playlist
io.attach(app);

io.on('connection', () => {
    console.log('Client connected');

    // send current time to the client every 15 seconds
    setInterval(() => io.emit('time', new Date().toTimeString()), 15000);

    io.on('disconnect', () => console.log('Client disconnected'));
});

io.on('message', (ctx, data) => {
    console.log('client sent data to message endpoint', data);
});


var port = process.env.PORT || 3300;
app.listen(port);
