import { NavLink } from "react-router-dom";

const IconTrip = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconSwipe = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 12h18" />
    <path d="M12 5v14" />
  </svg>
);
const IconPlan = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconGroup = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 5a3.5 3.5 0 0 1 0 6.5M17.5 14a6.5 6.5 0 0 1 4 6" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const TABS = [
  { to: "/hub", label: "Trip", Icon: IconTrip },
  { to: "/swipe", label: "Swipe", Icon: IconSwipe },
  { to: "/plan", label: "Plan", Icon: IconPlan },
  { to: "/group", label: "Group", Icon: IconGroup },
  { to: "/profile", label: "Profile", Icon: IconUser },
];

export default function TabBar({ active }) {
  return (
    <nav className="tabbar">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={`tab ${active === label.toLowerCase() ? "active" : ""}`}>
          <span>
            <Icon />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
