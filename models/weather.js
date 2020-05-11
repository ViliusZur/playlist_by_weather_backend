"use strict";

exports.getWeather = async (apiKey, lat, lon, req, res) => {
    // make an api call

    request({
        url: `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        method: "GET",
        json: true
    }, function (error, response, body){
            res.send(body);
    });
};