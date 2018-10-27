export async function queryAirbnb(swLat, swLong, neLat, neLong) {
  const res = await fetch(
    `/api/query-airbnb?swLat=${swLat}&swLong=${swLong}&neLat=${neLat}&neLong=${neLong}`
  );
  const body = await res.json();
  console.log(body);
}
