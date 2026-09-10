import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  try {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  } catch {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const SERP_API_KEY = Deno.env.get("SERP_API_KEY");

  try {
    const payload = await req.json().catch(() => ({}));
    const {
      type = "flights",
      q = "",
      departure_id = "",
      arrival_id = "",
      outbound_date = "",
      return_date = "",
      check_in_date = "",
      check_out_date = "",
      adults = 1,
      travel_class = 1,
      currency = "USD",
      rating = "",
      amenities = "",
    } = payload;

    if (!SERP_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "SERP_API_KEY not configured on server",
          fallback: true,
        }),
        {
          status: 200,
          headers: { ...CORS, "Content-Type": "application/json" },
        }
      );
    }

    if (type === "flights") {
      const today = getTodayString();
      let validOutbound = outbound_date;
      let validReturn = return_date;

      if (!validOutbound || validOutbound < today) {
        validOutbound = addDays(today, 14);
        if (validReturn) {
          validReturn = addDays(today, 21);
        }
      } else if (validReturn && validReturn < validOutbound) {
        validReturn = addDays(validOutbound, 7);
      }

      const params = new URLSearchParams({
        engine: "google_flights",
        api_key: SERP_API_KEY,
        currency: currency || "USD",
        adults: String(adults || 1),
      });

      if (departure_id) params.set("departure_id", departure_id);
      if (arrival_id) params.set("arrival_id", arrival_id);
      params.set("outbound_date", validOutbound);
      if (validReturn) params.set("return_date", validReturn);
      if (travel_class) params.set("travel_class", String(travel_class));

      const res = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await res.json();

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: data.error || "SerpApi flights search error", fallback: true }),
          { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      const allFlights = [
        ...(data.best_flights || []),
        ...(data.other_flights || []),
      ];

      const flights = allFlights.map((item: any, idx: number) => {
        const firstFlight = item.flights?.[0] || {};
        const lastFlight = item.flights?.[item.flights.length - 1] || firstFlight;
        const airline = firstFlight.airline || "Airline";
        const flightNumber = firstFlight.flight_number || "";
        const depTime = firstFlight.departure_airport?.time || "08:00";
        const arrTime = lastFlight.arrival_airport?.time || "12:00";
        const depAirport = firstFlight.departure_airport?.id || departure_id || "DEP";
        const arrAirport = lastFlight.arrival_airport?.id || arrival_id || "ARR";
        const totalDuration = item.total_duration ? `${Math.floor(item.total_duration / 60)}h ${item.total_duration % 60}m` : "2h 30m";
        const stopsCount = (item.flights?.length || 1) - 1;
        const stopsText = stopsCount === 0 ? "Nonstop" : `${stopsCount} stop${stopsCount > 1 ? "s" : ""}`;
        const price = item.price ? `${currency === "MYR" ? "RM " : currency === "EUR" ? "€" : "$"}${item.price}` : "Check price";

        return {
          id: `flight-serp-${idx}-${depAirport}-${arrAirport}`,
          name: `${airline} · ${stopsText.toLowerCase()}`,
          airline,
          flightNumber,
          logo: firstFlight.airline_logo || "",
          dep: depTime,
          arr: arrTime,
          depAirport,
          arrAirport,
          dur: totalDuration,
          stops: stopsText,
          stopsCount,
          price,
          rawPrice: item.price || 0,
          currency: currency || "USD",
          carbonEmission: item.carbon_emissions?.this_flight ? `${Math.round(item.carbon_emissions.this_flight / 1000)} kg CO2e` : null,
          extensions: item.extensions || [],
          note: `${airline} flight ${depAirport} → ${arrAirport}`,
        };
      });

      return new Response(
        JSON.stringify({
          flights,
          priceInsights: data.price_insights || null,
        }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    if (type === "hotels" || type === "rentals") {
      const today = getTodayString();
      let validCheckIn = check_in_date;
      let validCheckOut = check_out_date;

      if (!validCheckIn || validCheckIn < today) {
        validCheckIn = addDays(today, 7);
        validCheckOut = addDays(today, 10);
      } else if (!validCheckOut || validCheckOut <= validCheckIn) {
        validCheckOut = addDays(validCheckIn, 3);
      }

      const isRentals = type === "rentals";
      const params = new URLSearchParams({
        engine: "google_hotels",
        api_key: SERP_API_KEY,
        q: q || (isRentals ? "vacation rentals" : "hotels"),
        currency: currency || "USD",
        adults: String(adults || 1),
      });

      if (isRentals) {
        params.set("vacation_rentals", "true");
      }
      params.set("check_in_date", validCheckIn);
      params.set("check_out_date", validCheckOut);
      if (rating) params.set("rating", rating);
      if (amenities) params.set("amenities", amenities);

      const res = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await res.json();

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: data.error || "SerpApi hotels search error", fallback: true }),
          { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      const properties = (data.properties || []).map((item: any, idx: number) => {
        const ratePerNight = item.rate_per_night?.lowest || item.rate_per_night?.extracted_lowest || item.price || "";
        const numericPrice = typeof ratePerNight === "number" ? ratePerNight : parseInt(String(ratePerNight).replace(/[^0-9]/g, ""), 10) || 0;
        const currencyPrefix = currency === "MYR" ? "RM " : currency === "EUR" ? "€" : "$";
        const formattedPrice = numericPrice ? `${isRentals ? "Avg " : ""}${currencyPrefix}${numericPrice}` : ratePerNight || "Check rates";
        const images = (item.images || []).map((img: any) => (typeof img === "string" ? img : img.thumbnail || img.original_image || "")).filter(Boolean);
        const mainImage = images[0] || item.thumbnail || "/images/alfama.jpg";

        return {
          id: `stay-serp-${type}-${idx}`,
          name: item.name || (isRentals ? "Vacation Rental" : "Hotel"),
          type: isRentals ? "rental" : "hotel",
          rate: String(item.overall_rating || item.rating || "4.5"),
          reviews: item.reviews || item.total_reviews || 0,
          price: formattedPrice,
          rawPrice: numericPrice,
          currency: currency || "USD",
          img: mainImage,
          images: images.length > 0 ? images : [mainImage],
          area: item.neighborhood || item.location || "",
          dealBadge: item.deal || (item.overall_rating >= 4.5 ? "GREAT PRICE" : null),
          amenities: item.amenities || [],
          specs: isRentals
            ? {
                propertyType: item.property_type || "Apartment",
                sleeps: item.extracted_hotel_class || 2,
                bedrooms: 1,
                bathrooms: 1,
              }
            : null,
          note: item.description || (isRentals ? "Entire rental unit with modern amenities" : `${item.hotel_class || 3}-star property with quality service`),
          link: item.link || "",
        };
      });

      return new Response(
        JSON.stringify({
          properties,
          total: properties.length,
        }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: `Unknown type '${type}'` }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || String(err), fallback: true }),
      {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    );
  }
});
