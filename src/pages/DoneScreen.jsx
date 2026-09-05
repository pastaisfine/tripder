import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function DoneScreen({ useAppState }) {
  const navigate = useNavigate();
  const { likes, skips, reasonCount } = useAppState;
  const { profile } = useAuth();
  const userName = profile?.username || "Alice";

  return (
    <section className="screen active">
        <div className="done-wrap">
          <div className="bigcount">Done · {userName}</div>
          <h1 className="splash-title small" style={{ marginTop: 0 }}>
            You're done, {userName}.
          </h1>
          <p className="splash-copy" style={{ maxWidth: "34ch" }}>
            {likes} likes, {skips} skips and every reason is now a weighted signal — not just a tick box.
          </p>

          <div className="statrow bento">
            <div className="bento-card">
              <div className="statcell">
                <div className="n ok">{likes}</div>
                <div className="l">Liked</div>
              </div>
            </div>
            <div className="bento-card">
              <div className="statcell">
                <div className="n no">{skips}</div>
                <div className="l">Skipped</div>
              </div>
            </div>
            <div className="bento-card">
              <div className="statcell">
                <div className="n">{reasonCount}</div>
                <div className="l">Reasons</div>
              </div>
            </div>
          </div>

          <div className="bento-card" style={{ padding: "var(--card-pad)" }}>
            <div className="bx-title">The AI preference profile</div>
            <div className="bx-sub" style={{ marginTop: 6 }}>
              Your swipes train a private model of your taste. When everyone's in,
              Tripder merges the profiles and builds a day that keeps everyone above 75% happy.
            </div>
          </div>

          <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => navigate("/style")}>
            Reveal my travel style →
          </button>
        </div>
      </section>
  );
}