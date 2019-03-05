import { AirbnbParams, queryAirbnb } from "./airbnb/airbnb-server";
import { Position, getOSMDataWithinBoundary } from "./overpass/overpass-server";
import { getDistance } from "geolib";
import * as _ from "lodash";
import { Router } from "express";

type LocationFilter = {
  keyValuePairs: ([string] | [string, string])[];
  minDist: number;
  maxDist: number;
  requireAllPairs: boolean;
};

type QueryObject = {
  airbnb: AirbnbParams;
  locationFilters: LocationFilter[];
};

export function setupGeneralApiRoute(router: Router) {
  router.post("/general", async (req, res) => {
    try {
      const generalData = await getAppData(req.body);
      res.json(generalData);
    } catch {
      res.sendStatus(500);
    }
  });
}

async function getAppData(query: QueryObject) {
  const numAirbnbResults = 1000;
  const [airbnbResults, OSMResults] = await Promise.all([
    queryAirbnb({ ...query.airbnb, items: numAirbnbResults }),
    getOSMDataWithinBoundary(query.airbnb)
  ]);
  const filteredAirbnbResults = airbnbResults.filter(result =>
    query.locationFilters.every(filter =>
      _.some(OSMResults, value =>
        value.some(node =>
          (filter.requireAllPairs
            ? filter.keyValuePairs.every
            : filter.keyValuePairs.some)(keyValue => {
            if (
              Object.prototype.hasOwnProperty.call(
                node.properties,
                keyValue[0]
              ) &&
              (keyValue.length === 1 ||
                node.properties[keyValue[0]] === keyValue[1])
            ) {
              const dist = getDistance(
                {
                  latitude: node.geometry[0],
                  longitude: node.geometry[1]
                },
                {
                  latitude: Number(result.latitude),
                  longitude: Number(result.longitude)
                }
              );
              return dist > filter.minDist && dist < filter.maxDist;
            }
          })
        )
      )
    )
  );
  return { airbnbResults: filteredAirbnbResults, OSMData: OSMResults };
}
