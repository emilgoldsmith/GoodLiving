const express = require("express");
const { setupAirbnbRoute } = require("./airbnb/airbnb-server");

const app = express();
const port = 3001;

const router = express.Router();

setupAirbnbRoute(router);

app.use("/api", router);

app.listen(port, () => console.log(`Running on port ${port}`));
