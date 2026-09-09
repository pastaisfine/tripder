import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Star } from "phosphor-react";
import { useAuth } from "../context/useAuth";
import { FRIENDS } from "../data/members";
import { dayCount } from "../utils/date";
import BottomSheet from "../components/BottomSheet";
import PreferenceForm, { EMPTY_PREFERENCES } from "../components/PreferenceForm";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1);
const isSameDay = (left, right) => left && right && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
const isBetween = (date, start, end) => date > start && date < end;
const fmtShort = (date) => `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
const fmtDay = (date) => DAYS[(date.getDay() + 6) % 7];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const cells = Array((first.getDay() + 6) % 7).fill(null);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  return cells;
}

export default function SetupScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [dest, setDest] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState({ ben: true, priya: true, marcus: true });
  const today = useMemo(() => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }, []);
  const [calMonth, setCalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const { setDest: saveDest, setDates, setLeader, startDate: savedStart, endDate: savedEnd, leader } = useAppState;
  const { preferenceProfiles, savePreferenceProfile } = useAppState;
  const preferenceId = profile?.id || profile?.username || "guest";
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => ({ ...EMPTY_PREFERENCES, ...preferenceProfiles?.[preferenceId], dietary: preferenceProfiles?.[preferenceId]?.dietary || [] }));
  const [localStart, setLocalStart] = useState(() => savedStart ? new Date(savedStart) : null);
  const [localEnd, setLocalEnd] = useState(() => savedEnd ? new Date(savedEnd) : null);
  const allMembers = useMemo(() => [{ k: "alice", n: profile?.username || "Alice", c: "#F19A6A", role: "Trip leader" }, ...FRIENDS], [profile?.username]);
  const grid = useMemo(() => buildMonthGrid(calMonth.getFullYear(), calMonth.getMonth()), [calMonth]);
  const startDate = localStart;
  const endDate = localEnd;
  const destLabel = dest.trim() || "Lisbon, Portugal";
  const dateSlug = startDate && endDate ? `${fmtShort(startDate).toLowerCase().replace(/\s+/g, "")}-${endDate.getDate()}` : "apr24-26";
  const link = `tripder.app/t/${destLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lisbon"}-${dateSlug}`;
  const scheduleDays = useMemo(() => {
    if (!startDate || !endDate) return [];
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) { days.push(new Date(current)); current.setDate(current.getDate() + 1); }
    return days;
  }, [startDate, endDate]);

  const handleDayClick = (date) => {
    if (date < today) return;
    if (!localStart || localEnd) { setLocalStart(date); setLocalEnd(null); setDates(null, null); }
    else if (date < localStart) { setLocalEnd(localStart); setLocalStart(date); setDates(date.toISOString(), localStart.toISOString()); }
    else { setLocalEnd(date); setDates(localStart.toISOString(), date.toISOString()); }
  };
  const clearDates = () => { setLocalStart(null); setLocalEnd(null); setDates(null, null); };
  const summary = () => !startDate ? "Pick your dates on the calendar" : !endDate ? `${fmtShort(startDate)} - pick an end date` : `${fmtShort(startDate)} to ${fmtShort(endDate)} - ${dayCount(startDate, endDate) - 1} night${dayCount(startDate, endDate) === 2 ? "" : "s"}`;
  const copyInvite = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { setCopied(false); }
  };
  const continueToSwipe = (skipped = false) => {
    savePreferenceProfile(preferenceId, { ...preferences, completed: !skipped, skipped });
    saveDest(dest.trim() || "Lisbon, Portugal");
    setPreferenceOpen(false);
    navigate("/swipe");
  };
  const toggleDietary = (option) => setPreferences((current) => { const dietary = current.dietary || []; if (option === "None") return { ...current, dietary: dietary.includes("None") ? [] : ["None"] }; return { ...current, dietary: [...dietary.filter((item) => item !== "None"), ...(dietary.includes(option) ? [] : [option])] }; });

  return (
    <section className="screen active screen-setup">
      {/* Top Title */}
      <div style={{ padding: "4px 4px 0" }}>
        <div className="eyebrow" style={{ color: "var(--muted)" }}>Trip Planning</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.03em" }}>
          Where to, crew?
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--muted)" }}>
          Set the destination, pick dates, and invite your travel companions.
        </p>
      </div>

      {/* 1. Destination Card */}
      <div className="bento-card" style={{ padding: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg)" }}>
          Destination
        </label>
        <input
          className="input"
          value={dest}
          onChange={(event) => setDest(event.target.value)}
          placeholder="Lisbon, Portugal"
          style={{ marginTop: 4, height: 48, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--fg)", padding: "0 14px", fontSize: 15 }}
        />
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Trip name and recommendations adapt to your destination
        </div>
      </div>

      {/* 2. Calendar / Dates Card */}
      <div className="bento-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg)" }}>
            Dates
          </label>
          {(startDate || endDate) && (
            <button
              onClick={clearDates}
              style={{ background: "none", border: "none", color: "var(--nom)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="cal-wrap" style={{ width: "100%", margin: "10px 0 4px" }}>
          <div className="cal-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, -1))} disabled={calMonth <= today} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--fg)", cursor: "pointer" }}>‹</button>
            <span className="cal-title" style={{ fontWeight: 700, fontSize: 14, color: "var(--fg)" }}>{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
            <button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--fg)", cursor: "pointer" }}>›</button>
          </div>
          <div className="cal-grid">
            {DAYS.map((day) => <div key={day} className="cal-head" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textAlign: "center" }}>{day}</div>)}
            {grid.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="cal-day empty" />;
              const past = date < today;
              const className = ["cal-day", past && "disabled", isSameDay(date, startDate) && "start", isSameDay(date, endDate) && "end", startDate && endDate && isBetween(date, startDate, endDate) && "in-range"].filter(Boolean).join(" ");
              return <button key={index} className={className} onClick={() => handleDayClick(date)} disabled={past}>{date.getDate()}</button>;
            })}
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "var(--bg)",
            borderRadius: 14,
            border: "1px solid var(--border)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--fg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => setScheduleOpen((open) => !open)}
        >
          <span>{summary()}</span>
          <span style={{ fontSize: 10, color: "var(--muted)" }}>{scheduleOpen ? "▲" : "▼"}</span>
        </div>

        {scheduleOpen && scheduleDays.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, padding: 12, background: "var(--bg)", borderRadius: 14 }}>
            {scheduleDays.map((date) => (
              <div key={date.toISOString()} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--fg)" }}>
                <span>{fmtShort(date)}</span>
                <span style={{ fontWeight: 600, color: "var(--muted)" }}>{fmtDay(date).toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Invite Friends Card */}
      <div className="bento-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg)" }}>
            Invite your crew
          </label>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Tap ★ for leader</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {allMembers.map((friend) => {
            const isSel = friend.k === "alice" || invited[friend.k];
            const isLead = leader === friend.k;
            return (
              <div
                key={friend.k}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: isSel ? "var(--bg)" : "transparent",
                  borderRadius: 16,
                  border: `1px solid ${isSel ? "var(--border)" : "transparent"}`,
                  cursor: friend.k !== "alice" ? "pointer" : "default",
                  transition: "all 0.15s ease",
                }}
                onClick={() => friend.k !== "alice" && setInvited((current) => ({ ...current, [friend.k]: !current[friend.k] }))}
              >
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: friend.c, color: "var(--surface)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
                  {friend.n.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
                    {friend.n} {friend.k === "alice" && <span style={{ fontSize: 10, background: "var(--fg)", color: "var(--surface)", padding: "2px 6px", borderRadius: 999, marginLeft: 4 }}>you</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{friend.role}</div>
                </div>

                {isLead && <Crown size={18} weight="fill" color="var(--accent)" title="Trip leader" />}
                {friend.k !== "alice" && (
                  <button
                    style={{ background: "none", border: "none", color: isLead ? "var(--accent)" : "var(--border)", cursor: "pointer", padding: 4 }}
                    title="Make trip leader"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLeader(friend.k);
                    }}
                  >
                    <Star size={16} weight={isLead ? "fill" : "regular"} />
                  </button>
                )}
                <span style={{ fontSize: 13, fontWeight: 700, color: isSel ? "var(--gerund)" : "var(--border)" }}>
                  {isSel ? "✓" : "○"}
                </span>
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-secondary btn-block"
          style={{ marginTop: 12 }}
          onClick={() => setInviteOpen((open) => !open)}
        >
          {copied ? "Link Copied to Clipboard!" : "Share Invite Link"}
        </button>

        {inviteOpen && (
          <div style={{ marginTop: 10, padding: 14, background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Anyone with this link lands directly in your trip.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" readOnly value={link} style={{ flex: 1, fontSize: 13, padding: "0 10px", height: 38, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)" }} />
              <button className="btn btn-primary" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }} onClick={copyInvite}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={() => setPreferenceOpen(true)}>
        Create trip & invite group →
      </button>

      <BottomSheet open={preferenceOpen} onClose={() => continueToSwipe(true)} className="preference-sheet">
        <PreferenceForm preferences={preferences} onChange={(key, value) => setPreferences((current) => ({ ...current, [key]: value }))} onDietaryToggle={toggleDietary} onSkip={() => continueToSwipe(true)} onSave={() => continueToSwipe(false)} />
      </BottomSheet>
    </section>
  );
}
