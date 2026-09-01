export default function ProgressBar({ value, accent = false }) {
  return (
    <div className={`progressbar ${accent ? "accent" : ""}`}>
      <i style={{ width: `${value}%`, background: accent ? "var(--fg)" : undefined }} />
    </div>
  );
}
