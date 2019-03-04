import request from "request-promise-native";
import { getAmenities } from "./amenity-cache";
import { Listing, NearbyFilter } from "./types";

export type AirbnbParams = {
  swLat: string;
  swLong: string;
  neLat: string;
  neLong: string;
  maxPrice: string;
  minPrice: string;
  minDate: string;
  maxDate: string;
  guests: string;
  roomType: string;
  requiredAmenities: string[];
  nearbyFilters: NearbyFilter;
  items?: number;
  itemOffset?: number;
};

export function setupAirbnbRoute(router) {
  router.get("/query-airbnb", async (req, res) => {
    try {
      const locations = await queryAirbnb(req.query);
      res.json(locations);
    } catch {
      res.sendStatus(500);
    }
  });
}

export function queryAirbnb(params: AirbnbParams) {
  return request({
    uri: "https://www.airbnb.ae/api/v2/explore_tabs",
    qs: getQueryString(params),
    qsStringifyOptions: { arrayFormat: "brackets" }
  })
    .then(async response => {
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
      const incompleteListings: Listing[] = (section.listings as any[]).map(
        x => ({
          priceString: x.pricing_quote.price_string,
          latitude: x.listing.lat,
          longitude: x.listing.lng,
          picture: x.listing.picture_url,
          type: x.listing.room_and_property_type,
          title: x.listing.name,
          amenityIds: x.listing.amenity_ids,
          id: x.listing.id
        })
      );
      const listings = await Promise.all(
        incompleteListings.map(async listing => ({
          ...listing,
          amenities: await getAmenities(listing)
        }))
      );
      // Sanity check
      const listingsViolateAmenityFilter = listings.some(listing => {
        const listingViolates = (params.requiredAmenities || []).some(
          requiredId => {
            return (
              listing.amenities.find(x => x.id.toString() === requiredId) ===
              undefined
            );
          }
        );
        return listingViolates;
      });
      if (listingsViolateAmenityFilter) {
        console.error("We have a violation of the amenity filter");
      }
      return listings;
    })
    .catch(e => {
      console.error(e);
      throw new Error();
    });
}

function getQueryString({
  swLat,
  swLong,
  neLat,
  neLong,
  maxPrice,
  minPrice,
  minDate,
  maxDate,
  guests,
  roomType,
  requiredAmenities,
  nearbyFilters,
  items = 40,
  itemOffset = 0
}: AirbnbParams) {
  return {
    sw_lat: swLat.toString(),
    sw_lng: swLong.toString(),
    ne_lat: neLat.toString(),
    ne_lng: neLong.toString(),
    price_max: maxPrice.toString(),
    price_min: minPrice.toString(),
    checkin: minDate,
    checkout: maxDate,
    adults: guests.toString(),
    ...(requiredAmenities ? { amenities: requiredAmenities } : {}),
    // Don't set key if nothing is chosen
    ...(roomType ? { "room_types[]": roomType } : {}),
    items_per_grid: items.toString(),
    items_offset: itemOffset.toString(),
    // These could possibly be interesting to look at later
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
