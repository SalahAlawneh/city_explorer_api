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
    let locationObject = getLocationData(searchQuery);
    res.status(200).send(locationObject);

}

function getLocationData(searchQuery) {
    const query = {
      key: process.env.GEOCODE_API_KEY,
      q: searchQuery,
      limit: 1,
      format: 'json'
    };
    let url = 'https://us1.locationiq.com/v1/search.php';
    return superagent.get(url).query(query).then(data => {
      try {
        let longitude = data.body[0].lon;
        let latitude = data.body[0].lat;
        let displayName = data.body[0].display_name;
        let responseObject = new CityLocation(searchQuery, displayName, lat, lon);
        return responseObject;
      } catch (error) {
        res.status(500).send(error);
      }
    }).catch(error => {
      res.status(500).send('There was an error getting data from API ' + error);
    });
    
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


