export async function queryGeneralData(
  swLat,
  swLong,
  neLat,
  neLong,
  minPrice,
  maxPrice = 1000 * 1000,
  minDate,
  maxDate,
  guests,
  roomType,
  locationFilters = []
) {
  const res = await fetch("/api/general", {
    method: "POST",
    body: JSON.stringify({
      airbnb: {
        swLat,
        swLong,
        neLat,
        neLong,
        minPrice,
        maxPrice,
        minDate,
        maxDate,
        guests,
        roomType
      },
      locationFilters
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return res.json();
}
