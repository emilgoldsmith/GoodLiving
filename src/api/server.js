const express = require("express");
const { setupAirbnbRoute } = require("./airbnb/airbnb-server");
const { setupGeocodeRoute } = require("./geocode/geocode-server");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

const apiRouter = express.Router();

setupAirbnbRoute(apiRouter);
setupGeocodeRoute(apiRouter);

app.use(express.static("build"));

app.use("/api", apiRouter);

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => console.log(`Running on port ${port}`));
