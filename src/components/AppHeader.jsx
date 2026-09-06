import { Link } from "react-router-dom";

export default function AppHeader({ trip, back, backLabel, invert, theme, toggleTheme }) {
  return (
    <header className={`appheader ${invert ? "invert" : ""}`}>
      <div className="hd-left">
        {back && (
          <Link to={back} className="hd-back">
            ‹ {backLabel || "Back"}
          </Link>
        )}
        <Link to="/hub" className="hd-mark">
          Trip<b>der</b>
        </Link>
        {trip && <span className="hd-trip">{trip}</span>}
      </div>

      <div className="hd-right" style={{ zIndex: 10, position: "relative" }}>
        {toggleTheme && (
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{ cursor: "pointer", pointerEvents: "auto" }}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        )}
      </div>
    </header>
  );
}