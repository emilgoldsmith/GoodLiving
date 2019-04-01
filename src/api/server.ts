import express from "express";
import { setupAirbnbRoute } from "./airbnb/airbnb-server";
import { setupGeocodeRoute } from "./geocode/geocode-server";
import { setupOSMRoute } from "./overpass/overpass-server";
import { setupGeneralApiRoute } from "./general-api-server";
import enforce from "express-sslify";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const apiRouter = express.Router();

setupAirbnbRoute(apiRouter);
setupGeocodeRoute(apiRouter);
setupOSMRoute(apiRouter);
setupGeneralApiRoute(apiRouter);

app.use(enforce.HTTPS());
app.use(express.static("build"));
app.use(bodyParser.json());

app.use("/api", apiRouter);

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => console.log(`Running on port ${port}`));
