import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { MEMBERS } from "../data/members";
import { HOTELS, FLIGHTS, CAR_RENTALS } from "../data/travel";
import ProgressBar from "../components/ProgressBar";
import InfiniteSpiral from "../components/InfiniteSpiral";
import { fmtDateRange, dayCount } from "../utils/date";

export default function HubScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    likes, skips, reasonCount, styleSeen, styleName, dest, startDate, endDate, activeStops,
    hotel, flight, carRental
  } = useAppState;

  const hotelPicked = HOTELS.find((h) => h.id === hotel);
  const flightPicked = FLIGHTS.find((f) => f.id === flight);
  const carPicked = CAR_RENTALS.find((c) => c.id === carRental);

  const mineDone = likes + skips > 0;
  const doneCount = 3 + (mineDone ? 1 : 0);
  const dateRange = fmtDateRange(startDate, endDate);
  const days = startDate && endDate ? dayCount(startDate, endDate) : 3;
  const spiralItems = useMemo(
    () => activeStops.map((stop) => ({ id: stop.id, src: stop.img, alt: stop.name })),
    [activeStops],
  );

  return (
    <section className="screen active spiral-screen spiral-screen--hub">
      <div className="spiral-backdrop" aria-hidden="true">
        <InfiniteSpiral
          items={spiralItems}
          speed={0.11}
          radius={270}
          cardWidth={182}
          cardHeight={124}
          verticalSpacing={100}
          cardsPerTurn={6}
          rotation={-12}
          cardTilt={4}
          cardRadius={20}
          centerScale={1.04}
          edgeFade={0.2}
          edgeBlur={9}
          grayscale={0.38}
          pauseOnHover={false}
        />
      </div>
      <div className="hub-hero">
        <div className="scrim-top" />
        <img src="/images/miradouro-santa-luzia.jpg" alt="Lisbon" />
        <div className="veil" />
        <div className="hh">
          <div className="dest">{dest || "Lisbon, Portugal"}{dateRange ? ` — ${dateRange}` : ""}</div>
          <div className="meta">{days} days · 4 friends</div>
        </div>
      </div>

      <div className="hub-body">
        {/* 1. Who's Swiped Section */}
        <section className="section-card bento-card" style={{ padding: "var(--card-pad)" }}>
          <h3>Who's swiped</h3>
          <div className="memberlist">
            {MEMBERS.map((m) => {
              const isUser = m.k === "alice";
              const memberName = isUser ? (profile?.username || m.n) : m.n;
              const finished = m.done || (isUser && mineDone);
              return (
                <div key={m.k} className="mem" title={finished ? m.style || styleName : "not swiped yet"}>
                  <div className={`avatar ${finished ? "done" : ""}`} style={{ background: m.c }}>
                    {memberName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="nm">{memberName}</span>
                  <span className="st">{finished ? "swiped" : "swiping"}</span>
                </div>
              );
            })}
          </div>
          <ProgressBar value={Math.round((doneCount / 4) * 100)} />
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {doneCount} of 4 swiped — the reveal unlocks when the last person finishes
          </div>
        </section>

        {/* 2. Your Turn Section */}
        <section className="you-card section-card bento-card" style={{ padding: "var(--card-pad)" }}>
          <h3>{mineDone ? "You're in" : "Your turn"}</h3>
          <div className="card-sub" style={{ marginTop: 4 }}>
            {mineDone
              ? `${likes} liked, ${skips} skipped, ${reasonCount} reasons logged. Ben, Priya and Marcus are already locked in.`
              : "9 places, ~2 minutes. Swipe right for want, left for skip — add a short reason and the AI learns you."}
          </div>
          {mineDone && styleSeen && (
            <div className="styleline">
              <span className="tag">{styleName}</span>
            </div>
          )}
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 14 }}
            onClick={() => {
              if (!mineDone) navigate("/swipe");
              else navigate("/style");
            }}
          >
            {!mineDone ? "Start swiping" : styleSeen ? "Review my swipes" : "Reveal my travel style"}
          </button>
        </section>

        {/* 3. Trip Basics Summary (Clicking "Change selections" navigates to /travel) */}
        <section className="bento-card" style={{ padding: "var(--card-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0 }}>Trip basics</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>
                Current selections for your stay, flight &amp; transport
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            <div style={{ background: "var(--bg-card-sub, rgba(255,255,255,0.04))", padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Stay</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{hotelPicked ? hotelPicked.name : "None picked"}</div>
            </div>
            <div style={{ background: "var(--bg-card-sub, rgba(255,255,255,0.04))", padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Flight</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flightPicked ? flightPicked.name : "None picked"}</div>
            </div>
            <div style={{ background: "var(--bg-card-sub, rgba(255,255,255,0.04))", padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Transport</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{carPicked ? carPicked.name : "None picked"}</div>
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: "6px 14px", fontSize: 13 }}
            onClick={() => navigate("/travel")}
          >
            Change selections →
          </button>
        </section>

        {/* 4. Shared Plan Ready Section */}
        {styleSeen && (
          <section className="bento-card" style={{ padding: "var(--card-pad)" }}>
            <h3>Shared plan's ready</h3>
            <div className="card-sub" style={{ marginTop: 4 }}>
              See how we balanced everyone's tastes into one day you'll all say yes to.
            </div>
            <button
              className="btn btn-secondary btn-block"
              style={{ marginTop: 14 }}
              onClick={() => navigate("/plan")}
            >
              See the shared plan →
            </button>
          </section>
        )}
      </div>
    </section>
  );
}