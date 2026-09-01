import { useEffect, useState } from "react";

export default function StyleCard({ style: { name, bars, likes, skips, reasonCount } }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="stylecard card">
      <div className="st">Alice · your travel style</div>
      <h2>{name}</h2>
      <div className="who">
        Inferred from {likes} likes, {skips} skips and {reasonCount} reasons you attached.
      </div>
      <div className="trait">
        {bars.map((b) => (
          <div key={b.l}>
            <div className="row">
              <b>{b.l}</b>
              <span className="v">{b.v}%</span>
            </div>
            <div className="bar">
              <i style={animate ? { width: `${b.v}%` } : { width: 0 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="chipsline">
        <span className="chip tag-ok">Pace · relaxed</span>
        <span className="chip">Dealbreaker · queues</span>
        <span className="chip">Budget · mid</span>
      </div>
    </div>
  );
}
