import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
  const STATIC_MAP_KEY = Deno.env.get("STATIC_MAP_KEY");

  if (!SERP_API_KEY) {
    return new Response(JSON.stringify({ error: "SERP_API_KEY not configured" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const { q } = await req.json();

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({
      engine: "google_maps_autocomplete",
      q: q.trim(),
      // SerpApi requires an origin even when the user searches globally.
      ll: "@0,0,3z",
      api_key: SERP_API_KEY,
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error || "SerpApi error" }), {
        status: res.status,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const predictions = (data.suggestions || []).map((suggestion: Record<string, unknown>) => {
      const description = (suggestion.value as string) || "";
      const placeId = description.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const mapParams = new URLSearchParams({
        center: description,
        zoom: "15",
        size: "600x300",
        maptype: "roadmap",
        markers: `color:red|${description}`,
      });

      if (STATIC_MAP_KEY) mapParams.set("key", STATIC_MAP_KEY);

      return {
        placeId,
        description,
        mainText: description,
        secondaryText: "",
        mapImageUrl: STATIC_MAP_KEY
          ? `https://maps.googleapis.com/maps/api/staticmap?${mapParams}`
          : "",
      };
    });

    return new Response(JSON.stringify({ predictions }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
