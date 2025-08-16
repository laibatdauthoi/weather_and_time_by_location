#!/usr/bin/env node
const axios = require("axios");

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: npx @laibatdauthoi/weather_and_time_by_location <location>");
        process.exit(1);
    }

    const location = args.join(" ");

    try {
        // 1. Get coordinates from OpenStreetMap
        const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { q: location, format: "json", limit: 1 },
            headers: { "User-Agent": "ChainOpera-MCP-Server" }
        });

        if (!geoRes.data || geoRes.data.length === 0) {
            console.log("Location not found.");
            return;
        }

        const { lat, lon } = geoRes.data[0];

        // 2. Get weather and time information
        const weatherRes = await axios.get("https://api.open-meteo.com/v1/forecast", {
            params: {
                latitude: lat,
                longitude: lon,
                hourly: "temperature_2m,weathercode",
                current_weather: true,
                timezone: "auto"
            }
        });

        console.log({
            location,
            latitude: lat,
            longitude: lon,
            weather: weatherRes.data
        });
    } catch (err) {
        console.error("An error occurred:", err.message);
    }
}

main();
