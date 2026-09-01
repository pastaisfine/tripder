import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();
  return (
    <section className="screen active screen-splash">
      <div className="splash-photo">
        <img src="/images/lisbon-rooftops.jpg" alt="Lisbon rooftops" />
      </div>
      <div className="splash-content">
        <div className="splash-in">
          <div className="splash-mark">
            Where<b>Do</b>
          </div>
          <div className="splash-mono">A group trip, actually decided</div>
        </div>
        <div className="splash-cta">
          <h1 className="splash-title" style={{ color: "#fff" }}>
            The group trip that everyone says yes to
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: "100%",
              maxWidth: 320,
              margin: "0 auto",
            }}
          >
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate("/setup")}
            >
              Start a trip
            </button>
            <div className="note" style={{ color: "rgba(255,255,255,.85)" }}>
              Free · no account needed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
