import { AirbnbParams, queryAirbnb } from "./airbnb/airbnb-server";
import { Position, getOSMDataWithinBoundary } from "./overpass/overpass-server";
import { getDistance } from "geolib";
import * as _ from "lodash";

type LocationFilter = {
  nodeKey: string;
  nodeValue?: string;
  minDist: number;
  maxDist: number;
};

type QueryObject = {
  airbnb: AirbnbParams;
  overpass: Position;
  locationFilters: LocationFilter[];
};

async function getAppData(query: QueryObject) {
  const numAirbnbResults = 1000;
  const [airbnbResults, OSMResults] = await Promise.all([
    queryAirbnb({ ...query.airbnb, items: numAirbnbResults }),
    getOSMDataWithinBoundary(query.overpass)
  ]);
  airbnbResults.filter(result =>
    query.locationFilters.every(filter =>
      _.some(OSMResults, value =>
        value.some(node => {
          if (
            Object.prototype.hasOwnProperty.call(
              node.properties,
              filter.nodeKey
            ) &&
            (filter.nodeValue === undefined ||
              node.properties[filter.nodeKey] === filter.nodeValue)
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
  );
}
