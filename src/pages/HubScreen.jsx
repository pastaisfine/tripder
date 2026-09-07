import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ProgressBar from "../components/ProgressBar";
import InfiniteSpiral from "../components/InfiniteSpiral";
import { fmtDateRange, dayCount } from "../utils/date";
import { getTripMembers } from "../services/tripService";

export default function HubScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    likes,
    skips,
    reasonCount,
    styleSeen,
    styleName,
    dest,
    startDate,
    endDate,
    activeStops,
    tripId,
    tripMembers,
    setTripMembers,
  } = useAppState;

  useEffect(() => {
    if (tripId) {
      getTripMembers(tripId).then((m) => {
        if (m?.length > 0) setTripMembers(m);
      }).catch(console.warn);
    }
  }, [tripId, setTripMembers]);

  const mineDone = likes + skips > 0;
  const dateRange = fmtDateRange(startDate, endDate);
  const days = startDate && endDate ? dayCount(startDate, endDate) : 3;
  const spiralItems = useMemo(
    () => activeStops.map((stop) => ({ id: stop.id, src: stop.img, alt: stop.name })),
    [activeStops],
  );

  const members = useMemo(() => {
    if (tripMembers && tripMembers.length > 0) {
      return tripMembers.map((m) => {
        const isUser = m.userId === profile?.id;
        const finished = isUser ? mineDone : false;
        return {
          k: m.userId,
          n: m.username,
          c: m.avatarColor || "#F19A6A",
          done: finished,
          st: finished ? "done" : isUser ? "you" : "swiping",
          style: isUser ? styleName : "",
        };
      });
    }

    return [
      {
        k: profile?.id || "you",
        n: profile?.username || "You",
        c: profile?.avatarColor || "#F19A6A",
        done: mineDone,
        st: mineDone ? "done" : "you",
        style: styleName || "",
      },
    ];
  }, [tripMembers, profile, mineDone, styleName]);

  const doneCount = members.filter((m) => m.done).length;
  const totalCount = members.length;

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
            <div className="meta">{days} days · {totalCount} {totalCount === 1 ? "friend" : "friends"}</div>
          </div>
        </div>
        <div className="hub-body">
          <section className="section-card bento-card" style={{ padding: "var(--card-pad)" }}>
            <h3>Who's swiped</h3>
            <div className="memberlist">
              {members.map((m) => {
                const isUser = m.k === (profile?.id || "you");
                const memberName = isUser ? (profile?.username || m.n) : m.n;
                const finished = m.done;
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
            <ProgressBar value={Math.round((doneCount / totalCount) * 100)} />
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {doneCount} of {totalCount} swiped — the reveal unlocks when the last person finishes
            </div>
          </section>

          <section className="you-card section-card bento-card" style={{ padding: "var(--card-pad)" }}>
            <h3>{mineDone ? "You're in" : "Your turn"}</h3>
            <div className="card-sub" style={{ marginTop: 4 }}>
              {mineDone
                ? `${likes} liked, ${skips} skipped, ${reasonCount} reasons logged.${totalCount > 1 ? " Waiting for other crew members to finish swiping." : " Share your invite link to let friends vote!"}`
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
