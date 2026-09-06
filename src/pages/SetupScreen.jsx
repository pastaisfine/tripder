import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Star } from "phosphor-react";
import { useAuth } from "../context/useAuth";
import { FRIENDS } from "../data/members";
import { dayCount } from "../utils/date";

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

  return (
    <section className="screen active screen-setup">
      <div className="setup-head"><div><div className="eyebrow">New trip</div></div></div>
      <div className="setup-hero"><div className="cap"><span className="c">Where to, crew?</span><span className="m">Lisbon · SE Europe</span></div></div>
      <div className="field"><label>Destination</label><input className="input" value={dest} onChange={(event) => setDest(event.target.value)} placeholder="Lisbon, Portugal" /><div className="hint">Trip name auto-fills from your destination</div></div>
      <div className="field">
        <label>When</label>
        <div className="cal-wrap"><div className="cal-nav"><button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, -1))} disabled={calMonth <= today}>‹</button><span className="cal-title">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span><button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, 1))}>›</button></div>
          <div className="cal-grid">{DAYS.map((day) => <div key={day} className="cal-head">{day}</div>)}{grid.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="cal-day empty" />;
            const past = date < today;
            const className = ["cal-day", past && "disabled", isSameDay(date, startDate) && "start", isSameDay(date, endDate) && "end", startDate && endDate && isBetween(date, startDate, endDate) && "in-range"].filter(Boolean).join(" ");
            return <button key={index} className={className} onClick={() => handleDayClick(date)} disabled={past}>{date.getDate()}</button>;
          })}</div>
        </div>
        {(startDate || endDate) && <button className="cal-clear" onClick={clearDates}>Clear dates</button>}
        <div className="datesummary" onClick={() => setScheduleOpen((open) => !open)}>{summary()}<span className="caret">▾</span></div>
        {scheduleOpen && <div className="dateschedule" style={{ display: "block" }}><div className="dateschedule-head"><span>Schedule</span><span>{scheduleDays.length} day{scheduleDays.length === 1 ? "" : "s"}</span></div><div className="dateschedule-list">{scheduleDays.map((date) => <div key={date.toISOString()} className="dsrow"><span className="ds-d">{fmtShort(date)}</span><span className="ds-m">{fmtDay(date).toUpperCase()}</span></div>)}{scheduleDays.length === 0 && <div className="dsempty">No dates selected</div>}</div></div>}
      </div>
      <div className="field"><label>Invite your crew</label><div className="friends">{allMembers.map((friend) => <div key={friend.k} className={`friendrow ${friend.k === "alice" || invited[friend.k] ? "sel" : ""} ${leader === friend.k ? "is-leader" : ""}`} onClick={() => friend.k !== "alice" && setInvited((current) => ({ ...current, [friend.k]: !current[friend.k] }))}><div className="avatar sm" style={{ background: friend.c }}>{friend.n.slice(0, 2)}</div><div><div className="fname">{friend.n}{friend.k === "alice" && <span className="you-tag">you</span>}</div><div className="frole">{friend.role}</div></div>{leader === friend.k && <Crown className="leader-badge" size={18} weight="fill" title="Trip leader" />}{friend.k !== "alice" && <button className="leader-xfer" title="Make trip leader" onClick={(event) => { event.stopPropagation(); setLeader(friend.k); }}><Star size={14} weight="fill" /></button>}<span className="fcheck">✓</span></div>)}</div><div className="hint">Tap ★ to pass the leader role</div></div>
      <button className="invite-btn" onClick={() => setInviteOpen((open) => !open)}><span className="plus">+</span> Copy invite link</button>
      {inviteOpen && <div className="invitebox"><div className="invitebox-title">Invite the group</div><div className="invitebox-desc">Share this link - they'll land straight on the swipe screen.</div><div className="invitebox-copy"><input className="input" readOnly value={link} /><button className="btn btn-secondary" style={{ minHeight: 44 }} onClick={copyInvite}>{copied ? "Copied" : "Copy link"}</button></div></div>}
      <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={() => { saveDest(dest.trim() || "Lisbon, Portugal"); navigate("/swipe"); }}>Create trip & invite group</button>
    </section>
  );
}
