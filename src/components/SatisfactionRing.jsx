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
        <defs>
          <linearGradient id="satGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EE7F65" />
            <stop offset="100%" stopColor="#F5B092" />
          </linearGradient>
        </defs>
        <circle cx="37" cy="37" r="33" fill="none" stroke="var(--bg-alt)" strokeWidth="7" />
        <circle
          cx="37"
          cy="37"
          r="33"
          fill="none"
          stroke="url(#satGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.22,.7,.28,1)" }}
        />
      </svg>
      <div className="lbl">{value}%</div>
    </div>
  );
}
