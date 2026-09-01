export default function ReasonChips({ chips, selected, onToggle }) {
  return (
    <div className="reason-grid">
      {chips.map((r) => (
        <button
          key={r}
          className={`reason-chip ${selected.includes(r) ? "sel" : ""}`}
          onClick={() => onToggle(r)}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
