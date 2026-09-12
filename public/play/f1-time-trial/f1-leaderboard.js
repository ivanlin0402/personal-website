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
    error: "",
  };

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
      // Optimistic local merge while request runs
      state.entries = normalize(
        state.entries.concat([{ team: team, driver: driver, time: lap }]),
      );
      if (!state.config) return;
      rpc(state.config, "submit_f1_lap", {
        p_team: String(team || "").slice(0, 40),
        p_driver: String(driver || "").slice(0, 40),
        p_lap_time: lap,
      })
        .then(function (rows) {
          state.entries = normalize(rows);
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
