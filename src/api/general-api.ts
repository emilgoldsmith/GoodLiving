import { AirbnbParams, queryAirbnb } from "./airbnb/airbnb-server";
import { Position, getOSMDataWithinBoundary } from "./overpass/overpass-server";

type LocationFilter = {
  nodeKey: string;
  nodeValue: string;
  minDist: number;
  maxDist: number;
};

type QueryObject = {
  airbnb: AirbnbParams;
  overpass: Position;
  locationFilters: LocationFilter[];
};

async function getAppData(query: QueryObject) {}
