#!/usr/bin/env node
const express = require("express");
const axios = require("axios");
const { DateTime } = require("luxon");

const app = express();
app.use(express.json());

// Weather code descriptions
const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

app.post("/weather", async (req, res) => {
    const location = req.body.location;
    if (!location) return res.status(400).send({ error: "No location provided" });

    try {
        // 1. Get coordinates from OpenStreetMap
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { q: location, format: "json", limit: 1 },
            headers: { "User-Agent": "WeatherApp-Server" }
        });

        if (!geoRes.data || geoRes.data.length === 0) {
            return res.status(404).send({ error: "Location not found" });
        }

        const { lat, lon } = geoRes.data[0];

        // 2. Get weather forecast from Open-Meteo
        const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
            params: {
                latitude: lat,
                longitude: lon,
                hourly: "temperature_2m,weathercode",
                timezone: "auto"
            }
        });

        const hourly = weatherRes.data.hourly;
        const timezone = weatherRes.data.timezone || "UTC";

        // 3. Take first 24 hours and translate weather code
        const forecast24h = hourly.time.slice(0, 24).map((time, idx) => ({
            time,
            temperature: hourly.temperature_2m[idx],
            weathercode: hourly.weathercode[idx],
            description: weatherDescriptions[hourly.weathercode[idx]] || "Unknown"
        }));

        // 4. Get current local time in the location's timezone
        const currentTime = DateTime.now().setZone(timezone).toISO();

        // 5. Send response
        res.send({
            location,
            latitude: lat,
            longitude: lon,
            timezone,
            current_time: currentTime,
            forecast_24h: forecast24h
        });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Weather 24h server running on port ${port}`));
