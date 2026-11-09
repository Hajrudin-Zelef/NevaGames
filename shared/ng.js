/* NevaGames — couche commune : réglages + records partagés launcher <-> jeux.
   Même origine (localStorage) : le launcher lit ce que les jeux écrivent.
   Fichier optionnel : s'il est absent, les jeux tombent sur un helper no-op. */
(function () {
  "use strict";

  var SETTINGS_KEY = "ng-settings-v1";
  var RECORDS_KEY = "ng-records-v1";
  var DEFAULTS = { sound: true, level: "4" };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v && typeof v === "object" ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function isNum(v) {
    return typeof v === "number" && isFinite(v);
  }

  var NG = {
    /* ---------- réglages ---------- */
    settings: function () {
      var saved = read(SETTINGS_KEY, {});
      var out = {};
      for (var k in DEFAULTS) out[k] = k in saved ? saved[k] : DEFAULTS[k];
      return out;
    },
    setSetting: function (key, value) {
      var s = NG.settings();
      s[key] = value;
      write(SETTINGS_KEY, s);
      return s;
    },
    records: function () {
      return read(RECORDS_KEY, {});
    },
    get: function (gameId) {
      var all = NG.records();
      return all[gameId] || {};
    },
    /* incrémente un compteur (mains jouées, victoires, ...) */
    bump: function (gameId, key, by) {
      var all = NG.records();
      var g = all[gameId] || {};
      g[key] = (isNum(g[key]) ? g[key] : 0) + (isNum(by) ? by : 1);
      all[gameId] = g;
      write(RECORDS_KEY, all);
      return g;
    },
    /* conserve le maximum (solde max, meilleure série, ...) */
    max: function (gameId, key, value) {
      if (!isNum(value)) return NG.get(gameId);
      var all = NG.records();
      var g = all[gameId] || {};
      g[key] = isNum(g[key]) ? Math.max(g[key], value) : value;
      all[gameId] = g;
      write(RECORDS_KEY, all);
      return g;
    },
    /* conserve le minimum (meilleur temps, moins de coups, ...) */
    min: function (gameId, key, value) {
      if (!isNum(value)) return NG.get(gameId);
      var all = NG.records();
      var g = all[gameId] || {};
      g[key] = isNum(g[key]) ? Math.min(g[key], value) : value;
      all[gameId] = g;
      write(RECORDS_KEY, all);
      return g;
    },
    /* remplace la valeur (série en cours, ...) */
    set: function (gameId, key, value) {
      var all = NG.records();
      var g = all[gameId] || {};
      g[key] = value;
      all[gameId] = g;
      write(RECORDS_KEY, all);
      return g;
    },
    reset: function (gameId) {
      var all = NG.records();
      if (gameId) delete all[gameId];
      else all = {};
      write(RECORDS_KEY, all);
    }
  };

  window.NG = NG;
})();
