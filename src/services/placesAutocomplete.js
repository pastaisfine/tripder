const PROXY_URL = import.meta.env.VITE_PLACES_PROXY_URL || "/api/places-autocomplete";

let abortCtrl = null;

export async function searchPlaces(query) {
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
    signal: abortCtrl.signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Search failed");
  }

  const data = await res.json();
  return data.predictions || [];
}
