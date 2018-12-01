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

function getOSMDataWithinBoundary(
  swLat,
  swLong,
  neLat,
  neLong
): Promise<{ features: any }> {
  return new Promise((resolve, reject) => {
    queryOverpass(
      `
        (
            node(${swLat},${swLong},${neLat},${neLong})[amenity="restaurant"];
            node(${swLat},${swLong},${neLat},${neLong})[amenity="fast_food"];
            node(${swLat},${swLong},${neLat},${neLong})[amenity="cafe"];
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
