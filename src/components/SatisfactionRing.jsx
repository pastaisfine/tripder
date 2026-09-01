import { useEffect, useState } from "react";

export default function SatisfactionRing({ value }) {
  const [offset, setOffset] = useState(207);
  const circumference = 207;

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOffset(circumference - (circumference * value) / 100);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [value, circumference]);

  return (
    <div className="ring">
      <svg width="74" height="74" viewBox="0 0 74 74">
        <circle cx="37" cy="37" r="33" fill="none" stroke="var(--bg-alt)" strokeWidth="7" />
        <circle
          cx="37"
          cy="37"
          r="33"
          fill="none"
          stroke="var(--gerund)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <div className="lbl">{value}%</div>
    </div>
  );
}
