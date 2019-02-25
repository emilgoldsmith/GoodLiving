import queryOverpass from "query-overpass";

export function setupOSMRoute(router) {
  router.get("/osm", async (req, res) => {
    const restaurantFeatures = await getOSMDataWithinBoundary(
      req.query.swLat,
      req.query.swLong,
      req.query.neLat,
      req.query.neLong
    );
    res.json(restaurantFeatures.features);
  });
}

type Position = {
  swLat: string;
  swLong: string;
  neLat: string;
  neLong: string;
};

function getOSMDataWithinBoundary(
  swLat: string,
  swLong: string,
  neLat: string,
  neLong: string
): Promise<{ features: any }> {
  const pos: Position = { swLat, swLong, neLat, neLong };
  return makeOSMQuery(pos, [
    ["amenity", "restaurant"],
    ["amenity", "fast_food"],
    ["amenity", "cafe"]
  ]);
}

function makeOSMQuery(
  pos: Position,
  keyValuePairs: [string, string][]
): Promise<{ features: any }> {
  return new Promise((resolve, reject) => {
    queryOverpass(
      `
        (
          ${keyValuePairs
            .map(pair => buildOSMRequirement(pos, pair[0], pair[1]))
            .join("\n")}
            ${buildOSMRequirement(pos, "amenity", "restaurant")}
            ${buildOSMRequirement(pos, "amenity", "fast_food")}
            ${buildOSMRequirement(pos, "amenity", "cafe")}
        );
        out body;
      `,
      (error, data) => {
        if (error) {
          console.error(error);
          reject(error);
        }
        resolve(data as { features: any });
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
