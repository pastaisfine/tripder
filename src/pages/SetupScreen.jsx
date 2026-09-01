import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FRIENDS } from "../data/members";

const DATE_OPTS = [
  { d: "Apr 24", m: "FRI" },
  { d: "Apr 25", m: "SAT" },
  { d: "Apr 26", m: "SUN" },
];

export default function SetupScreen({ useAppState }) {
  const navigate = useNavigate();
  const [dest, setDestState] = useState("");
  const [selected, setSelected] = useState([0, 1, 2]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friendsOn, setFriendsOn] = useState({ ben: true, priya: true, marcus: true });

  const { setDest } = useAppState;
  const destLabel = dest.trim() || "Lisbon, Portugal";
  const link = `tripder.app/t/${destLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lisbon"}-apr24-26`;

  const toggleDate = (i) => {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()));
  };

  const summary = () => {
    if (selected.length === 0) return "No dates picked yet";
    const sorted = [...selected].sort();
    const first = DATE_OPTS[sorted[0]].d;
    const last = DATE_OPTS[sorted[sorted.length - 1]].d;
    const label = first + (selected.length > 1 && last !== first ? ` → ${last}` : "");
    return `${label} · ${selected.length} ${selected.length > 1 ? "nights" : "night"}`;
  };

  const copyInvite = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      } else {
        throw new Error("clipboard unavailable");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const createTrip = () => {
    const d = dest.trim() || "Lisbon, Portugal";
    setDest(d);
    navigate("/swipe");
  };

  return (
    <section className="screen active screen-setup" style={{ paddingTop: "var(--sb)" }}>
        <div className="setup-head">
          <div>
            <div className="eyebrow">New trip</div>
          </div>
        </div>
        <div className="setup-hero">
          <div className="cap">
            <span className="c">Where to, crew?</span>
            <span className="m">Lisbon · SE Europe</span>
          </div>
        </div>

        <div className="field">
          <label>Destination</label>
          <input
            className="input"
            value={dest}
            onChange={(e) => setDestState(e.target.value)}
            placeholder="Lisbon, Portugal"
          />
          <div className="hint">Trip name auto-fills from your destination</div>
        </div>

        <div className="field">
          <label>When</label>
          <div className="dates">
            {DATE_OPTS.map((o, i) => (
              <button
                key={o.d}
                className={`datechip ${selected.includes(i) ? "sel" : ""}`}
                onClick={() => toggleDate(i)}
              >
                <div className="d">{o.d}</div>
                <div className="m">{o.m}</div>
              </button>
            ))}
          </div>
          <div className="datesummary" onClick={() => setScheduleOpen((v) => !v)}>
            {summary()}
            <span className="caret">▾</span>
          </div>
          {scheduleOpen && (
            <div className="dateschedule" style={{ display: "block" }}>
              <div className="dateschedule-head">
                <span>Schedule</span>
                <span>{selected.length} day{selected.length === 1 ? "" : "s"}</span>
              </div>
              <div className="dateschedule-list">
                {[...selected].sort().map((i) => (
                  <div key={i} className="dsrow">
                    <span className="ds-d">{DATE_OPTS[i].d}</span>
                    <span className="ds-m">{DATE_OPTS[i].m}</span>
                  </div>
                ))}
                {selected.length === 0 && <div className="dsempty">No dates selected</div>}
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label>Invite your crew</label>
          <div className="friends">
            {FRIENDS.map((f) => (
              <div
                key={f.k}
                className={`friendrow ${friendsOn[f.k] ? "sel" : ""}`}
                onClick={() => setFriendsOn((prev) => ({ ...prev, [f.k]: !prev[f.k] }))}
              >
                <div className="avatar sm" style={{ background: f.c }}>{f.n.slice(0, 2)}</div>
                <div>
                  <div className="fname">{f.n}</div>
                  <div className="frole">{f.role}</div>
                </div>
                <span className="fcheck">✓</span>
              </div>
            ))}
          </div>
        </div>

        <button className="invite-btn" onClick={() => setInviteOpen((v) => !v)}>
          <span className="plus">+</span> Copy invite link
        </button>
        {inviteOpen && (
          <div className="invitebox">
            <div className="invitebox-title">Invite the group</div>
            <div className="invitebox-desc">Share this link — they'll land straight on the swipe screen.</div>
            <div className="invitebox-copy">
              <input className="input" readOnly value={link} />
              <button className="btn btn-secondary" style={{ minHeight: 44 }} onClick={copyInvite}>
                {copied ? "Copied ✓" : "Copy link"}
              </button>
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={createTrip}>
          Create trip & invite group →
        </button>
      </section>
  );
}
