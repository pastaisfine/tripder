import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Crown, Star } from "phosphor-react";
import { useAuth } from "../context/useAuth";
import { dayCount } from "../utils/date";
import BottomSheet from "../components/BottomSheet";
import PreferenceForm, { EMPTY_PREFERENCES } from "../components/PreferenceForm";
import { createOrUpdateTrip, getTripMembers, getUserLatestTrip } from "../services/tripService";
import { supabase } from "../lib/supabase";

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
  const location = useLocation();
  const { profile, session, savePreferences } = useAuth();
  const {
    dest: savedDest,
    setDest: saveDest,
    setDates,
    setLeader,
    startDate: savedStart,
    endDate: savedEnd,
    leader,
    tripId,
    setTripId,
    tripMembers,
    setTripMembers,
    preferenceProfiles,
    savePreferenceProfile,
  } = useAppState;

  const [dest, setDest] = useState(savedDest || "");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const today = useMemo(() => { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }, []);
  const [calMonth, setCalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const preferenceId = profile?.id || profile?.username || "guest";
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => ({
    ...EMPTY_PREFERENCES,
    ...preferenceProfiles?.[preferenceId],
    dietary: preferenceProfiles?.[preferenceId]?.dietary || [],
  }));
  const [localStart, setLocalStart] = useState(() => savedStart ? new Date(savedStart) : null);
  const [localEnd, setLocalEnd] = useState(() => savedEnd ? new Date(savedEnd) : null);

  // Initialize trip ID from location state or app state, guaranteed non-null UUID
  const [currentTripId, setCurrentTripId] = useState(() => {
    return location.state?.tripId || tripId || crypto.randomUUID();
  });

  // Keep appState in sync with currentTripId
  useEffect(() => {
    if (currentTripId && tripId !== currentTripId) {
      setTripId(currentTripId);
    }
  }, [currentTripId, tripId, setTripId]);

  // Load user's latest trip or ensure current trip is persisted in Supabase
  useEffect(() => {
    let mounted = true;
    const userId = session?.user?.id;
    if (!userId) return;

    async function initTrip() {
      // If we don't have a specific trip passed from location, see if the user already has one in DB
      if (!location.state?.tripId && !tripId) {
        const latest = await getUserLatestTrip(userId);
        if (latest?.id && mounted) {
          setCurrentTripId(latest.id);
          setTripId(latest.id);
          if (latest.destination) {
            setDest(latest.destination);
            saveDest(latest.destination);
          }
          if (latest.start_date && latest.end_date) {
            setLocalStart(new Date(latest.start_date));
            setLocalEnd(new Date(latest.end_date));
            setDates(latest.start_date, latest.end_date);
          }
          return;
        }
      }

      // Save/persist the trip row in Supabase
      try {
        await createOrUpdateTrip({
          tripId: currentTripId,
          destination: dest.trim() || "Lisbon, Portugal",
          startDate: localStart,
          endDate: localEnd,
          leaderId: userId,
        });
      } catch (err) {
        console.warn("Trip init error:", err);
      }
    }

    initTrip();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id, currentTripId, location.state?.tripId, tripId, setTripId, dest, localStart, localEnd, saveDest, setDates]);

  // Load members whenever currentTripId changes
  useEffect(() => {
    if (currentTripId) {
      getTripMembers(currentTripId)
        .then((members) => {
          if (members?.length > 0) {
            setTripMembers(members);
          }
        })
        .catch(console.warn);
    }
  }, [currentTripId, setTripMembers]);

  // Realtime subscription: live updates when friends join or trip changes
  useEffect(() => {
    if (!currentTripId) return;

    const channel = supabase
      .channel(`setup-trip-realtime-${currentTripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trip_members",
          filter: `trip_id=eq.${currentTripId}`,
        },
        async () => {
          const members = await getTripMembers(currentTripId);
          if (members) setTripMembers(members);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${currentTripId}`,
        },
        (payload) => {
          if (payload.new) {
            if (payload.new.destination && payload.new.destination !== dest) {
              setDest(payload.new.destination);
              saveDest(payload.new.destination);
            }
            if (payload.new.start_date && payload.new.end_date) {
              const s = new Date(payload.new.start_date);
              const e = new Date(payload.new.end_date);
              setLocalStart(s);
              setLocalEnd(e);
              setDates(payload.new.start_date, payload.new.end_date);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTripId, dest, saveDest, setDates, setTripMembers]);

  // Real crew members only
  const allMembers = useMemo(() => {
    if (tripMembers && tripMembers.length > 0) {
      return tripMembers.map((m) => ({
        k: m.userId,
        n: m.username,
        c: m.avatarColor || "#F19A6A",
        role: m.role === "leader" ? "Trip leader" : "Crew member",
      }));
    }
    return [
      {
        k: profile?.id || "guest",
        n: profile?.username || "You",
        c: profile?.avatarColor || "#F19A6A",
        role: "Trip leader",
      },
    ];
  }, [tripMembers, profile]);

  const grid = useMemo(() => buildMonthGrid(calMonth.getFullYear(), calMonth.getMonth()), [calMonth]);
  const startDate = localStart;
  const endDate = localEnd;

  // Real shareable link pointing to the join endpoint with unique trip ID
  const shareLink = `${window.location.origin}/join/${currentTripId}`;

  const scheduleDays = useMemo(() => {
    if (!startDate || !endDate) return [];
    const days = [];
    const current = new Date(startDate);
    while (current <= endDate) { days.push(new Date(current)); current.setDate(current.getDate() + 1); }
    return days;
  }, [startDate, endDate]);

  const saveTripUpdates = useCallback(
    async (override = {}) => {
      if (!session?.user?.id) return currentTripId;
      try {
        const trip = await createOrUpdateTrip({
          tripId: currentTripId,
          destination: (override.dest ?? dest).trim() || "Lisbon, Portugal",
          startDate: override.start ?? localStart,
          endDate: override.end ?? localEnd,
          leaderId: session.user.id,
        });
        if (trip?.id) {
          if (!currentTripId) {
            setCurrentTripId(trip.id);
            setTripId(trip.id);
          }
          return trip.id;
        }
      } catch (err) {
        console.warn("Error saving trip updates:", err);
      }
      return currentTripId;
    },
    [session, currentTripId, dest, localStart, localEnd, setTripId]
  );

  const handleDayClick = (date) => {
    if (date < today) return;
    if (!localStart || localEnd) {
      setLocalStart(date);
      setLocalEnd(null);
      setDates(null, null);
    } else if (date < localStart) {
      setLocalEnd(localStart);
      setLocalStart(date);
      setDates(date.toISOString(), localStart.toISOString());
      saveTripUpdates({ start: date, end: localStart });
    } else {
      setLocalEnd(date);
      setDates(localStart.toISOString(), date.toISOString());
      saveTripUpdates({ start: localStart, end: date });
    }
  };

  const clearDates = () => {
    setLocalStart(null);
    setLocalEnd(null);
    setDates(null, null);
    saveTripUpdates({ start: null, end: null });
  };

  const summary = () => !startDate ? "Pick your dates on the calendar" : !endDate ? `${fmtShort(startDate)} - pick an end date` : `${fmtShort(startDate)} to ${fmtShort(endDate)} - ${dayCount(startDate, endDate) - 1} night${dayCount(startDate, endDate) === 2 ? "" : "s"}`;

  const copyInvite = async () => {
    if (session?.user?.id) {
      await saveTripUpdates();
    }
    const finalLink = `${window.location.origin}/join/${currentTripId}`;
    try {
      await navigator.clipboard.writeText(finalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const continueToSwipe = async (skipped = false) => {
    const prefs = { ...preferences, completed: !skipped, skipped };
    savePreferenceProfile(preferenceId, prefs);

    if (session) {
      try { await savePreferences(prefs); } catch (e) { console.warn("DB preference save failed:", e); }
      await saveTripUpdates();
    }

    saveDest(dest.trim() || "Lisbon, Portugal");
    setPreferenceOpen(false);
    navigate("/swipe");
  };

  const toggleDietary = (option) => setPreferences((current) => {
    const dietary = current.dietary || [];
    if (option === "None") return { ...current, dietary: dietary.includes("None") ? [] : ["None"] };
    return { ...current, dietary: [...dietary.filter((item) => item !== "None"), ...(dietary.includes(option) ? [] : [option])] };
  });

  return (
    <section className="screen active screen-setup">
      <div className="setup-head"><div><div className="eyebrow">New trip</div></div></div>
      <div className="setup-hero"><div className="cap"><span className="c">Where to, crew?</span><span className="m">Lisbon · SE Europe</span></div></div>
      <div className="field">
        <label>Destination</label>
        <input
          className="input"
          value={dest}
          onChange={(event) => setDest(event.target.value)}
          onBlur={() => saveTripUpdates()}
          placeholder="Lisbon, Portugal"
        />
        <div className="hint">Trip name auto-fills from your destination</div>
      </div>
      <div className="field">
        <label>When</label>
        <div className="cal-wrap" style={{ zoom: 1.5, margin: "0 auto" }}>
          <div className="cal-nav">
            <button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, -1))} disabled={calMonth <= today}>‹</button>
            <span className="cal-title">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
            <button className="cal-navbtn" onClick={() => setCalMonth(addMonths(calMonth, 1))}>›</button>
          </div>
          <div className="cal-grid">
            {DAYS.map((day) => <div key={day} className="cal-head">{day}</div>)}
            {grid.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="cal-day empty" />;
              const past = date < today;
              const className = ["cal-day", past && "disabled", isSameDay(date, startDate) && "start", isSameDay(date, endDate) && "end", startDate && endDate && isBetween(date, startDate, endDate) && "in-range"].filter(Boolean).join(" ");
              return <button key={index} className={className} onClick={() => handleDayClick(date)} disabled={past}>{date.getDate()}</button>;
            })}
          </div>
        </div>
        {(startDate || endDate) && <button className="cal-clear" onClick={clearDates}>Clear dates</button>}
        <div className="datesummary" onClick={() => setScheduleOpen((open) => !open)}>{summary()}<span className="caret">▾</span></div>
        {scheduleOpen && (
          <div className="dateschedule" style={{ display: "block" }}>
            <div className="dateschedule-head"><span>Schedule</span><span>{scheduleDays.length} day{scheduleDays.length === 1 ? "" : "s"}</span></div>
            <div className="dateschedule-list">
              {scheduleDays.map((date) => (
                <div key={date.toISOString()} className="dsrow">
                  <span className="ds-d">{fmtShort(date)}</span>
                  <span className="ds-m">{fmtDay(date).toUpperCase()}</span>
                </div>
              ))}
              {scheduleDays.length === 0 && <div className="dsempty">No dates selected</div>}
            </div>
          </div>
        )}
      </div>

      <div className="field">
        <label>Trip crew ({allMembers.length})</label>
        <div className="friends">
          {allMembers.map((friend) => {
            const isMe = friend.k === (profile?.id || "guest");
            return (
              <div
                key={friend.k}
                className={`friendrow sel ${leader === friend.k ? "is-leader" : ""}`}
              >
                <div className="avatar sm" style={{ background: friend.c }}>
                  {friend.n.slice(0, 2)}
                </div>
                <div>
                  <div className="fname">
                    {friend.n}
                    {isMe && <span className="you-tag">you</span>}
                  </div>
                  <div className="frole">{friend.role}</div>
                </div>
                {leader === friend.k && <Crown className="leader-badge" size={18} weight="fill" title="Trip leader" />}
                {!isMe && (
                  <button
                    className="leader-xfer"
                    title="Make trip leader"
                    onClick={(event) => { event.stopPropagation(); setLeader(friend.k); }}
                  >
                    <Star size={14} weight="fill" />
                  </button>
                )}
                <span className="fcheck">✓</span>
              </div>
            );
          })}
        </div>
        {allMembers.length <= 1 ? (
          <div className="hint" style={{ marginTop: 8 }}>
            You're the only member right now. Share the invite link below to bring your friends in!
          </div>
        ) : (
          <div className="hint">Tap ★ to pass the leader role</div>
        )}
      </div>

      <button className="invite-btn" onClick={() => setInviteOpen((open) => !open)}>
        <span className="plus">+</span> Copy invite link
      </button>

      {inviteOpen && (
        <div className="invitebox">
          <div className="invitebox-title">Invite your crew</div>
          <div className="invitebox-desc">Share this link — friends will land on this trip and join your travel workspace.</div>
          <div className="invitebox-copy">
            <input className="input" readOnly value={shareLink} />
            <button className="btn btn-secondary" style={{ minHeight: 44 }} onClick={copyInvite}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}

      <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={() => setPreferenceOpen(true)}>
        Create trip & invite group
      </button>

      <BottomSheet open={preferenceOpen} onClose={() => continueToSwipe(true)} className="preference-sheet">
        <PreferenceForm
          preferences={preferences}
          onChange={(key, value) => setPreferences((current) => ({ ...current, [key]: value }))}
          onDietaryToggle={toggleDietary}
          onSkip={() => continueToSwipe(true)}
          onSave={() => continueToSwipe(false)}
        />
      </BottomSheet>
    </section>
  );
}
