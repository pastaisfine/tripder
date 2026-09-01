import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

export default function SwipeCard({ card, onVerdict, onDetail, stacked }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const yesOpacity = useTransform(x, [0, 120], [0, 1]);
  const noOpacity = useTransform(x, [-120, 0], [1, 0]);
  const dragShift = useRef(0);

  const transform = stacked
    ? `translateY(${stacked * 10}px) scale(${1 - stacked * 0.035})`
    : undefined;

  return (
    <motion.div
      className={`swcard ${stacked ? `back${stacked}` : ""}`}
      style={{ x, rotate, zIndex: 30 - (stacked || 0), transform }}
      drag={stacked === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        const dx = info.offset.x;
        const vel = info.velocity.x;
        const fast = Math.abs(vel) > 500;
        dragShift.current = dx;
        if (Math.abs(dx) > 84 || (fast && Math.abs(dx) > 34)) {
          onVerdict(dx > 0 ? "yes" : "no");
        } else {
          x.set(0);
        }
      }}
      onClick={() => {
        if (Math.abs(dragShift.current) < 8 && stacked === 0) onDetail();
        dragShift.current = 0;
      }}
    >
      <div className="ph">
        <img src={card.img} alt={`${card.name} in Lisbon`} loading="lazy" />
        <div className="veil" />
        <div className="topline">
          <span className="chip" style={chipInline}>{card.cat.join(" · ")}</span>
          <span className="chip" style={chipInline}>{card.cost}</span>
        </div>
        <motion.div className="sw-verdict no" style={stacked === 0 ? { opacity: noOpacity } : {}}>SKIP</motion.div>
        <motion.div className="sw-verdict yes" style={stacked === 0 ? { opacity: yesOpacity } : {}}>GO</motion.div>
        <div className="pname">
          <h2>{card.name}</h2>
          <div className="area">{card.area}</div>
        </div>
      </div>
      <div className="body">
        <div className="rows">
          <span className="chip">{card.area}</span>
          <span className="chip">{card.cost}</span>
        </div>
        <p className="blurb">{card.blurb}</p>
      </div>
    </motion.div>
  );
}

const chipInline = {
  background: "rgba(29,44,26,.5)",
  borderColor: "transparent",
  color: "#fff",
};
