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
  let searchQuery = req.query.city;
  getLocationData(searchQuery, res).then(data => {
    res.status(200).send(data);
  })

}

function getLocationData(searchQuery) {
  let url = "https://us1.locationiq.com/v1/search.php?key=pk.7dd12762bcaf61d37a5cefac12848a15&q=amman&limit=1&format=json"
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
  let wehaterObject = getWeatherData();
  res.status(200).send(wehaterObject);

}

function getWeatherData() {
  let weatherData = require("./data/weather.json");
  let weaherDataArray = weatherData.data.map(element => {
    return new WeatherConstructor(element.weather.description, new Date(element.datetime).toDateString())
  });
  return weaherDataArray;
}

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


