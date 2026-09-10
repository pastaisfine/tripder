import { SEARCH_FLIGHTS, SEARCH_HOTELS, SEARCH_VACATION_RENTALS } from "../data/travel";

const TRAVEL_PROXY_URL =
  import.meta.env.VITE_TRAVEL_PROXY_URL ||
  (import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-search`
    : "http://localhost:54321/functions/v1/travel-search");

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function formatCurrency(rawPrices, currency = "USD") {
  const curr = currency.toUpperCase();
  const symbol = curr === "MYR" ? "RM " : curr === "EUR" ? "€" : curr === "GBP" ? "£" : "$";
  if (rawPrices && typeof rawPrices === "object") {
    if (rawPrices[curr] != null) {
      return `${symbol}${rawPrices[curr]}`;
    }
    const defaultVal = rawPrices.USD || rawPrices.MYR || rawPrices.EUR || 100;
    return `${symbol}${defaultVal}`;
  }
  return `${symbol}100`;
}

export async function searchFlights({
  origin = "",
  destination = "",
  departureDate = "",
  returnDate = "",
  adults = 1,
  travelClass = 1,
  currency = "USD",
  stopsFilter = "all",
}) {
  try {
    const res = await fetch(TRAVEL_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
      },
      body: JSON.stringify({
        type: "flights",
        departure_id: origin,
        arrival_id: destination,
        outbound_date: departureDate,
        return_date: returnDate,
        adults,
        travel_class: travelClass,
        currency,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.flights && Array.isArray(data.flights) && data.flights.length > 0 && !data.fallback) {
        return data.flights;
      }
      if (data.error) {
        console.warn("[travelSearch] Flights search notice:", data.error);
      }
    }
  } catch (err) {
    console.warn("[travelSearch] Flights search network error, using fallback dataset:", err);
  }

  // Realistic mock fallback filtering
  let results = [...SEARCH_FLIGHTS];

  if (origin) {
    const o = origin.toLowerCase();
    const matched = results.filter(
      (f) =>
        f.origin.toLowerCase().includes(o) ||
        f.depAirport.toLowerCase().includes(o)
    );
    results = matched;
  }

  if (destination) {
    const d = destination.toLowerCase();
    const matched = results.filter(
      (f) =>
        f.destination.toLowerCase().includes(d) ||
        f.arrAirport.toLowerCase().includes(d)
    );
    results = matched;
  }

  if (stopsFilter === "nonstop") {
    results = results.filter((f) => f.stopsCount === 0);
  }

  return results.map((item) => ({
    ...item,
    price: formatCurrency(item.rawPrices, currency),
  }));
}

export async function searchHotels({
  query = "",
  checkInDate = "",
  checkOutDate = "",
  adults = 1,
  currency = "USD",
  minRating = 0,
  amenityFilter = null,
  maxPrice = null,
}) {
  try {
    const res = await fetch(TRAVEL_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
      },
      body: JSON.stringify({
        type: "hotels",
        q: query,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults,
        currency,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.properties && Array.isArray(data.properties) && data.properties.length > 0 && !data.fallback) {
        return data.properties;
      }
      if (data.error) {
        console.warn("[travelSearch] Hotels search notice:", data.error);
      }
    }
  } catch (err) {
    console.warn("[travelSearch] Hotels search network error, using fallback dataset:", err);
  }

  let results = [...SEARCH_HOTELS];

  if (query) {
    const q = query.toLowerCase();
    const matched = results.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.area.toLowerCase().includes(q)
    );
    results = matched;
  }

  if (minRating > 0) {
    results = results.filter((h) => parseFloat(h.rate) >= minRating);
  }

  if (maxPrice && maxPrice > 0) {
    const curr = currency.toUpperCase();
    results = results.filter((h) => (h.rawPrices?.[curr] || h.rawPrices?.USD || 0) <= maxPrice);
  }

  if (amenityFilter) {
    const af = amenityFilter.toLowerCase();
    results = results.filter((h) =>
      h.amenities?.some((a) => a.toLowerCase().includes(af))
    );
  }

  return results.map((item) => {
    const curr = currency.toUpperCase();
    const numericPrice = item.rawPrices?.[curr] || item.rawPrices?.USD || 50;
    const formattedPrice = formatCurrency(item.rawPrices, currency);
    return {
      ...item,
      rawPrice: numericPrice,
      price: formattedPrice,
    };
  });
}

export async function searchVacationRentals({
  query = "",
  checkInDate = "",
  checkOutDate = "",
  adults = 1,
  currency = "USD",
  minRating = 0,
  propertyTypeFilter = "all",
}) {
  try {
    const res = await fetch(TRAVEL_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
      },
      body: JSON.stringify({
        type: "rentals",
        q: query,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults,
        currency,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.properties && Array.isArray(data.properties) && data.properties.length > 0 && !data.fallback) {
        return data.properties;
      }
      if (data.error) {
        console.warn("[travelSearch] Vacation rentals notice:", data.error);
      }
    }
  } catch (err) {
    console.warn("[travelSearch] Vacation rentals network error, using fallback dataset:", err);
  }

  let results = [...SEARCH_VACATION_RENTALS];

  if (query) {
    const q = query.toLowerCase();
    const matched = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q)
    );
    results = matched;
  }

  if (minRating > 0) {
    results = results.filter((r) => parseFloat(r.rate) >= minRating);
  }

  if (propertyTypeFilter && propertyTypeFilter !== "all") {
    results = results.filter(
      (r) =>
        r.specs?.propertyType?.toLowerCase().includes(propertyTypeFilter.toLowerCase())
    );
  }

  return results.map((item) => {
    const curr = currency.toUpperCase();
    const numericPrice = item.rawPrices?.[curr] || item.rawPrices?.USD || 50;
    const formattedPrice = `Avg ${formatCurrency(item.rawPrices, currency)}`;
    return {
      ...item,
      rawPrice: numericPrice,
      price: formattedPrice,
    };
  });
}
