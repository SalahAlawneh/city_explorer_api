"use strict";

const { timeStamp } = require("console");

let express = require("express");

const cors = require('cors');

let app = express();

app.use(cors());

require("dotenv").config();

const PORT = process.env.PORT;


app.get("/location", handleLocation);

function handleLocation(req, res) {
    let searchQuery = req.query.city;
    let locationObject = getLocationData(searchQuery);
    res.status(200).send(locationObject);

}

function getLocationData(searchQuery) {
    let locationData = require("./data/location.json");
    let longitude = locationData[0].lon;
    let latitude = locationData[0].lat;
    let displayName = locationData[0].display_name;

    let responseObject = new cityLocation(searchQuery, displayName, latitude, longitude);
    return responseObject;
}

function cityLocation(searchQuery, displayName, lat, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lat;
    this.longitude = lon;

}

app.listen(PORT, () => {
    console.log("the app is working" + PORT);
})