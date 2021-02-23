"use strict";

const { timeStamp } = require("console");

let express = require("express");

const cors = require('cors');

let superagent = require('superagent');

let app = express();

app.use(cors());

require("dotenv").config();

const PORT = process.env.PORT;


app.get("/location", handleLocation);
app.get("/weather", handleWeather);

app.get("*", handleError);





function handleLocation(req, res) {
  console.log(req.query);
  let searchQuery = req.query.city;
  getLocationData(searchQuery, res).then(data => {
    res.status(200).send(data);
  })

}

function getLocationData(searchQuery) {
  let url = `https://us1.locationiq.com/v1/search.php?key=pk.7dd12762bcaf61d37a5cefac12848a15&q=${searchQuery}&limit=1&format=json`
  return superagent.get(url).then(data => {
    try {
      let displayName = data.body[0].display_name;
      let latitude = data.body[0].lat;
      let longitude = data.body[0].lon;
      return new cityLocation(searchQuery, displayName, latitude, longitude);
    }
    catch (error) {
      res.status(500).send("there is an error" + error);
    }
  }).catch(error => {
    res.status(500).send("there is an error" + error)

  })

}

function cityLocation(searchQuery, displayName, lat, lon) {
  this.search_query = searchQuery;
  this.formatted_query = displayName;
  this.latitude = lat;
  this.longitude = lon;

}



function handleWeather(req, res) {
  console.log(req.query);
  let latQuery = req.query.lat;
  let lonQuery = req.query.lon;
  getWeatherData(latQuery, lonQuery, res).then(data => {
    res.status(400).send(data);
  });

}

function getWeatherData(latQuery, lonQuery, res) {
  let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=5858cc113c8041d987b4f092b7be6624&lat=${latQuery}&lon=${lonQuery}`
  return superagent.get(url).then(data => {
    try {
      let arrayOfWeatherObjects = data.body.data.map((element,i) => {
        return new WeatherConstructor(element.weather.description+".", new Date(element.datetime.split(':').splice(0,1)[0]).toDateString());
      })
    return arrayOfWeatherObjects;
    }
    catch (error) {
      res.status(500).send("there is an error..." + error);
    }
  }).catch(error => {
    res.status(500).send("there is an error..." + error);
  })
};

function WeatherConstructor(forecast, time) {
  this.forecast = forecast;
  this.time = time;

}


function handleError(req, res) {
  res.status(404).send("this page don't work")
}




app.listen(PORT, () => {
  console.log("the app is working" + PORT);
});


