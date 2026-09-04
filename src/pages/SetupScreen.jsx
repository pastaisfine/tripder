import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Star } from "phosphor-react";
import { FRIENDS } from "../data/members";
import { dayCount } from "../utils/date";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function isSameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isBetween(d, start, end) { return d > start && d < end; }
function fmtShort(d) { return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`; }
function fmtDay(d) { return DAYS[(d.getDay() + 6) % 7]; }

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

const ALL_MEMBERS = [
  { k: "alice", n: "Alice", c: "#F19A6A", role: "Trip leader" },
  ...FRIENDS,
];

export default function SetupScreen({ useAppState }) {
  const navigate = useNavigate();
  const [dest, setDestState] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState({ ben: true, priya: true, marcus: true });

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [calMonth, setCalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const { setDest, setDates, setLeader, startDate: savedStart, endDate: savedEnd, leader } = useAppState;

  const [localStart, setLocalStart] = useState(() => savedStart ? new Date(savedStart) : null);
  const [localEnd, setLocalEnd] = useState(() => savedEnd ? new Date(savedEnd) : null);

  const startDate = localStart;
  const endDate = localEnd;

  const grid = useMemo(() => buildMonthGrid(calMonth.getFullYear(), calMonth.getMonth()), [calMonth]);

  const destLabel = dest.trim() || "Lisbon, Portugal";
  const dateSlug = startDate && endDate
    ? `${fmtShort(startDate).toLowerCase().replace(/\s+/g,"")}-${endDate.getDate()}`
    : "apr24-26";
  const link = `tripder.app/t/${destLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lisbon"}-${dateSlug}`;

  const handleDayClick = (d) => {
    if (d < today) return;
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(d);
      setLocalEnd(null);
      setDates(null, null);
    } else if (d < localStart) {
      setLocalEnd(localStart);
      setLocalStart(d);
      setDates(d.toISOString(), localStart.toISOString());
    } else {
      setLocalEnd(d);
      setDates(localStart.toISOString(), d.toISOString());
    }
  };

  const clearDates = () => {
    setLocalStart(null);
    setLocalEnd(null);
    setDates(null, null);
  };

  const inRange = (d) => startDate && endDate && isBetween(d, startDate, endDate);
  const isStart = (d) => startDate && isSameDay(d, startDate);
  const isEnd = (d) => endDate && isSameDay(d, endDate);
  const isPickingEnd = startDate && !endDate;

  const summary = () => {
    if (!startDate) return "Pick your dates on the calendar";
    if (!endDate) return `${fmtShort(startDate)} — pick an end date`;
    const nights = dayCount(startDate, endDate) - 1;
    return `${fmtShort(startDate)} → ${fmtShort(endDate)} · ${nights} ${nights === 1 ? "night" : "nights"}`;
  };

  const scheduleDays = useMemo(() => {
    if (!startDate || !endDate) return [];
    const days = [];
    const end = new Date(endDate);
    const cur = new Date(startDate);
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

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
    <section className="screen active screen-setup">
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
          <div className="cal-wrap">
            <div className="cal-nav">
              <button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, -1))} disabled={calMonth <= today}>
                ‹
              </button>
              <span className="cal-title">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
              <button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, 1))}>
                ›
              </button>
            </div>
            <div className="cal-grid">
              {DAYS.map((d) => (
                <div key={d} className="cal-head">{d}</div>
              ))}
              {grid.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="cal-day empty" />;
                const past = d < today;
                const cls = [
                  "cal-day",
                  past && "disabled",
                  isStart(d) && "start",
                  isEnd(d) && "end",
                  inRange(d) && "in-range",
                  isPickingEnd && !past && isSameDay(d, startDate) && "start",
                ].filter(Boolean).join(" ");
                return (
                  <button key={i} className={cls} onClick={() => handleDayClick(d)} disabled={past}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          {(startDate || endDate) && (
            <button className="cal-clear" onClick={clearDates}>Clear dates</button>
          )}
          <div className="datesummary" onClick={() => setScheduleOpen((v) => !v)}>
            {summary()}
            <span className="caret">▾</span>
          </div>
          {scheduleOpen && (
            <div className="dateschedule" style={{ display: "block" }}>
              <div className="dateschedule-head">
                <span>Schedule</span>
                <span>{scheduleDays.length} day{scheduleDays.length === 1 ? "" : "s"}</span>
              </div>
              <div className="dateschedule-list">
                {scheduleDays.map((d) => (
                  <div key={d.toISOString()} className="dsrow">
                    <span className="ds-d">{fmtShort(d)}</span>
                    <span className="ds-m">{fmtDay(d).toUpperCase()}</span>
                  </div>
                ))}
                {scheduleDays.length === 0 && <div className="dsempty">No dates selected</div>}
              </div>
            </div>
          )}
        </div>

        <div className="field">
          <label>Invite your crew</label>
          <div className="friends">
            {ALL_MEMBERS.map((f) => (
              <div
                key={f.k}
                className={`friendrow ${f.k === "alice" || invited[f.k] ? "sel" : ""} ${leader === f.k ? "is-leader" : ""}`}
                onClick={() => {
                  if (f.k === "alice") return;
                  setInvited((prev) => ({ ...prev, [f.k]: !prev[f.k] }));
                }}
              >
                <div className="avatar sm" style={{ background: f.c }}>{f.n.slice(0, 2)}</div>
                <div>
                  <div className="fname">
                    {f.n}
                    {f.k === "alice" && <span className="you-tag">you</span>}
                  </div>
                  <div className="frole">{f.role}</div>
                </div>
                {leader === f.k && <Crown className="leader-badge" size={18} weight="fill" title="Trip leader" />}
                {f.k !== "alice" && (
                  <button
                    className="leader-xfer"
                    title="Make trip leader"
                    onClick={(e) => { e.stopPropagation(); setLeader(f.k); }}
                  >
                    <Star size={14} weight="fill" />
                  </button>
                )}
                <span className="fcheck">✓</span>
              </div>
            ))}
          </div>
          <div className="hint">Tap ★ to pass the leader role</div>
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
