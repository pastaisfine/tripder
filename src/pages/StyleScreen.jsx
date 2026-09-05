import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { computeStyle } from "../data/styles";
import StyleCard from "../components/StyleCard";

export default function StyleScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userName = profile?.username || "Alice";
  const { likes, skips, reasonCount, tagged, markStyleSeen } = useAppState;

  const style = useMemo(
    () => computeStyle(tagged, likes, skips, reasonCount),
    [likes, skips, reasonCount, tagged],
  );

  useEffect(() => {
    markStyleSeen(style.name);
  }, [style.name, markStyleSeen]);

  const others = [
    { n: "Ben", t: "Slow-Morning Locavore" },
    { n: "Priya", t: "Curious Culture Collector" },
    { n: "Marcus", t: "Night-Optimist" },
  ];

  return (

      <section className="screen active">
        <div className="done-wrap">
          <div className="bigcount">Style · {userName}</div>
          <StyleCard style={style} userName={userName} />

          <div className="bento-card" style={{ padding: "var(--card-pad)" }}>
            <div className="bx-title">Everyone else in the group</div>
            <div className="others" style={{ marginTop: 12 }}>
              {others.map((o) => (
                <div key={o.n} className="othercard card">
                  <div className="on">{o.n}</div>
                  <div className="ot">{o.t}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => navigate("/plan")}>
            Show me the shared plan →
          </button>
        </div>
      </section>
  );
}