export async function geocode(query) {
  const res = await fetch(`/api/geocode?query=${encodeURI(query)}`);
  return res.json();
}
