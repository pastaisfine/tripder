import { useNavigate } from "react-router-dom";
import { MEMBERS } from "../data/members";
import ProgressBar from "../components/ProgressBar";

export default function HubScreen({ useAppState }) {
  const navigate = useNavigate();
  const { likes, skips, reasonCount, styleSeen, styleName, dest } = useAppState;

  const mineDone = likes + skips > 0;
  const doneCount = 3 + (mineDone ? 1 : 0);

  return (
    <section className="screen active" style={{ paddingTop: "var(--sb)" }}>
        <div className="hub-hero">
          <div className="scrim-top" />
          <img src="/images/lisbon-rooftops.jpg" alt="Lisbon" />
          <div className="veil" />
          <div className="hh">
            <div className="dest">{dest || "Lisbon, Portugal"} — Apr 24-26</div>
            <div className="meta">3 days · 4 friends</div>
          </div>
        </div>
        <div className="hub-body">
          <section className="section-card bento-card" style={{ padding: "var(--card-pad)" }}>
            <h3>Who's swiped</h3>
            <div className="memberlist">
              {MEMBERS.map((m) => {
                const finished = m.done || (m.k === "alice" && mineDone);
                return (
                  <div key={m.k} className="mem" title={finished ? m.style || styleName : "not swiped yet"}>
                    <div className={`avatar ${finished ? "done" : ""}`} style={{ background: m.c }}>
                      {m.n.slice(0, 1)}
                    </div>
                    <span className="nm">{m.n}</span>
                    <span className="st">{finished ? "swiped" : "swiping"}</span>
                  </div>
                );
              })}
            </div>
            <ProgressBar value={Math.round((doneCount / 4) * 100)} />
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {doneCount} of 4 swiped — the reveal unlocks when the last person finishes
            </div>
          </section>

          <section className="you-card section-card bento-card" style={{ padding: "var(--card-pad)" }}>
            <h3>{mineDone ? "You're in" : "Your turn"}</h3>
            <div className="card-sub" style={{ marginTop: 4 }}>
              {mineDone
                ? `${likes} liked, ${skips} skipped, ${reasonCount} reasons logged. Ben, Priya and Marcus are already locked in.`
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
