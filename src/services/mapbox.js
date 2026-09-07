export async function getDirections(coordinates) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token || coordinates.length < 2) return null;
  
  const coordsStr = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordsStr}?geometries=geojson&access_token=${token}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].geometry;
    }
  } catch (err) {
    console.error("Mapbox Directions error:", err);
  }
  return null;
}
