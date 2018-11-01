export async function geocode(query) {
  const res = await fetch(`/api/geocode?query=${encodeURI(query)}`);
  console.log(res);
  return res.json();
}
