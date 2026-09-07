import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getTrip, getTripMembers, joinTrip } from "../services/tripService";
import { fmtDateRange } from "../utils/date";

export default function JoinTripScreen({ useAppState }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { syncTrip } = useAppState;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function handleJoin() {
      if (!tripId || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch trip info first
        const tripData = await getTrip(tripId);
        if (!tripData) {
          if (mounted) {
            setError("This trip link is invalid or may have expired.");
            setLoading(false);
          }
          return;
        }

        // Join trip as user
        const { trip: joinedTrip, members: updatedMembers } = await joinTrip({
          tripId,
          userId: user.id,
        });

        if (mounted) {
          setTrip(joinedTrip || tripData);
          setMembers(updatedMembers || []);
          setJoined(true);
          // Sync into global app state
          syncTrip(joinedTrip || tripData, updatedMembers || []);
        }
      } catch (err) {
        console.error("Error joining trip:", err);
        if (mounted) {
          // Fallback: try reading the trip info even if join had an error (e.g. RLS)
          const fallbackTrip = await getTrip(tripId).catch(() => null);
          const fallbackMembers = await getTripMembers(tripId).catch(() => []);
          if (fallbackTrip) {
            setTrip(fallbackTrip);
            setMembers(fallbackMembers);
            syncTrip(fallbackTrip, fallbackMembers);
            setJoined(true);
          } else {
            setError(err.message || "Failed to join trip. Please check your connection.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    handleJoin();

    return () => {
      mounted = false;
    };
  }, [tripId, user?.id, syncTrip]);

  const dateRange = trip ? fmtDateRange(trip.start_date, trip.end_date) : "";

  if (loading) {
    return (
      <section className="screen active" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Joining trip…
        </div>
      </section>
    );
  }

  if (error || !trip) {
    return (
      <section className="screen active" style={{ padding: "var(--screen-pad)" }}>
        <div className="bento-card" style={{ padding: "var(--card-pad)", textAlign: "center", marginTop: 40 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Unable to find trip</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
            {error || "The trip link might be invalid or no longer exists."}
          </p>
          <button className="btn btn-primary btn-block" onClick={() => navigate("/setup")}>
            Create your own trip
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen active screen-setup">
      <div className="setup-head">
        <div>
          <div className="eyebrow">Trip invitation</div>
        </div>
      </div>
      <div className="setup-hero">
        <div className="cap">
          <span className="c">You're in!</span>
          <span className="m">{trip.destination}</span>
        </div>
      </div>

      <div className="bento-card" style={{ padding: "var(--card-pad)", marginBottom: 16 }}>
        <div className="bx-title">{trip.destination}</div>
        <div className="bx-sub" style={{ marginTop: 2, marginBottom: 12 }}>
          {dateRange ? `Scheduled for ${dateRange}` : "Dates to be decided with group"}
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label>Trip crew ({members.length})</label>
          <div className="friends">
            {members.map((member) => (
              <div key={member.userId} className="friendrow sel">
                <div className="avatar sm" style={{ background: member.avatarColor }}>
                  {member.username.slice(0, 2)}
                </div>
                <div>
                  <div className="fname">
                    {member.username}
                    {member.userId === user?.id && <span className="you-tag">you</span>}
                  </div>
                  <div className="frole">{member.role === "leader" ? "Trip leader" : "Crew"}</div>
                </div>
                <span className="fcheck">✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => navigate("/setup")}>
        Go to Trip Setup →
      </button>
      <button
        className="btn btn-secondary btn-block"
        style={{ marginTop: 8 }}
        onClick={() => navigate("/swipe")}
      >
        Start Swiping for this Trip
      </button>
      <button
        className="btn btn-secondary btn-block"
        style={{ marginTop: 8 }}
        onClick={() => navigate("/hub")}
      >
        Go to Trip Hub
      </button>
    </section>
  );
}
