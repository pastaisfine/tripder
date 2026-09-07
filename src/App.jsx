import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AppHeader from "./components/AppHeader";
import RequireAuth from "./components/RequireAuth";
import TabBar from "./components/TabBar";
import { AuthProvider } from "./context/AuthContext";
import DoneScreen from "./pages/DoneScreen";
import ForgotPasswordScreen from "./pages/ForgotPasswordScreen";
import GroupScreen from "./pages/GroupScreen";
import HubScreen from "./pages/HubScreen";
import JoinTripScreen from "./pages/JoinTripScreen";
import LoginScreen from "./pages/LoginScreen";
import PlanScreen from "./pages/PlanScreen";
import ProfileScreen from "./pages/ProfileScreen";
import RegisterScreen from "./pages/RegisterScreen";
import ResetPasswordScreen from "./pages/ResetPasswordScreen";
import SetupScreen from "./pages/SetupScreen";
import SplashScreen from "./pages/SplashScreen";
import StyleScreen from "./pages/StyleScreen";
import SwipeScreen from "./pages/SwipeScreen";
import TravelScreen from "./pages/TravelScreen";
import { useAppState } from "./state/useAppState";
import { fmtDateRange } from "./utils/date";

const CHROME = {
  "/": { header: false, tabs: false },
  "/setup": { header: true, invert: false, back: "/", backLabel: "Home", tabs: false },
  "/hub": { header: true, invert: true, tabs: true, active: "trip" },
  "/travel": { header: true, invert: false, back: "/plan", backLabel: "Plan", tabs: true, active: "trip" },
  "/swipe": { header: true, invert: false, back: "/setup", backLabel: "Setup", tabs: true, active: "swipe" },
  "/done": { header: true, invert: false, back: "/swipe", backLabel: "Swipe", tabs: false },
  "/style": { header: true, invert: false, back: "/done", backLabel: "Done", tabs: false },
  "/plan": { header: true, invert: false, back: "/hub", backLabel: "Trip", tabs: true, active: "plan" },
  "/group": { header: true, invert: false, back: "/hub", backLabel: "Trip", tabs: true, active: "group" },
  "/login": { header: true, invert: false, back: "/", backLabel: "Home", tabs: false },
  "/register": { header: true, invert: false, back: "/login", backLabel: "Login", tabs: false },
  "/profile": { header: true, invert: false, back: "/hub", backLabel: "Trip", tabs: true, active: "profile" },
  "/forgot-password": { header: true, invert: false, back: "/login", backLabel: "Login", tabs: false },
  "/reset-password": { header: true, invert: false, tabs: false },
  "/join/:tripId": { header: true, invert: false, back: "/", backLabel: "Home", tabs: false },
};

function Shell() {
  const appState = useAppState();
  const dateRange = fmtDateRange(appState.startDate, appState.endDate);
  const trip = `${appState.dest || "Lisbon, Portugal"}${dateRange ? ` · ${dateRange}` : ""}`;
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const protect = (element) => <RequireAuth>{element}</RequireAuth>;

  const screens = {
    "/": <SplashScreen />,
    "/setup": protect(<SetupScreen useAppState={appState} />),
    "/login": <LoginScreen />,
    "/register": <RegisterScreen />,
    "/forgot-password": <ForgotPasswordScreen />,
    "/reset-password": <ResetPasswordScreen />,
    "/join/:tripId": protect(<JoinTripScreen useAppState={appState} />),
    "/swipe": protect(<SwipeScreen useAppState={appState} />),
    "/hub": protect(<HubScreen useAppState={appState} />),
    "/done": protect(<DoneScreen useAppState={appState} />),
    "/style": protect(<StyleScreen useAppState={appState} />),
    "/plan": protect(<PlanScreen useAppState={appState} />),
    "/group": protect(<GroupScreen useAppState={appState} />),
    "/travel": protect(<TravelScreen useAppState={appState} />),
    "/profile": protect(<ProfileScreen useAppState={appState} />),
  };

  return <AuthProvider><div className="stage"><div className="device"><BrowserRouter><Routes>{Object.entries(CHROME).map(([path, cfg]) => <Route key={path} path={path} element={<div className={`app${cfg.tabs ? " app--sidebar" : ""}`}>{cfg.header && <AppHeader invert={cfg.invert} trip={cfg.trip || trip} back={cfg.back} backLabel={cfg.backLabel} theme={theme} toggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} />}{screens[path]}{cfg.tabs && <TabBar active={cfg.active} />}</div>} />)}</Routes></BrowserRouter></div></div></AuthProvider>;
}

export default Shell;
