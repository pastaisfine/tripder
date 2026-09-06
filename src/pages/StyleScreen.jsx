import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { computeStyle } from "../data/styles";
import StyleCard from "../components/StyleCard";
import InfiniteSpiral from "../components/InfiniteSpiral";

export default function StyleScreen({ useAppState }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userName = profile?.username || "Alice";
  const { likes, skips, reasonCount, tagged, markStyleSeen, allCards, preferenceProfiles } = useAppState;
  const preferences = preferenceProfiles?.[profile?.id || profile?.username || "guest"];

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
  const spiralItems = useMemo(
    () => allCards.map((card) => ({ id: card.id, src: card.img, alt: card.name })),
    [allCards],
  );

  return (

      <section className="screen active spiral-screen spiral-screen--style">
        <div className="spiral-backdrop" aria-hidden="true">
          <InfiniteSpiral
            items={spiralItems}
            speed={0.1}
            radius={225}
            cardWidth={156}
            cardHeight={204}
            verticalSpacing={108}
            cardsPerTurn={7}
            rotation={30}
            cardTilt={-6}
            cardRadius={22}
            centerScale={1.04}
            edgeFade={0.2}
            edgeBlur={9}
            grayscale={0.62}
            pauseOnHover={false}
          />
        </div>
        <div className="done-wrap">
          <div className="bigcount">Style · {userName}</div>
           <StyleCard style={style} userName={userName} />

           {preferences && (preferences.completed || preferences.skipped) && <div className="bento-card preference-summary">
             <div className="bx-title">{userName}'s trip preferences</div>
             {preferences.skipped ? <p className="sub">Skipped for now. You can add these preferences later.</p> : <div className="preference-summary-grid">
               {[ ["Rhythm", preferences.rhythm], ["Pace", preferences.density], ["Dining", preferences.dining], ["Food", preferences.foodBudget], ["Dietary", preferences.dietary?.join(", ") || "None"] ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "No preference"}</strong></div>)}
             </div>}
             {preferences.note && <p className="sub preference-note"><strong>Requirements:</strong> {preferences.note}</p>}
             <button className="btn btn-secondary" onClick={() => { sessionStorage.setItem("edit-preferences", "true"); navigate("/swipe"); }}>Edit preferences</button>
           </div>}

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
