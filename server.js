"use strict";


// INIT//
const { timeStamp, error } = require("console");

let express = require("express");
const cors = require('cors');
let superagent = require('superagent');
let app = express();
app.use(cors());
require("dotenv").config();
const PORT = process.env.PORT;
const pg = require("pg");
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// GET REQUESTS //
app.get("/location", handleLocation);
app.get("/weather", handleWeather);
app.get("/parks", handleParks)
app.get("*", handleError);


// HANDLE RESPONSES //

function handleLocation(req, res) {
  let searchQuery = req.query.city;

  getLocationData(searchQuery, res).then(data => {
    res.status(200).send(data);
  })
}

function handleWeather(req, res) {

  let latQuery = req.query.latitude;
  let lonQuery = req.query.longitude;
  getWeatherData(latQuery, lonQuery, res).then(data => {
    res.status(200).send(data);
  })

}

function handleParks(req, res) {
  let searchQuery = req.query.search_query;
  // let latQuery = req.query.latitude;
  // let lonQuery = req.query.longitude;
  getParkData(searchQuery, res);
}

function handleError(req, res) {
  res.status(404).send("this page don't work")
}


// GET DATA FUNCTIONS //


function getLocationData(searchQuery, res) {

  let seletRowFromSQL = `SELECT * FROM locations WHERE search_query = $1;`
  return client.query(seletRowFromSQL, [searchQuery]).then(dataBaseRow => {
    // console.log(dataBaseRow);
    if (dataBaseRow.rows.length > 0) {
      console.log("data coming from data base");
      return new cityLocation(dataBaseRow.rows[0].search_query, dataBaseRow.rows[0].formatted_query, dataBaseRow.rows[0].latitude, dataBaseRow.rows[0].longitude);
    } else {
      // if the location not stored in the database store it and after that send it to the man
      const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: 1,
        format: "json"
      };

      let url = `https://us1.locationiq.com/v1/search.php`
      return superagent.get(url).query(query).then(data => {
        try {
          let displayName = data.body[0].display_name;
          let latitude = data.body[0].lat;
          let longitude = data.body[0].lon;
          let insertedSQL = `INSERT INTO locations (search_query, formatted_query,latitude,longitude) VALUES ($1, $2, $3, $4) RETURNING *;`
          let safeValues = [searchQuery, displayName, latitude, longitude];
          return client.query(insertedSQL, safeValues).then(data => {
            console.log("data coming from API");

            return new cityLocation(searchQuery, displayName, latitude, longitude);
          }).catch((error) => {
            console.log(error);
          })

        } catch (error) {
          res.status(500).send("there is an error" + error);
        }
      }).catch(error => {
        res.status(500).send("there is an error" + error);

      })

    }
  }).catch(error => {
    res.status(500).send("there is an error" + error);

  })
}


function getWeatherData(latQuery, lonQuery, res) {

  let query = {
    key: process.env.WEATHER_API_KEY,
    lat: latQuery,
    lon: lonQuery
  }
  let url = `http://api.weatherbit.io/v2.0/forecast/daily`
  return superagent.get(url).query(query).then(data => {
    try {
      let arrayOfWeatherObjects = data.body.data.map((element) => {
        return new WeatherConstructor(element.weather.description + ".", new Date(element.datetime.split(':').splice(0, 1)[0]).toDateString());
      })
      // console.log(arrayOfWeatherObjects);
      return arrayOfWeatherObjects;
    }
    catch (error) {
      res.status(500).send("there is an error..." + error);
    }
  }).catch(error => {
    res.status(500).send("there is an error..." + error);
  })
};


function getParkData(searchQuery, res) {
  let query = {
    api_key: process.env.PARKS_API_KEY,
    limit: 2,
    q: searchQuery
  }

  let url = `https://developer.nps.gov/api/v1/parks`
  return superagent.get(url).query(query).then(responseObject => {
    try {
      let arrayOfParkdObjects = responseObject.body.data.map(element => {
        return new ParksConstructor(element.fullName, Object.values(element.addresses[0]).join(' '), element.fees.length, element.description, element.url)
      })
      res.status(200).send(arrayOfParkdObjects)
    }
    catch (error) {
      res.status(500).send("there is an error..." + error);

    }
  }).catch(error => {
    res.status(500).send("there is an error..." + error);
  }
  )
}


// CONSTRUCTORS //
function cityLocation(searchQuery, displayName, lat, lon) {
  this.search_query = searchQuery;
  this.formatted_query = displayName;
  this.latitude = lat;
  this.longitude = lon;

}


function WeatherConstructor(forecast, time) {
  this.forecast = forecast;
  this.time = time;

}

function ParksConstructor(name, address, fee, description, url) {
  this.name = name;
  this.address = address;
  this.fee = fee;
  this.description = description;
  this.url = url;

}


// LISTEN TO THE PORT //

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log("the app is working" + PORT);
  });
}).catch(error => {
  console.log("there is an error connecting the database" + error);
})