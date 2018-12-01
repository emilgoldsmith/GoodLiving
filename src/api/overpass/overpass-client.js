export async function getOSMDataWithinBoundary(swLat, swLong, neLat, neLong) {
  const res = await fetch(
    `/api/osm?swLat=${swLat}&swLong=${swLong}&neLat=${neLat}&neLong=${neLong}`
  );
  return res.json();
}
