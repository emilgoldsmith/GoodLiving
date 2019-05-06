import express from "express";
import { setupAirbnbRoute } from "./airbnb/airbnb-server";
import { setupGeocodeRoute } from "./geocode/geocode-server";
import { setupOSMRoute } from "./overpass/overpass-server";
import { setupGeneralApiRoute } from "./general-api-server";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as MobileDetect from "mobile-detect";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const apiRouter = express.Router();

setupAirbnbRoute(apiRouter);
setupGeocodeRoute(apiRouter);
setupOSMRoute(apiRouter);
setupGeneralApiRoute(apiRouter);

/* Let user know we don't support mobile devices */
app.get("*", (req, res, next) => {
  const md = new MobileDetect(req.headers["user-agent"]);
  if (md.mobile()) {
    res
      .status(200)
      .send(
        "Sorry, we currently do not support mobile devices. Please try again from a laptop or desktop to access this site"
      );
  } else {
    next();
  }
});
/* Redirect http to https */
app.get("*", function(req, res, next) {
  if (
    req.headers["x-forwarded-proto"] != "https" &&
    process.env.NODE_ENV === "production"
  )
    res.redirect("https://" + req.hostname + req.url);
  else next(); /* Continue to other routes if we're not redirecting */
});
app.use(express.static("build"));
app.use(bodyParser.json());

app.use("/api", apiRouter);

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => console.log(`Running on port ${port}`));
