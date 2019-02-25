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
};

export function setupOSMRoute(router) {
  router.get("/osm", async (req, res) => {
    const OSMData = await getOSMDataWithinBoundary(
      req.query.swLat,
      req.query.swLong,
      req.query.neLat,
      req.query.neLong
    );
    res.json(OSMData);
  });
}

async function getOSMDataWithinBoundary(
  swLat: string,
  swLong: string,
  neLat: string,
  neLong: string
): Promise<OSMData> {
  const pos: Position = { swLat, swLong, neLat, neLong };
  const [restaurants, touristAttractions] = await Promise.all([
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
    )
  ]);
  return { restaurants, touristAttractions };
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
          console.error(error);
          reject(error);
        }
        resolve(data.features);
      },
      { flatProperties: true }
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
