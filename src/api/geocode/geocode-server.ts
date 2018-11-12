import request from "request-promise-native";
import querystring from "querystring";

export function setupGeocodeRoute(router) {
  router.get("/geocode", async (req, res) => {
    const qs = querystring.stringify({
      key: process.env.MAP_QUEST_API_KEY,
      q: req.query.query,
      format: "json"
    });
    const response = await request(
      `http://open.mapquestapi.com/nominatim/v1/search.php?${qs}`
    );
    res.json(JSON.parse(response));
  });
}
