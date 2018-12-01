import express from "express";
import { setupAirbnbRoute } from "./airbnb/airbnb-server";
import { setupGeocodeRoute } from "./geocode/geocode-server";
import { setupOSMRoute } from "./overpass/overpass-server";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const apiRouter = express.Router();

setupAirbnbRoute(apiRouter);
setupGeocodeRoute(apiRouter);
setupOSMRoute(apiRouter);

app.use(express.static("build"));

app.use("/api", apiRouter);

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => console.log(`Running on port ${port}`));
