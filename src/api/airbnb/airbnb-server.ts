import request from "request-promise-native";

export function setupAirbnbRoute(router) {
  router.get("/query-airbnb", async (req, res) => {
    const locations = await queryAirbnb(
      req.query.swLat,
      req.query.swLong,
      req.query.neLat,
      req.query.neLong
    );
    res.json(locations);
  });
}

function queryAirbnb(
  swLat,
  swLong,
  neLat,
  neLong,
  maxPrice = 1000 * 1000 * 1000,
  minPrice = 0
) {
  return request({
    uri: "https://www.airbnb.ae/api/v2/explore_tabs",
    qs: getQueryString(swLat, swLong, neLat, neLong, maxPrice, minPrice)
  }).then(response => {
    const parsedResponse = JSON.parse(response);
    if (parsedResponse.explore_tabs.length !== 1) {
      console.error(parsedResponse.explore_tabs.length);
      throw new Error("More than one explore tab");
    }
    const section = parsedResponse.explore_tabs[0].sections.find(
      x => x.section_type_uid === "PAGINATED_HOMES"
    );
    if (
      !section &&
      parsedResponse.explore_tabs[0].sections[0].messages[0].title ===
        "No results"
    ) {
      return [];
    }
    const locations = section.listings.map(x => ({
      priceString: x.pricing_quote.price_string,
      latitude: x.listing.lat,
      longitude: x.listing.lng,
      picture: x.listing.picture_url,
      type: x.listing.room_and_property_type,
      title: x.listing.name
    }));
    return locations;
  });
}

function getQueryString(swLat, swLong, neLat, neLong, maxPrice, minPrice) {
  return {
    sw_lat: swLat.toString(),
    sw_lng: swLong.toString(),
    ne_lat: neLat.toString(),
    ne_lng: neLong.toString(),
    price_max: maxPrice.toString(),
    price_min: minPrice.toString(),
    // These could possibly be interesting to look at later
    experiences_per_grid: "20",
    items_per_grid: "18",
    guidebooks_per_grid: "20",
    currency: "USD",
    locale: "en",
    // Everything below here we just keep because it makes things work, and it's what the browser requested
    version: "1.3.9",
    satori_version: "1.0.7",
    _format: "for_explore_search_web",
    auto_ib: "true",
    fetch_filters: "true",
    has_zero_guest_treatment: "false",
    is_guided_search: "true",
    is_new_cards_experiment: "true",
    luxury_pre_launch: "false",
    query_understanding_enabled: "true",
    show_groupings: "true",
    supports_for_you_v3: "true",
    timezone_offset: "240",
    client_session_id: "a552cedd-4156-4431-912d-f55bd5b149ea",
    metadata_only: "false",
    is_standard_search: "true",
    "refinement_paths%5B%5D": "%2Fhomes",
    selected_tab_id: "home_tab",
    map_toggle: "true",
    search_by_map: "true",
    "allow_override%5B%5D": "",
    zoom: "10",
    federated_search_session_id: "e8f22dea-e48c-482a-bb02-f91db3b445fd",
    screen_size: "medium",
    _intents: "p1",
    key: "d306zoyjsyarp7ifhu67rjxn52tv0t20"
  };
}
