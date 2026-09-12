/**
 * Browser bridge for the F1 pygbag game.
 * Talks to Supabase RPCs so the top-10 board is shared across devices.
 *
 * Reads config from ./config.json:
 *   { "supabaseUrl": "...", "supabaseAnonKey": "..." }
 */
(function () {
  const state = {
    ready: false,
    mode: "local", // "global" | "local"
    entries: [],
    last: null, // { team, driver, time, rank }
    error: "",
  };

  function clearLocalCaches() {
    try {
      var resetFlag = "f1_lb_cleared_2026_09_12";
      if (window.localStorage.getItem(resetFlag) === "1") return;
      [
        "f1_time_trial_leaderboard",
        "f1_time_trial_leaderboard_v2",
        "f1_time_trial_leaderboard_v3",
        "f1_time_trial_lap_history",
        "f1_time_trial_lap_history_v2",
        "f1_time_trial_lap_history_v3",
        "f1_time_trial_last_lap",
        "f1_time_trial_last_lap_v2",
        "f1_time_trial_last_lap_v3",
      ].forEach(function (key) {
        window.localStorage.removeItem(key);
      });
      window.localStorage.setItem(resetFlag, "1");
      state.entries = [];
      state.last = null;
    } catch (err) {
      console.warn("F1LB local clear failed", err);
    }
  }

  function normalize(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map(function (item) {
        return {
          team: String(item.team || "?").slice(0, 24),
          driver: String(item.driver || "?").slice(0, 24),
          time: Number(item.time),
        };
      })
      .filter(function (item) {
        return Number.isFinite(item.time) && item.time >= 5 && item.time <= 900;
      })
      .sort(function (a, b) {
        return a.time - b.time;
      })
      .slice(0, 10);
  }

  function normalizeLast(last) {
    if (!last || typeof last !== "object") return null;
    const time = Number(last.time);
    const rank = Number(last.rank);
    if (!Number.isFinite(time) || time < 5 || time > 900) return null;
    if (!Number.isFinite(rank) || rank < 1) return null;
    return {
      team: String(last.team || "?").slice(0, 24),
      driver: String(last.driver || "?").slice(0, 24),
      time: time,
      rank: Math.floor(rank),
    };
  }

  function parseSubmitResult(payload, fallbackLast) {
    // New shape: { board: [...], last: {...} }
    if (payload && typeof payload === "object" && !Array.isArray(payload) && payload.board) {
      return {
        entries: normalize(payload.board),
        last: normalizeLast(payload.last) || fallbackLast,
      };
    }
    // Old shape: bare array
    return {
      entries: normalize(payload),
      last: fallbackLast,
    };
  }

  async function loadConfig() {
    try {
      const res = await fetch("config.json", { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn("F1LB config load failed", err);
      return null;
    }
  }

  async function rpc(config, name, body) {
    const res = await fetch(config.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: {
        apikey: config.supabaseAnonKey,
        Authorization: "Bearer " + config.supabaseAnonKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(name + " failed: " + res.status + " " + text.slice(0, 120));
    }
    return res.json();
  }

  const F1LB = {
    getState: function () {
      return JSON.stringify(state);
    },
    init: async function () {
      clearLocalCaches();
      const config = await loadConfig();
      if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
        state.mode = "local";
        state.ready = true;
        state.error = "missing config";
        return state;
      }
      try {
        const rows = await rpc(config, "get_f1_leaderboard", {});
        state.entries = normalize(rows);
        state.mode = "global";
        state.error = "";
        state.config = config;
      } catch (err) {
        console.warn("F1LB init failed", err);
        state.mode = "local";
        state.error = String(err && err.message ? err.message : err);
      }
      state.ready = true;
      return state;
    },
    refresh: async function () {
      if (!state.config) return state;
      try {
        const rows = await rpc(state.config, "get_f1_leaderboard", {});
        state.entries = normalize(rows);
        state.mode = "global";
        state.error = "";
      } catch (err) {
        console.warn("F1LB refresh failed", err);
        state.error = String(err && err.message ? err.message : err);
      }
      return state;
    },
    submit: function (team, driver, time) {
      const lap = Number(time);
      if (!Number.isFinite(lap) || lap < 5 || lap > 900) return;

      const optimisticRank =
        1 +
        state.entries.filter(function (e) {
          return e.time < lap;
        }).length;

      const optimisticLast = {
        team: String(team || "?").slice(0, 24),
        driver: String(driver || "?").slice(0, 24),
        time: lap,
        rank: Math.max(1, optimisticRank),
      };

      state.entries = normalize(
        state.entries.concat([{ team: team, driver: driver, time: lap }]),
      );
      state.last = optimisticLast;

      if (!state.config) return;
      rpc(state.config, "submit_f1_lap", {
        p_team: String(team || "").slice(0, 40),
        p_driver: String(driver || "").slice(0, 40),
        p_lap_time: lap,
      })
        .then(function (payload) {
          const parsed = parseSubmitResult(payload, optimisticLast);
          state.entries = parsed.entries;
          state.last = parsed.last;
          state.mode = "global";
          state.error = "";
        })
        .catch(function (err) {
          console.warn("F1LB submit failed", err);
          state.error = String(err && err.message ? err.message : err);
        });
    },
  };

  window.F1LB = F1LB;
  F1LB.init();
})();
