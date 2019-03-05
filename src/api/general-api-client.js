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
  amenityFilters,
  nearbyFilters
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
        roomType,
        requiredAmenities: amenityFilters
      },
      locationFilters: nearbyFilters
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}
