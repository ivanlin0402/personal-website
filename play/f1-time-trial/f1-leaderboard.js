/**
 * Browser bridge for the F1 pygbag game.
 * Talks to Supabase RPCs so the top-50 board is shared across devices.
 *
 * Reads config from ./config.json:
 *   { "supabaseUrl": "...", "supabaseAnonKey": "..." }
 */
(function () {
  const state = {
    ready: false,
    mode: "local", // "global" | "local"
    entries: [],
    last: null, // { team, driver, time, rank, year }
    error: "",
  };

  function clearLocalCaches() {
    try {
      var resetFlag = "f1_lb_cleared_2026_09_13";
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

  function migrateYearlessLaps() {
    try {
      var flag = "f1_lb_years_backfill_2026_09_13";
      if (window.localStorage.getItem(flag) === "1") return;
      var raw = window.localStorage.getItem("f1_time_trial_leaderboard_v3");
      if (raw) {
        var parsed = JSON.parse(raw);
        var kept = normalize(parsed);
        window.localStorage.setItem(
          "f1_time_trial_leaderboard_v3",
          JSON.stringify(kept),
        );
        state.entries = kept;
        if (Array.isArray(parsed) && kept.length < parsed.length) {
          window.localStorage.setItem(
            "f1_time_trial_lap_history_v3",
            JSON.stringify(
              kept.map(function (item) {
                return item.time;
              }),
            ),
          );
        }
      }
      var lastRaw = window.localStorage.getItem("f1_time_trial_last_lap_v3");
      if (lastRaw) {
        var lastKept = normalizeLast(JSON.parse(lastRaw));
        if (lastKept) {
          window.localStorage.setItem(
            "f1_time_trial_last_lap_v3",
            JSON.stringify(lastKept),
          );
          state.last = lastKept;
        } else {
          window.localStorage.removeItem("f1_time_trial_last_lap_v3");
          state.last = null;
        }
      }
      window.localStorage.setItem(flag, "1");
    } catch (err) {
      console.warn("F1LB year backfill failed", err);
    }
  }

  function parseYear(raw) {
    const year = Number(raw);
    if (!Number.isFinite(year)) return null;
    const value = Math.floor(year);
    if (value < 1950 || value > 2100) return null;
    return value;
  }

  // Unique team+driver seasons only. Ambiguous pairs stay yearless and are dropped.
  const YEAR_LOOKUP = {"Ferrari|Michele Alboreto":1988,"Benetton|Thierry Boutsen":1988,"Tyrrell|Jonathan Palmer":1988,"Tyrrell|Julian Bailey":1988,"Ligier|Stefan Johansson":1988,"Tyrrell|Michele Alboreto":1989,"Ligier|Olivier Grouillard":1989,"Lotus|Derek Warwick":1990,"Lotus|Martin Donnelly":1990,"Arrows|Michele Alboreto":1990,"Arrows|Alex Caffi":1990,"Ligier|Philippe Alliot":1990,"Ligier|Nicola Larini":1990,"Minardi|Paolo Barilla":1990,"Jordan|Andrea de Cesaris":1991,"Jordan|Bertrand Gachot":1991,"Tyrrell|Stefano Modena":1991,"Dallara|Emanuele Pirro":1991,"Benetton|Martin Brundle":1992,"Ferrari|Ivan Capelli":1992,"Tyrrell|Olivier Grouillard":1992,"Jordan|Stefano Modena":1992,"Jordan|Mauricio Gugelmin":1992,"March|Karl Wendlinger":1992,"March|Paul Belmondo":1992,"Dallara|Pierluigi Martini":1992,"Williams|Alain Prost":1993,"Benetton|Riccardo Patrese":1993,"Ligier|Martin Brundle":1993,"Ligier|Mark Blundell":1993,"Lotus|Alessandro Zanardi":1993,"Sauber|JJ Lehto":1993,"Jordan|Ivan Capelli":1993,"Minardi|Fabrizio Barbazza":1993,"Benetton|JJ Lehto":1994,"McLaren|Martin Brundle":1994,"Ligier|Eric Bernard":1994,"Tyrrell|Mark Blundell":1994,"Minardi|Michele Alboreto":1994,"Larrousse|Erik Comas":1994,"Larrousse|Olivier Beretta":1994,"McLaren|Mark Blundell":1995,"Ligier|Aguri Suzuki":1995,"Footwork|Gianni Morbidelli":1995,"Footwork|Taki Inoue":1995,"Jordan|Martin Brundle":1996,"Ligier|Pedro Diniz":1996,"Minardi|Giancarlo Fisichella":1996,"Minardi|Pedro Lamy":1996,"Footwork|Jos Verstappen":1996,"Footwork|Ricardo Rosset":1996,"Prost|Shinji Nakano":1997,"Sauber|Nicola Larini":1997,"Tyrrell|Jos Verstappen":1997,"Minardi|Jarno Trulli":1997,"Minardi|Ukyo Katayama":1997,"Arrows|Mika Salo":1998,"Arrows|Pedro Diniz":1998,"Minardi|Shinji Nakano":1998,"Minardi|Esteban Tuero":1998,"Stewart|Johnny Herbert":1999,"Williams|Alessandro Zanardi":1999,"Arrows|Tora Takagi":1999,"Williams|Jenson Button":2000,"BAR|Ricardo Zonta":2000,"Sauber|Mika Salo":2000,"Arrows|Jos Verstappen":2000,"Jaguar|Johnny Herbert":2000,"Minardi|Gaston Mazzacane":2000,"Sauber|Kimi Raikkonen":2001,"Benetton|Jenson Button":2001,"Prost|Jean Alesi":2001,"Prost|Luciano Burti":2001,"Minardi|Fernando Alonso":2001,"Minardi|Tarso Marques":2001,"Renault|Jenson Button":2002,"Jordan|Takuma Sato":2002,"Toyota|Mika Salo":2002,"Toyota|Allan McNish":2002,"Minardi|Mark Webber":2002,"Minardi|Alex Yoong":2002,"Jaguar|Antonio Pizzonia":2003,"Jordan|Ralph Firman":2003,"Minardi|Jos Verstappen":2003,"Minardi|Justin Wilson":2003,"Sauber|Giancarlo Fisichella":2004,"Jaguar|Christian Klien":2004,"Jordan|Nick Heidfeld":2004,"Jordan|Giorgio Pantano":2004,"Minardi|Gianmaria Bruni":2004,"Minardi|Zsolt Baumgartner":2004,"Williams|Nick Heidfeld":2005,"Sauber|Jacques Villeneuve":2005,"Jordan|Tiago Monteiro":2005,"Jordan|Narain Karthikeyan":2005,"Minardi|Christijan Albers":2005,"Minardi|Patrick Friesacher":2005,"BMW|Jacques Villeneuve":2006,"BMW Sauber|Jacques Villeneuve":2006,"Toro Rosso|Scott Speed":2006,"S. Aguri|Yuji Ide":2006,"Super Aguri|Yuji Ide":2006,"Renault|Heikki Kovalainen":2007,"Williams|Alexander Wurz":2007,"S. Aguri|Anthony Davidson":2007,"Super Aguri|Anthony Davidson":2007,"Brawn|Jenson Button":2009,"Brawn|Rubens Barrichello":2009,"Renault|Robert Kubica":2010,"Williams|Nico Hulkenberg":2010,"Force India|Vitantonio Liuzzi":2010,"Force Ind.|Vitantonio Liuzzi":2010,"BMW Sauber|Kamui Kobayashi":2010,"Sauber|Pedro de la Rosa":2010,"BMW Sauber|Pedro de la Rosa":2010,"Renault|Nick Heidfeld":2011,"Williams|Bruno Senna":2012,"Caterham|Heikki Kovalainen":2012,"Caterham|Vitaly Petrov":2012,"McLaren|Sergio Perez":2013,"Caterham|Charles Pic":2013,"Caterham|Giedo van der Garde":2013,"McLaren|Kevin Magnussen":2014,"Sauber|Adrian Sutil":2014,"Marussia|Jules Bianchi":2014,"Marussia|Max Chilton":2014,"Red Bull|Daniil Kvyat":2015,"Toro Rosso|Max Verstappen":2015,"Marussia|Will Stevens":2015,"Marussia|Roberto Merhi":2015,"Haas|Esteban Gutierrez":2016,"Renault|Kevin Magnussen":2016,"Sauber|Pascal Wehrlein":2017,"Renault|Carlos Sainz":2018,"Sauber|Charles Leclerc":2018,"Toro Rosso|Pierre Gasly":2018,"Toro Rosso|Brendon Hartley":2018,"Williams|Sergey Sirotkin":2018,"Red Bull|Pierre Gasly":2019,"Toro Rosso|Alexander Albon":2019,"Williams|Robert Kubica":2019,"Red Bull|Alexander Albon":2020,"Renault|Esteban Ocon":2020,"AlphaTauri|Daniil Kvyat":2020,"Haas|Nikita Mazepin":2021,"Williams|Logan Sargeant":2023,"AlphaTauri|Nyck de Vries":2023,"RB|Yuki Tsunoda":2024,"RB|Daniel Ricciardo":2024,"Williams|Franco Colapinto":2024,"Sauber|Valtteri Bottas":2024,"Kick Sauber|Valtteri Bottas":2024,"Sauber|Zhou Guanyu":2024,"Kick Sauber|Zhou Guanyu":2024,"Ferrari|Lewis Hamilton":2025,"Mercedes|Kimi Antonelli":2025,"Red Bull|Yuki Tsunoda":2025,"Williams|Carlos Sainz":2025,"RB|Isack Hadjar":2025,"Racing Bulls|Isack Hadjar":2025,"RB|Liam Lawson":2025,"Racing Bulls|Liam Lawson":2025,"Haas|Esteban Ocon":2025,"Haas|Oliver Bearman":2025,"Kick Sauber|Nico Hulkenberg":2025,"Sauber|Gabriel Bortoleto":2025,"Kick Sauber|Gabriel Bortoleto":2025,"Alpine|Franco Colapinto":2025};

  function resolveYear(team, driver, rawYear) {
    const parsed = parseYear(rawYear);
    if (parsed != null) return parsed;
    const key = String(team || "?").slice(0, 24) + "|" + String(driver || "?").slice(0, 24);
    return Object.prototype.hasOwnProperty.call(YEAR_LOOKUP, key) ? YEAR_LOOKUP[key] : null;
  }

  function normalize(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map(function (item) {
        const team = String(item.team || "?").slice(0, 24);
        const driver = String(item.driver || "?").slice(0, 24);
        return {
          team: team,
          driver: driver,
          time: Number(item.time),
          year: resolveYear(team, driver, item.year),
        };
      })
      .filter(function (item) {
        return (
          Number.isFinite(item.time) &&
          item.time >= 5 &&
          item.time <= 900 &&
          item.year != null
        );
      })
      .sort(function (a, b) {
        return a.time - b.time;
      })
      .slice(0, 50);
  }

  function normalizeLast(last) {
    if (!last || typeof last !== "object") return null;
    const time = Number(last.time);
    const rank = Number(last.rank);
    if (!Number.isFinite(time) || time < 5 || time > 900) return null;
    if (!Number.isFinite(rank) || rank < 1) return null;
    const team = String(last.team || "?").slice(0, 24);
    const driver = String(last.driver || "?").slice(0, 24);
    const year = resolveYear(team, driver, last.year);
    if (year == null) return null;
    return {
      team: team,
      driver: driver,
      time: time,
      rank: Math.floor(rank),
      year: year,
    };
  }

  function sameLap(left, right) {
    if (!left || !right) return false;
    return (
      left.team === right.team &&
      left.driver === right.driver &&
      left.year === right.year &&
      Math.round(Number(left.time) * 1000) === Math.round(Number(right.time) * 1000)
    );
  }

  function rankOnBoard(entries, last) {
    var rank = 0;
    (entries || []).forEach(function (item, i) {
      if (sameLap(item, last)) rank = i + 1;
    });
    if (rank) return rank;
    return Math.max(
      1,
      1 +
        (entries || []).filter(function (item) {
          return item.time < last.time;
        }).length,
    );
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
      migrateYearlessLaps();
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
    submit: function (team, driver, time, year) {
      const lap = Number(time);
      if (!Number.isFinite(lap) || lap < 5 || lap > 900) return;
      const season = parseYear(year);

      const optimisticLast = {
        team: String(team || "?").slice(0, 24),
        driver: String(driver || "?").slice(0, 24),
        time: lap,
        year: season,
      };

      state.entries = normalize(
        state.entries.concat([{ team: team, driver: driver, time: lap, year: season }]),
      );
      optimisticLast.rank = rankOnBoard(state.entries, optimisticLast);
      state.last = optimisticLast;

      if (!state.config) return;
      rpc(state.config, "submit_f1_lap", {
        p_team: String(team || "").slice(0, 40),
        p_driver: String(driver || "").slice(0, 40),
        p_lap_time: lap,
        p_year: season,
      })
        .then(function (payload) {
          const parsed = parseSubmitResult(payload, optimisticLast);
          state.entries = parsed.entries;
          if (parsed.last) {
            parsed.last.rank = rankOnBoard(parsed.entries, parsed.last);
          }
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
