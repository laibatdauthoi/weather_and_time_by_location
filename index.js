#!/usr/bin/env node
import express from "express";
import { DateTime } from "luxon";

const app = express();

// Route trả về thời gian UTC
app.get("/utc", (req, res) => {
    const currentUTC = DateTime.utc().toISO(); // Lấy thời gian UTC hiện tại
    res.send({ utc_time: currentUTC });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`UTC server running on port ${port}`));
