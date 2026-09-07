import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { MEMBERS, AVATAR_COLORS } from "../data/members";
import { TASKS } from "../data/tasks";
import { HOTELS, FLIGHTS, CAR_RENTALS } from "../data/travel";
import ProgressBar from "../components/ProgressBar";
import InfiniteSpiral from "../components/InfiniteSpiral";
import { fmtDateRange, dayCount } from "../utils/date";

export default function HubScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    likes, skips, reasonCount, styleSeen, styleName, dest, startDate, endDate, activeStops,
    hotel, flight, carRental, confirmedItineraryId
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

        {/* 4. Tasks Section */}
        <section className="bento-card" style={{ padding: "var(--card-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Trip tasks</h3>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{TASKS.filter(t => t.status === "done").length} / {TASKS.length} done</span>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {TASKS.map(task => {
              const member = MEMBERS.find(m => m.k === task.assignedTo);
              const avatarColor = AVATAR_COLORS[task.assignedTo] || "#ccc";
              const isDone = task.status === "done";
              return (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "var(--bg-card-sub, rgba(255,255,255,0.04))", borderRadius: 8 }}>
                  <div 
                    style={{ 
                      width: 20, height: 20, borderRadius: "50%", 
                      border: `2px solid ${isDone ? "var(--accent, #a8ff78)" : "var(--muted)"}`,
                      background: isDone ? "var(--accent, #a8ff78)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    {isDone && <span style={{ color: "#000", fontSize: 12 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--muted)" : "inherit", fontSize: 14 }}>
                    {task.title}
                  </div>
                  <div className="avatar" style={{ background: avatarColor, width: 24, height: 24, fontSize: 10 }}>
                    {member ? (member.k === "alice" ? (profile?.username || member.n) : member.n).slice(0, 1).toUpperCase() : "?"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Shared Plan Ready / Confirmed Itinerary Section */}
        {styleSeen && !confirmedItineraryId && (
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

        {confirmedItineraryId && (
          <section className="bento-card" style={{ padding: "var(--card-pad)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Confirmed Itinerary</h3>
              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 12, marginLeft: "8px" }} onClick={() => navigate("/plan")}>View details</button>
            </div>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {activeStops.map((stop, i) => (
                <div key={stop.id} style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{stop.t}</span>
                    {i < activeStops.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 16, background: "var(--border)", margin: "4px 0" }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1, fontSize: 15, paddingBottom: i < activeStops.length - 1 ? 12 : 0, color: "var(--text)", fontWeight: 500 }}>
                    {stop.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}