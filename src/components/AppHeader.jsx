import { Link } from "react-router-dom";

export default function AppHeader({ trip, back, backLabel, invert }) {
  return (
    <header className={`appheader ${invert ? "invert" : ""}`}>
      {back && (
        <Link to={back} className="hd-back">
          ‹ {backLabel || "Back"}
        </Link>
      )}
      <Link to="/hub" className="hd-mark">
        Trip<b>der</b>
      </Link>
      {trip && <span className="hd-trip">{trip}</span>}
    </header>
  );
}