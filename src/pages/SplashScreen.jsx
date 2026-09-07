import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  return (
    <section className="screen active screen-splash">
      <div className="splash-photo">
        <img src="/images/alfama.jpg" alt="Lisbon rooftops" />
      </div>
      <div className="splash-content">
        <div className="splash-in">
          <div className="splash-mark">
            Trip<b>der</b>
          </div>
          <div className="splash-mono">A group trip, actually decided</div>
        </div>
        <div className="splash-cta">
          <div className="glass">
            <h1 className="splash-title" style={{ color: "#fff", margin: "0 0 10px" }}>
              The group trip that everyone says yes to
            </h1>
            <p className="splash-copy" style={{ color: "rgba(255,255,255,.9)", marginBottom: 18 }}>
              Everyone swipes. Everyone says why. One itinerary nobody has to be talked into.
            </p>
            <button
              className="btn btn-coral btn-block"
              onClick={() => {
                if (!user) {
                  navigate("/login", { state: { returnTo: "/setup", action: "create_trip" } });
                } else {
                  navigate("/setup", { state: { action: "create_trip" } });
                }
              }}
            >
              Create trip
            </button>
            <div className="note" style={{ color: "rgba(255,255,255,.85)", marginTop: 12 }}>
              {user ? (
                <span>
                  Signed in as <b>{profile?.username || user.email}</b> ·{" "}
                  <Link to="/profile" style={{ color: "#fff", textDecoration: "underline" }}>
                    Profile
                  </Link>
                </span>
              ) : (
                <span>

                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
