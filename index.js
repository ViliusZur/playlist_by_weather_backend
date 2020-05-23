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

// function to extend timeouts for spotify requests
const extendTimeoutMiddleware = (ctx, next) => {
    const space = ' ';
    let isFinished = false;
    let isDataSent = false;
  
    ctx.response.once('finish', () => {
      isFinished = true;
    });
  
    ctx.response.once('end', () => {
      isFinished = true;
    });
  
    ctx.response.once('close', () => {
      isFinished = true;
    });
  
    ctx.response.on('data', (data) => {
      // Look for something other than our blank space to indicate that real
      // data is now being sent back to the client.
      if (data !== space) {
        isDataSent = true;
      }
    });
  
    const waitAndSend = () => {
      setTimeout(() => {
        // If the response hasn't finished and hasn't sent any data back....
        if (!isFinished && !isDataSent) {
          // Need to write the status code/headers if they haven't been sent yet.
          if (!ctx.response.headersSent) {
            ctx.response.writeHead(202);
          }
  
          ctx.response.write(space);
  
          // Wait another 15 seconds
          waitAndSend();
        }
      }, 15000);
    };
  
    waitAndSend();
    next();
  };


app.use(extendTimeoutMiddleware);
app.use(main.routes());
app.use(authoriseSpotify.routes());
app.use(weather.routes());

var port = process.env.PORT || 3300;
app.listen(port);
