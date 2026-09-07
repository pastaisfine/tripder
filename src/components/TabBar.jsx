import { useNavigate } from "react-router-dom";
import { Compass, Cards, MapTrifold, CheckSquareOffset, Users, User } from "phosphor-react";
import { useEffect, useState } from "react";
import LineSidebar from "./LineSidebar";

const TABS = [
  { to: "/hub", label: "Trip", icon: Compass },
  { to: "/swipe", label: "Swipe", icon: Cards },
  { to: "/plan", label: "Plan", icon: MapTrifold },
  { to: "/tasks", label: "Tasks", icon: CheckSquareOffset },
  { to: "/group", label: "Group", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export default function TabBar({ active }) {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeIndex = TABS.findIndex((tab) => tab.label.toLowerCase() === active);
  
  if (isDesktop) {
    return (
      <div className="tabbar tabbar-desktop">
        <LineSidebar
          key={active}
          items={TABS.map((tab) => tab.label)}
          accentColor="var(--accent)"
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

  return (
    <div className="tabbar tabbar-mobile">
      <nav className="bottom-nav">
        {TABS.map((tab) => {
          const isActive = tab.label.toLowerCase() === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.to}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(tab.to)}
            >
              <Icon weight={isActive ? "fill" : "regular"} size={22} />
              {isActive && <div className="nav-indicator" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
