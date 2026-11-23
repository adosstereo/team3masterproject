/* Shared wallet for every game, using the same origin and browser storage. */
(function () {
  'use strict';
  const KEY = 'team3SharedWalletV1';
  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (v && Number.isFinite(v.balance)) return v;
    } catch (_) {}
    let original = 10;
    try {
      const shop = JSON.parse(localStorage.getItem('shopSave'));
      if (shop && Number.isFinite(Number(shop.stars))) original = Math.max(0, Number(shop.stars));
    } catch (_) {}
    // Existing claimed Vegetable Shinobi stars were previously available only there.
    try {
      const claims = JSON.parse(localStorage.getItem('vegetableShinobiAchievementClaims')) || {};
      const outfit = JSON.parse(localStorage.getItem('vegetableShinobiOutfits')) || {};
      original += Math.max(0, Object.values(claims).filter(Boolean).length * 3 - (Number(outfit.spent) || 0));
    } catch (_) {}
    // Previously claimed Bubble Rhythm badges had no shared wallet; migrate once.
    try {
      const bubble = JSON.parse(localStorage.getItem('fmsBubbleRhythmV2'));
      if (bubble && bubble.claimed) original += Object.values(bubble.claimed).filter(Boolean).length;
    } catch (_) {}
    const wallet = { balance: Math.floor(original), awards: {} };
    try { localStorage.setItem(KEY, JSON.stringify(wallet)); } catch (_) {}
    return wallet;
  }
  function write(wallet) { try { localStorage.setItem(KEY, JSON.stringify(wallet)); return true; } catch (_) { return false; } }
  window.TeamStars = {
    balance() { return read().balance; },
    award(id, amount) {
      const w = read();
      if (w.awards[id] || !Number.isFinite(amount) || amount <= 0) return false;
      w.awards[id] = true;
      w.balance += Math.floor(amount);
      return write(w);
    },
    spend(amount) {
      const w = read();
      if (!Number.isInteger(amount) || amount < 0 || w.balance < amount) return false;
      w.balance -= amount;
      return write(w);
    },
    // Award only improvements in best level rating (not repeated wins).
    level(game, index, rating) {
      const w = read();
      const id = 'level:' + game + ':' + index;
      const previous = Math.max(0, Math.min(3, Number(w.awards[id]) || 0));
      const next = Math.max(0, Math.min(3, Math.floor(Number(rating) || 0)));
      if (next <= previous) return 0;
      w.awards[id] = next;
      w.balance += next - previous;
      return write(w) ? next - previous : 0;
    }
  };
})();
