import { useNavigate } from "react-router-dom";
import LineSidebar from "./LineSidebar";

const TABS = [
  { to: "/hub", label: "Trip" },
  { to: "/swipe", label: "Swipe" },
  { to: "/plan", label: "Plan" },
  { to: "/group", label: "Group" },
  { to: "/profile", label: "Profile" },
];

export default function TabBar({ active }) {
  const navigate = useNavigate();
  const activeIndex = TABS.findIndex((tab) => tab.label.toLowerCase() === active);

  return (
    <div className="tabbar">
      <LineSidebar
        key={active}
        items={TABS.map((tab) => tab.label)}
        accentColor="var(--accent-ink)"
        textColor="var(--muted)"
        markerColor="var(--border)"
        proximityRadius={72}
        maxShift={12}
        markerLength={26}
        tickScale={0.5}
        itemGap={18}
        fontSize={0.78}
        smoothing={100}
        defaultActive={activeIndex}
        onItemClick={(index) => navigate(TABS[index].to)}
      />
    </div>
  );
}
