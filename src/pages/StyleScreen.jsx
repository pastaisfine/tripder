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
        <div className="style-wrap" style={{ padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1 }}>
          <div style={{ padding: "4px 4px 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
              <span>Inferred Taste Profile</span>
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.03em" }}>
              Travel style: {userName}
            </h1>
          </div>

          <StyleCard style={style} userName={userName} />

          {preferences && (preferences.completed || preferences.skipped) && (
            <div className="bento-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em" }}>{userName}'s preferences</div>
              {preferences.skipped ? (
                <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>Skipped for now. You can add these anytime.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginTop: 10 }}>
                  {[
                    ["Rhythm", preferences.rhythm],
                    ["Pace", preferences.density],
                    ["Dining", preferences.dining],
                    ["Food", preferences.foodBudget],
                    ["Dietary", preferences.dietary?.join(", ") || "None"],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: "var(--bg)", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", marginTop: 2 }}>{value || "No preference"}</div>
                    </div>
                  ))}
                </div>
              )}
              {preferences.note && (
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                  <strong style={{ color: "var(--fg)" }}>Notes:</strong> {preferences.note}
                </div>
              )}
              <button
                className="btn btn-secondary"
                style={{ marginTop: 12, padding: "8px 16px", fontSize: 13, alignSelf: "flex-start" }}
                onClick={() => {
                  sessionStorage.setItem("edit-preferences", "true");
                  navigate("/swipe");
                }}
              >
                Edit preferences
              </button>
            </div>
          )}

          <div className="bento-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em" }}>Everyone else in the crew</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {others.map((o) => (
                <div key={o.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg)", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{o.n}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", background: "var(--surface)", padding: "3px 10px", borderRadius: 999, border: "1px solid var(--border)" }}>
                    {o.t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={() => navigate("/plan")}>
            Show me the shared plan →
          </button>
        </div>
      </section>
  );
}
