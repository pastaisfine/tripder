import { useNavigate } from "react-router-dom";
import { HOTELS, FLIGHTS, CAR_RENTALS } from "../data/travel";

export default function TravelScreen({ useAppState }) {
  const navigate = useNavigate();
  const { hotel, flight, selectHotel, selectFlight } = useAppState;

  const hotels = HOTELS;
  const flights = FLIGHTS;
  const carRentals = CAR_RENTALS;

  const hotelPicked = hotels.find((h) => h.id === hotel);
  const flightPicked = flights.find((f) => f.id === flight);
  const both = hotel && flight;

  const row = (item, kind) => (
    <div
      key={item.id}
      className={`tlrow ${(kind === "hotels" ? hotel : flight) === item.id ? "sel" : ""}`}
      onClick={() => (kind === "hotels" ? selectHotel(item.id) : selectFlight(item.id))}
    >
      <div className="tl-thumb" style={{ backgroundImage: `url('${item.img}')` }} />
      <div className="tl-main">
        <div className="tl-name">{item.name}</div>
        <div className="tl-sub">{kind === "hotels" ? `${item.area} · ` : ""}{item.note}</div>
      </div>
      <div className="tl-tail">
        <div className="tl-price">{item.price}</div>
        <div className="tl-rate">{kind === "hotels" ? `★ ${item.rate} · ` : `${item.dur} · `}{item.dep}{kind === "flights" ? `→${item.arr}` : ""}</div>
      </div>
      <span className="tl-check">✓</span>
    </div>
  );

  const carRow = (item) => (
  <div
    key={item.id}
    className="tlrow"
  >
    <div
      className="tl-thumb"
      style={{ backgroundImage: `url('${item.img}')` }}
    />
    <div className="tl-main">
      <div className="tl-name">{item.name}</div>
      <div className="tl-sub">{item.type}</div>
    </div>
    <div className="tl-tail">
      <div className="tl-price">{item.price}</div>
    </div>
  </div>
  );

  return (

      <section className="screen active screen-travel">
        <div className="travel-head">
          <h1 className="h-display" style={{ fontSize: 27 }}>Trip basics</h1>
          <div className="eyebrow" style={{ marginTop: 4 }}>As the leader, pick the stay &amp; the flight.</div>
        </div>

        <div className="travel-flow">
          <div>
            <div className="bento-card travel-section" style={{ padding: "var(--card-pad)" }}>
              <div className="travel-sec-head" style={{ marginTop: 0 }}>
                <h2>Where you'll stay</h2>
                <span className="eyebrow">{hotelPicked ? hotelPicked.name : "none picked"}</span>
              </div>
              <div className="tllist">{hotels.map((h) => row(h, "hotels"))}</div>
            </div>
          </div>
          <div>
            <div className="bento-card travel-section" style={{ padding: "var(--card-pad)" }}>
              <div className="travel-sec-head" style={{ marginTop: 0 }}>
                <h2>Getting there</h2>
                <span className="eyebrow">{flightPicked ? flightPicked.name : "none picked"}</span>
              </div>
              <div className="tllist">{flights.map((f) => row(f, "flights"))}</div>
            </div>
          </div>
          {/* adding car rentals section */}
        <div>
          <div className="bento-card travel-section" style={{ padding: "var(--card-pad)" }}>
            <div className="travel-sec-head" style={{ marginTop: 0 }}>
              <h2>Getting around</h2>
              <span className="eyebrow">Car rental</span>
            </div>
            <div className="tllist">
              {carRentals.map((car) => carRow(car))}
            </div>
          </div>          
        </div>
        </div>

        {both && (
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 22 }}
            onClick={() => navigate("/plan")}
          >
            Looks good — back to the plan →
          </button>
        )}
      </section>
  );
}
