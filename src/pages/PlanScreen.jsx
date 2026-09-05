import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PLAN } from "../data/plans";
import { SATISFACTION } from "../data/styles";
import { HOTELS, FLIGHTS } from "../data/travel";
import SatisfactionRing from "../components/SatisfactionRing";

const MODES = ["balanced", "foodfirst", "slower"];
const MODE_LABELS = { balanced: "Balanced", foodfirst: "Food-first", slower: "Slower pace" };
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function tagClass(tag) {
  if (tag.includes("4/4")) return "tag-ok";
  if (tag.includes("split") || tag.includes("2–2")) return "tag-split";
  return "tag-off";
}

export default function PlanScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userName = profile?.username || "Alice";
  const { mode, setMode, likes, skips, markPlanSeen, hotel, flight, startDate, endDate } = useAppState;
  const [open, setOpen] = useState({});

  const planDay = useMemo(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const mid = new Date((s.getTime() + e.getTime()) / 2);
      return mid;
    }
    return new Date(2025, 3, 25);
  }, [startDate, endDate]);

  const hotelPicked = HOTELS.find((h) => h.id === hotel);
  const flightPicked = FLIGHTS.find((f) => f.id === flight);

  useEffect(() => {
    markPlanSeen();
  }, [markPlanSeen]);

  const plan = PLAN[mode];
  const sat = SATISFACTION[mode];
  const aliceSat = Math.max(0, Math.min(97, 91 + Math.round((likes - skips) * 2)));
  const ms = [
    { name: userName, v: aliceSat },
    { name: "Ben", v: 88 },
    { name: "Priya", v: 79 },
    { name: "Marcus", v: 78 },
  ];

  return (

      <section className="screen active">
        <div className="plan-head">
          <div className="eyebrow">{DAYS[planDay.getDay()]} · {MONTHS_SHORT[planDay.getMonth()]} {planDay.getDate()}</div>
          <div className="day">The shared plan</div>
        </div>

        <div className="plan-cards">
          <div className="sat bento-card">
            <SatisfactionRing value={sat} />
            <div className="info">
              <h3>Group satisfaction</h3>
              <p>Weighted across 4 profiles · driven by your tagged reasons.</p>
              <div className="satcats">
                <span className="chip tag-ok">Food · high</span>
                <span className="chip">Culture · medium</span>
                <span className="chip tag-off">Nightlife · low</span>
              </div>
            </div>
          </div>

          <div className="bento-card">
            <div className="bx-title">Trip basics · you're the leader</div>
            <div className="tl-picks">
              <div className="tl-pick">
                <span className="lbl">Stay</span>
                <span className="val">{hotelPicked ? `${hotelPicked.name} · ${hotelPicked.price}` : "none picked"}</span>
              </div>
              <div className="tl-pick">
                <span className="lbl">Flight</span>
                <span className="val">{flightPicked ? `${flightPicked.name} · ${flightPicked.price}` : "none picked"}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => navigate("/travel")}>
              Set stay &amp; flights →
            </button>
          </div>

          <div className="whatif bento-card">
            <div className="bx-title">What if we tried…</div>
            <div className="seg">
              {MODES.map((m) => (
                <button key={m} className={mode === m ? "sel" : ""} onClick={() => setMode(m)}>
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div className={`delta ${plan.delta ? "show" : ""}`}>
            <b>What changed:</b> <span dangerouslySetInnerHTML={{ __html: plan.delta }} />
          </div>
        </div>

        <div className="timeline">
          {plan.stops.map((s) => (
            <div key={s.t + s.id} className="stoprow">
              <span className="t">{s.t}</span>
              <div>
                <div className={`stop card ${open[s.id] ? "open" : ""}`}>
                  <div className="stop-top" onClick={() => setOpen((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}>
                    <div className="th">
                      <img src={s.img} alt={`${s.name} in Lisbon`} />
                    </div>
                    <div>
                      <div className="nm">{s.name}</div>
                      <div className="ar">{s.area}</div>
                    </div>
                    <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                  <div className="exp">{s.exp}</div>
                </div>
                <div className="stop-tags">
                  {s.tags.map((t) => (
                    <span key={t} className={`chip ${tagClass(t)}`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="why-head">
          <h3>Why this way?</h3>
        </div>
        <details className="why-note" style={{ margin: "10px 20px 6px" }}>
          <summary>Negotiation notes</summary>
          <div className="bullets">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {plan.why.map((w, i) => (
                <li key={i} style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: w }} />
              ))}
            </ul>
          </div>
        </details>

        <div className="why-head">
          <h3>Group mood</h3>
        </div>
        <div className="member-sat plan-tail" style={{ padding: "6px 20px 30px" }}>
          {ms.map((m) => (
            <div key={m.name} className="msrow">
              <div className="top">
                <b>{m.name}</b>
                <span className="v">{m.v}/100</span>
              </div>
              <div className="bar">
                <i style={{ width: `${m.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
  );
}