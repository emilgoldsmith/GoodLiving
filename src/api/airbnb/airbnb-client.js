export async function queryAirbnb(
  swLat,
  swLong,
  neLat,
  neLong,
  minPrice,
  maxPrice,
  minDate,
  maxDate
) {
  const res = await fetch(
    `/api/query-airbnb?swLat=${swLat}&swLong=${swLong}&neLat=${neLat}&neLong=${neLong}&minPrice=${minPrice ||
      0}&maxPrice=${maxPrice ||
      1000 * 1000}&minDate=${minDate}&maxDate=${maxDate}`
  );
  return res.json();
}
