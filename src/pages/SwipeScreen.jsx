import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { CARD_DATA } from "../data/cards";
import SwipeCard from "../components/SwipeCard";
import BottomSheet from "../components/BottomSheet";
import ReasonChips from "../components/ReasonChips";

const initialSheets = { reason: false, detail: false };

function sheetsReducer(state, action) {
  switch (action.type) {
    case "reason":
      return { ...initialSheets, reason: true };
    case "detail":
      return { ...initialSheets, detail: true };
    case "close":
      return initialSheets;
    default:
      return state;
  }
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
);

export default function SwipeScreen({ useAppState }) {
  const navigate = useNavigate();
  const { idx, likes, skips, reasonCount, swipeCard, saveReason } = useAppState;
  const [sheets, dispatchSheets] = useReducer(sheetsReducer, initialSheets);
  const [reasonCard, setReasonCard] = useState(null);
  const [reasonDir, setReasonDir] = useState("yes");
  const [reasonSel, setReasonSel] = useState([]);
  const [reasonFree, setReasonFree] = useState("");
  const [detailCard, setDetailCard] = useState(null);

  const remaining = CARD_DATA.slice(idx);
  const total = CARD_DATA.length;

  const handleVerdict = (dir) => {
    const card = CARD_DATA[idx];
    if (!card) return;
    swipeCard(dir);
    setReasonCard(card);
    setReasonDir(dir);
    setReasonSel([]);
    setReasonFree("");
    dispatchSheets({ type: "reason" });
  };

  const saveAndClose = () => {
    if (!reasonCard) {
      dispatchSheets({ type: "close" });
      return;
    }
    const reasons = [...reasonSel];
    if (reasonFree.trim()) reasons.push(reasonFree.trim());
    saveReason(reasonCard.id, reasonDir, reasons);
    dispatchSheets({ type: "close" });
  };

  const openDetail = (card) => {
    setDetailCard(card || (idx < total ? CARD_DATA[idx] : null));
    dispatchSheets({ type: "detail" });
  };

return (
      <section className="screen active">
        <div className="swipe-head">
          <div>
            <div className="eyebrow">Swipe for you</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, marginTop: 2 }}>
              {Math.min(idx + 1, total)} <span style={{ color: "var(--muted)" }}>of {total}</span>
            </div>
          </div>
          <div className="swipe-tally">
            {likes + skips} swipes · {reasonCount} reasons
          </div>
        </div>

        {idx >= total && !sheets.reason ? (
          <div className="deck-zone empty">
            <div className="deck sw-empty card">
              <div className="eyebrow">Deck cleared</div>
              <h2 className="h-display" style={{ fontSize: 23 }}>
                That's a full opinion.
              </h2>
              <p className="splash-copy" style={{ textAlign: "center" }}>
                {likes} likes, {skips} skips and every reason is now a weighted signal — not just a tick box.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/style")}>
                See my summary
              </button>
              <button className="btn btn-secondary" style={{ marginTop: 8 }}>
                More itineraries on your mind?
              </button>
            </div>
          </div>
        ) : (
          <div className="deck-zone">
          <div className="deck">
            {remaining.slice(0, 3).map((card, i) => {
              const stacked = i;
              return (
                <SwipeCard
                  key={card.id + "-" + (idx + i)}
                  card={card}
                  stacked={stacked}
                  onVerdict={handleVerdict}
                  onDetail={() => openDetail(card)}
                />
              );
            })}
            </div>
          </div>
        )}

        {idx < total && (
          <div className="sw-actions">
            <button className="sw-btn no" onClick={() => handleVerdict("no")} aria-label="Skip">
              <XIcon />
            </button>
            <button className="sw-btn" onClick={() => openDetail()} aria-label="Details" style={{ width: 52, height: 52 }}>
              <InfoIcon />
            </button>
            <button className="sw-btn yes" onClick={() => handleVerdict("yes")} aria-label="Like">
              <HeartIcon />
            </button>
          </div>
        )}

        <BottomSheet
          open={sheets.reason}
          onClose={() => dispatchSheets({ type: "close" })}
        >
          <h3>{reasonDir === "yes" ? "Why the yes?" : "What ruled it out?"}</h3>
          <p className="sub">
            {reasonDir === "yes"
              ? `These adjust how we rank ${reasonCard?.name} for you — and for the group.`
              : 'Hard "no"s stick. They\'re dealbreakers, not points against.'}
          </p>
          <ReasonChips
            chips={reasonDir === "yes" ? reasonCard?.likeR || [] : reasonCard?.noR || []}
            selected={reasonSel}
            onToggle={(r) =>
              setReasonSel((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
            }
          />
          <input
            className="reason-input"
            placeholder="Add a note (optional)"
            value={reasonFree}
            onChange={(e) => setReasonFree(e.target.value)}
          />
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => dispatchSheets({ type: "close" })}>
              Skip
            </button>
            <button className="btn btn-primary" onClick={saveAndClose}>
              Save reason
            </button>
          </div>
        </BottomSheet>

        <BottomSheet
          open={sheets.detail}
          onClose={() => dispatchSheets({ type: "close" })}
          className="modal"
        >
          {detailCard && (
            <div className="detail-body">
              <div className="detail-hero">
                <img src={detailCard.img} alt={detailCard.name} />
                <div className="veil" />
                <button className="detail-close" onClick={() => dispatchSheets({ type: "close" })}>
                  ✕
                </button>
              </div>
              <div className="dname">{detailCard.name}</div>
              <div className="area">{detailCard.area} · {detailCard.cat.join(" / ")} · {detailCard.cost}</div>
              <div className="rows" style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
                {(detailCard.likeR || detailCard.noR).slice(0, 3).map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
              <ul>
                {detailCard.detail.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </BottomSheet>
      </section>
  );
}
