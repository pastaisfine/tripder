import { useState, useCallback, useMemo } from "react";
import { CARD_DATA } from "../data/cards";

const LS_KEY = "tripder-state-v1";

const DEFAULT_STATE = {
  idx: 0,
  likes: 0,
  skips: 0,
  mode: "balanced",
  tagged: {},
  styleSeen: false,
  planSeen: false,
  dest: "",
  hotel: null,
  flight: null,
  styleName: "",
};

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...s };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

function save(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

export function useAppState() {
  const [state, setState] = useState(load);

  const update = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const swipeCard = useCallback(
    (dir) => {
      setState((prev) => {
        const next = {
          ...prev,
          idx: prev.idx + 1,
          likes: prev.likes + (dir === "yes" ? 1 : 0),
          skips: prev.skips + (dir === "no" ? 1 : 0),
        };
        save(next);
        return next;
      });
    },
    [],
  );

  const saveReason = useCallback((cardId, dir, reasons) => {
    setState((prev) => {
      const tagged = { ...prev.tagged };
      if (reasons.length) tagged[cardId] = { dir, reasons };
      const next = { ...prev, tagged };
      save(next);
      return next;
    });
  }, []);

  const setMode = useCallback((mode) => {
    setState((prev) => {
      const next = { ...prev, mode };
      save(next);
      return next;
    });
  }, []);

  const selectHotel = useCallback((id) => {
    setState((prev) => {
      const next = { ...prev, hotel: id };
      save(next);
      return next;
    });
  }, []);

  const selectFlight = useCallback((id) => {
    setState((prev) => {
      const next = { ...prev, flight: id };
      save(next);
      return next;
    });
  }, []);

  const setDest = useCallback((dest) => {
    setState((prev) => {
      const next = { ...prev, dest };
      save(next);
      return next;
    });
  }, []);

  const markStyleSeen = useCallback((name) => {
    setState((prev) => {
      const next = { ...prev, styleSeen: true, styleName: name };
      save(next);
      return next;
    });
  }, []);

  const markPlanSeen = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, planSeen: true };
      save(next);
      return next;
    });
  }, []);

  const reasonCount = useMemo(
    () => Object.values(state.tagged).reduce((sum, t) => sum + (t.reasons?.length || 0), 0),
    [state.tagged],
  );
  const finished = state.idx >= CARD_DATA.length;

  return {
    ...state,
    finished,
    reasonCount,
    update,
    swipeCard,
    saveReason,
    setMode,
    selectHotel,
    selectFlight,
    setDest,
    markStyleSeen,
    markPlanSeen,
  };
}
