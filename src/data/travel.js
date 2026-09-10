export const HOTELS = [
  { id: "hotel-a", name: "Memmo Alfama", area: "Alfama", price: "€180", rate: "9.4", img: "/images/alfama.jpg", note: "Boutique, 12 min from the tasca tables" },
  { id: "hotel-b", name: "Santiago do Alfama", area: "Castelo", price: "€210", rate: "9.2", img: "/images/miradouro-santa-luzia.jpg", note: "Design stay with a rooftop pool" },
  { id: "hotel-c", name: "The Lumiares", area: "Bairro Alto", price: "€160", rate: "8.9", img: "/images/alfama.jpg", note: "Apartment-style, near the nightlife" },
  { id: "hotel-d", name: "H10 Duque de Loulé", area: "Avenida", price: "€140", rate: "8.6", img: "/images/gulbenkian.jpg", note: "Central budget pick, easy metro access" },
];

export const FLIGHTS = [
  { id: "flight-a", name: "TAP · direct", dep: "06:40", arr: "09:15", price: "€212", dur: "2h35", img: "/images/miradouro-santa-luzia.jpg", note: "Morning out, evening back" },
  { id: "flight-b", name: "Ryanair · direct", dep: "11:25", arr: "13:50", price: "€128", dur: "2h25", img: "/images/jardim-estrela.jpg", note: "Cheapest, later start" },
  { id: "flight-c", name: "easyJet · direct", dep: "16:10", arr: "18:35", price: "€164", dur: "2h25", img: "/images/park-rooftop-bar.jpg", note: "Afternoon departure, red-eye return" },
];

export const CAR_RENTALS = [
  { id: "car-a", name: "Sixt · Compact", type: "Compact", price: "€45/day", img: "/images/SIxt.jpg", note: "Easy city driving, 5 seats" },
  { id: "car-b", name: "Europcar · Economy", type: "Economy", price: "€38/day", img: "/images/europcar.jpeg", note: "Budget-friendly, 5 seats" },
  { id: "car-c", name: "Hertz · SUV", type: "SUV", price: "€62/day", img: "/images/hertz.jpg", note: "More space for groups and luggage" },
];

export const SEARCH_FLIGHTS = [
  {
    id: "fl-pen-sin",
    origin: "Penang",
    destination: "Singapore",
    airline: "Scoot",
    flightNumber: "TR 427",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/TR.png",
    dep: "08:15",
    arr: "09:45",
    depAirport: "PEN",
    arrAirport: "SIN",
    dur: "1h 30m",
    stops: "Nonstop",
    stopsCount: 0,
    price: "from MYR 409",
    rawPrices: { MYR: 409, USD: 92, EUR: 85, GBP: 73 },
    dates: "Oct 22 — Oct 31",
    carbonEmission: "64 kg CO2e",
    note: "Nonstop flight · Morning departure",
    img: "/images/beach-group-trip-ideas.jpg"
  },
  {
    id: "fl-pen-lgk",
    origin: "Penang",
    destination: "Langkawi",
    airline: "Firefly",
    flightNumber: "FY 2092",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/FY.png",
    dep: "10:30",
    arr: "11:05",
    depAirport: "PEN",
    arrAirport: "LGK",
    dur: "35m",
    stops: "Nonstop",
    stopsCount: 0,
    price: "from MYR 193",
    rawPrices: { MYR: 193, USD: 43, EUR: 40, GBP: 34 },
    dates: "Nov 19 — Nov 26",
    carbonEmission: "28 kg CO2e",
    note: "Short island hop · Great deal",
    img: "/images/miradouro-santa-luzia.jpg"
  },
  {
    id: "fl-pen-kul",
    origin: "Penang",
    destination: "Federal Territory of Kuala Lumpur",
    airline: "AirAsia",
    flightNumber: "AK 6113",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/AK.png",
    dep: "13:20",
    arr: "14:25",
    depAirport: "PEN",
    arrAirport: "KUL",
    dur: "1h 05m",
    stops: "Nonstop",
    stopsCount: 0,
    price: "from MYR 256",
    rawPrices: { MYR: 256, USD: 58, EUR: 53, GBP: 46 },
    dates: "Oct 8 — Oct 14",
    carbonEmission: "45 kg CO2e",
    note: "Frequent daily departures · Nonstop",
    img: "/images/park-rooftop-bar.jpg"
  },
  {
    id: "fl-lis-lhr",
    origin: "Lisbon",
    destination: "London Heathrow",
    airline: "TAP Air Portugal",
    flightNumber: "TP 352",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/TP.png",
    dep: "06:40",
    arr: "09:15",
    depAirport: "LIS",
    arrAirport: "LHR",
    dur: "2h 35m",
    stops: "Nonstop",
    stopsCount: 0,
    price: "from €212",
    rawPrices: { EUR: 212, USD: 230, MYR: 1025, GBP: 182 },
    dates: "Oct 12 — Oct 19",
    carbonEmission: "145 kg CO2e",
    note: "Morning out · Nonstop direct flight",
    img: "/images/miradouro-santa-luzia.jpg"
  },
  {
    id: "fl-lis-cdg",
    origin: "Lisbon",
    destination: "Paris Charles de Gaulle",
    airline: "Ryanair",
    flightNumber: "FR 1882",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/FR.png",
    dep: "11:25",
    arr: "13:50",
    depAirport: "LIS",
    arrAirport: "BVA",
    dur: "2h 25m",
    stops: "Nonstop",
    stopsCount: 0,
    price: "from €128",
    rawPrices: { EUR: 128, USD: 140, MYR: 620, GBP: 110 },
    dates: "Oct 14 — Oct 21",
    carbonEmission: "130 kg CO2e",
    note: "Budget friendly · Great daytime departure",
    img: "/images/jardim-estrela.jpg"
  },
  {
    id: "fl-lis-mad",
    origin: "Lisbon",
    destination: "Madrid Barajas",
    airline: "Iberia",
    flightNumber: "IB 3105",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/IB.png",
    dep: "16:10",
    arr: "18:35",
    depAirport: "LIS",
    arrAirport: "MAD",
    dur: "1h 25m",
    stops: "Nonstop",
    stopsCount: 0,
    price: "from €164",
    rawPrices: { EUR: 164, USD: 178, MYR: 792, GBP: 141 },
    dates: "Oct 15 — Oct 22",
    carbonEmission: "95 kg CO2e",
    note: "Evening arrival · Star Alliance partner",
    img: "/images/gulbenkian.jpg"
  }
];

export const SEARCH_HOTELS = [
  {
    id: "htl-avatel",
    name: "Avatel Jelutong (PWCC)",
    type: "hotel",
    rate: "3.6",
    reviews: 386,
    stars: 3,
    area: "Gelugor, Penang",
    price: "RM 93",
    rawPrices: { MYR: 93, USD: 21, EUR: 19, GBP: 17 },
    dealBadge: "GREAT PRICE",
    img: "/images/beach-group-trip-ideas.jpg",
    images: [
      "/images/beach-group-trip-ideas.jpg",
      "/images/alfama.jpg",
      "/images/miradouro-santa-luzia.jpg"
    ],
    amenities: ["3-star hotel", "Free parking", "Outdoor pool", "Air conditioning", "Kid-friendly", "Free Wi-Fi"],
    note: "Modern hotel with outdoor infinity pool overlooking Jelutong"
  },
  {
    id: "htl-b-hotel",
    name: "B Hotel",
    type: "hotel",
    rate: "2.9",
    reviews: 13,
    stars: 2,
    area: "Gelugor, Penang",
    price: "RM 75",
    rawPrices: { MYR: 75, USD: 17, EUR: 15, GBP: 13 },
    dealBadge: null,
    img: "/images/gulbenkian.jpg",
    images: [
      "/images/gulbenkian.jpg",
      "/images/jardim-estrela.jpg"
    ],
    amenities: ["Free Wi-Fi", "Air conditioning", "24hr front desk"],
    note: "Affordable and central budget stay with essential amenities"
  },
  {
    id: "htl-ov-stay",
    name: "Hotel O V Stay Guesthouse",
    type: "hotel",
    rate: "3.0",
    reviews: 121,
    stars: 1,
    area: "Gelugor, Penang",
    price: "RM 42",
    rawPrices: { MYR: 42, USD: 10, EUR: 9, GBP: 8 },
    dealBadge: null,
    img: "/images/pastel-nata.jpg",
    images: [
      "/images/pastel-nata.jpg",
      "/images/alfama.jpg"
    ],
    amenities: ["1-star hotel", "Air conditioning", "Airport shuttle", "Kid-friendly", "Free Wi-Fi"],
    note: "Clean private room guesthouse with airport shuttle service"
  },
  {
    id: "htl-u-hotel",
    name: "U Hotel Penang",
    type: "hotel",
    rate: "4.0",
    reviews: 1520,
    stars: 3,
    area: "Sungai Dua, Penang",
    price: "RM 154",
    rawPrices: { MYR: 154, USD: 35, EUR: 32, GBP: 28 },
    dealBadge: null,
    img: "/images/lx-factory.jpg",
    images: [
      "/images/lx-factory.jpg",
      "/images/park-rooftop-bar.jpg"
    ],
    amenities: ["3-star hotel", "Free Wi-Fi", "Free parking", "Air conditioning", "Breakfast", "Accessible", "Kid-friendly", "Smoke-free property"],
    note: "Boutique contemporary stay praised for quiet rooms and comfortable bedding"
  },
  {
    id: "htl-memmo",
    name: "Memmo Alfama",
    type: "hotel",
    rate: "4.7",
    reviews: 620,
    stars: 4,
    area: "Alfama, Lisbon",
    price: "€180",
    rawPrices: { EUR: 180, USD: 195, MYR: 890, GBP: 155 },
    dealBadge: "GREAT PRICE",
    img: "/images/alfama.jpg",
    images: [
      "/images/alfama.jpg",
      "/images/miradouro-santa-luzia.jpg"
    ],
    amenities: ["4-star hotel", "Rooftop pool", "Free Wi-Fi", "Bar & Wine tasting", "Air conditioning", "River view"],
    note: "Iconic boutique hotel overlooking the Tagus River and historic Alfama"
  },
  {
    id: "htl-santiago",
    name: "Santiago do Alfama",
    type: "hotel",
    rate: "4.6",
    reviews: 412,
    stars: 5,
    area: "Castelo, Lisbon",
    price: "€210",
    rawPrices: { EUR: 210, USD: 228, MYR: 1040, GBP: 180 },
    dealBadge: null,
    img: "/images/miradouro-santa-luzia.jpg",
    images: [
      "/images/miradouro-santa-luzia.jpg",
      "/images/gulbenkian.jpg"
    ],
    amenities: ["5-star hotel", "Spa & Wellness", "Fine dining", "Free Wi-Fi", "Valet parking", "Air conditioning"],
    note: "Restored 15th-century palace in the shadow of São Jorge Castle"
  }
];

export const SEARCH_VACATION_RENTALS = [
  {
    id: "vct-verde-esperanca",
    name: "Verde Esperança",
    type: "rental",
    rate: "4.7",
    reviews: 16,
    area: "Santos, Lisbon",
    price: "Avg RM 179",
    rawPrices: { MYR: 179, USD: 40, EUR: 37, GBP: 32 },
    dealBadge: null,
    img: "/images/alfama.jpg",
    images: [
      "/images/alfama.jpg",
      "/images/miradouro-santa-luzia.jpg"
    ],
    specs: {
      propertyType: "House",
      sleeps: 2,
      bedrooms: 1,
      bathrooms: 2,
      beds: 2
    },
    amenities: ["House", "Sleeps 2", "1 bedroom", "2 bathrooms", "2 beds", "Smoke-free", "Free Wi-Fi", "No airport shuttle", "No parking"],
    note: "Traditional Portuguese townhouse with French balcony and tile accents"
  },
  {
    id: "vct-pearl-lisbon",
    name: "The Pearl of Lisbon",
    type: "rental",
    rate: "5.0",
    reviews: 8,
    area: "Chiado, Lisbon",
    price: "Avg RM 203",
    rawPrices: { MYR: 203, USD: 46, EUR: 42, GBP: 36 },
    dealBadge: "GREAT PRICE",
    img: "/images/jardim-estrela.jpg",
    images: [
      "/images/jardim-estrela.jpg",
      "/images/gulbenkian.jpg"
    ],
    specs: {
      propertyType: "House",
      sleeps: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1
    },
    amenities: ["House", "Sleeps 2", "1 bedroom", "1 bathroom", "1 bed", "Kitchen", "Smoke-free", "Wheelchair accessible", "Free parking"],
    note: "High-ceiling guest suite with full kitchen, terrace view, and private parking"
  },
  {
    id: "vct-downtown-santa-catarina",
    name: "Downtown Apartment Santa Catarina",
    type: "rental",
    rate: "3.9",
    reviews: 89,
    area: "Santa Catarina, Lisbon",
    price: "Avg RM 281",
    rawPrices: { MYR: 281, USD: 63, EUR: 58, GBP: 50 },
    dealBadge: null,
    img: "/images/timeout-market.jpg",
    images: [
      "/images/timeout-market.jpg",
      "/images/park-rooftop-bar.jpg"
    ],
    specs: {
      propertyType: "Apartment",
      sleeps: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1
    },
    amenities: ["Apartment", "Sleeps 2", "1 bedroom", "Kitchenette", "Free Wi-Fi", "Elevator"],
    note: "Steps from the famous Bica funicular and Santa Catarina viewpoint"
  },
  {
    id: "vct-terrace-hostel",
    name: "Terrace Lisbon Hostel",
    type: "rental",
    rate: "3.9",
    reviews: 286,
    area: "Arroios, Lisbon",
    price: "Avg RM 189",
    rawPrices: { MYR: 189, USD: 42, EUR: 39, GBP: 34 },
    dealBadge: null,
    provider: "Booking.com",
    img: "/images/oceanario.jpg",
    images: [
      "/images/oceanario.jpg"
    ],
    specs: {
      propertyType: "Hostel / Private Room",
      sleeps: 2,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1
    },
    amenities: ["Free Wi-Fi", "2-star hotel", "Sun terrace", "Air conditioning"],
    note: "Cozy sunlit terrace patio with leafy garden vibes"
  },
  {
    id: "vct-upon-lisbon",
    name: "Upon Lisbon Prime Residences",
    type: "rental",
    rate: "4.5",
    reviews: 1900,
    area: "Benfica, Lisbon",
    price: "Avg RM 1,804",
    rawPrices: { MYR: 1804, USD: 405, EUR: 375, GBP: 320 },
    dealBadge: null,
    provider: "Trip.com",
    img: "/images/lx-factory.jpg",
    images: [
      "/images/lx-factory.jpg"
    ],
    specs: {
      propertyType: "Serviced Apartment",
      sleeps: 4,
      bedrooms: 2,
      bathrooms: 2,
      beds: 3
    },
    amenities: ["4-star hotel", "Fitness center", "Free Wi-Fi", "Rooftop infinity pool", "Restaurant"],
    note: "Upscale luxury apartment residences with rooftop bar and dining"
  }
];
