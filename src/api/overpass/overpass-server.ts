import queryOverpass from "query-overpass";

type Position = {
  swLat: string;
  swLong: string;
  neLat: string;
  neLong: string;
};

type OSMData = {
  restaurants: any;
  touristAttractions: any;
  leisureAreas: any;
};

export function setupOSMRoute(router) {
  router.get("/osm", async (req, res) => {
    try {
      const OSMData = await getOSMDataWithinBoundary(req.query);
      res.json(OSMData);
    } catch {
      res.sendStatus(500);
    }
  });
}

async function getOSMDataWithinBoundary(pos: Position): Promise<OSMData> {
  const [restaurants, touristAttractions, leisureAreas] = await Promise.all([
    makeOSMQuery(pos, [
      ["amenity", "restaurant"],
      ["amenity", "fast_food"],
      ["amenity", "cafe"]
    ]),
    makeOSMQuery(
      pos,
      [
        "aquarium",
        "artwork",
        "attraction",
        "gallery",
        "museum",
        "picnic_site",
        "theme_park",
        "viewpoint",
        "zoo",
        "yes"
      ].map(x => ["tourism", x] as [string, string])
    ),
    makeOSMQuery(
      pos,
      [
        "adult_gaming_centre",
        "amusement_arcade",
        "beach_resort",
        "bandstand",
        "common",
        "dance",
        "disc_golf_course",
        "dog_park",
        "escape_game",
        "fitness_centre",
        "fitness_station",
        "garden",
        "horse_riding",
        "ice_rink",
        "miniature_golf",
        "nature_reserve",
        "park",
        "picnic_table",
        "pitch",
        "playground",
        "sports_centre",
        "stadium",
        "swimming_area",
        "swimming_pool",
        "track",
        "water_park",
        "wildlife_hide"
      ].map(x => ["leisure", x] as [string, string])
    )
  ]);
  return { restaurants, touristAttractions, leisureAreas };
}

function makeOSMQuery(
  pos: Position,
  keyValuePairs: [string, string][]
): Promise<any> {
  return new Promise((resolve, reject) => {
    queryOverpass(
      `
        (
          ${keyValuePairs
            .map(pair => buildOSMRequirement(pos, pair[0], pair[1]))
            .join("\n")}
        );
        out body;
      `,
      (error, data) => {
        if (error) {
          console.error(
            "Overpass query failed with arguments",
            pos,
            keyValuePairs
          );
          console.error(error);
          reject(error);
          return;
        }
        resolve(data.features);
      },
      {
        flatProperties: true,
        overpassUrl: "https://overpass.kumi.systems/api/interpreter"
      }
    );
  });
}

function buildOSMRequirement(
  { swLat, swLong, neLat, neLong }: Position,
  key: string,
  value: string
) {
  return `node(${swLat},${swLong},${neLat},${neLong})[${key}="${value}"];`;
}
