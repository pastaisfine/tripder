import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppState } from "./state/useAppState";
import AppHeader from "./components/AppHeader";
import TabBar from "./components/TabBar";
import { fmtDateRange } from "./utils/date";
import "./App.css";

import SplashScreen from "./pages/SplashScreen";
import HubScreen from "./pages/HubScreen";
import SetupScreen from "./pages/SetupScreen";
import TravelScreen from "./pages/TravelScreen";
import SwipeScreen from "./pages/SwipeScreen";
import DoneScreen from "./pages/DoneScreen";
import StyleScreen from "./pages/StyleScreen";
import PlanScreen from "./pages/PlanScreen";
import GroupScreen from "./pages/GroupScreen";

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
};

function Shell() {
  const appState = useAppState();
  const dateRange = fmtDateRange(appState.startDate, appState.endDate);
  const trip = `${appState.dest || "Lisbon, Portugal"}${dateRange ? ` · ${dateRange}` : ""}`;

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="stage">
      <div className="device">
        <BrowserRouter>
          <Routes>
            {Object.entries(CHROME).map(([path, cfg]) => (
              <Route
                key={path}
                path={path}
                element={
                  <div className="app">
                    {cfg.header && (
                      <AppHeader
                        invert={cfg.invert}
                        trip={cfg.trip || trip}
                        back={cfg.back}
                        backLabel={cfg.backLabel}
                        theme={theme}
                        toggleTheme={toggleTheme}
                      />
                    )}
                    {path === "/" && <SplashScreen />}
                    {path === "/setup" && <SetupScreen useAppState={appState} />}
                    {path === "/hub" && <HubScreen useAppState={appState} />}
                    {path === "/travel" && <TravelScreen useAppState={appState} />}
                    {path === "/swipe" && <SwipeScreen useAppState={appState} />}
                    {path === "/done" && <DoneScreen useAppState={appState} />}
                    {path === "/style" && <StyleScreen useAppState={appState} />}
                    {path === "/plan" && <PlanScreen useAppState={appState} />}
                    {path === "/group" && <GroupScreen useAppState={appState} />}
                    {cfg.tabs && <TabBar active={cfg.active} />}
                  </div>
                }
              />
            ))}
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default Shell;