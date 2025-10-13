// ...replaces/updates your existing site-stats.js...
(function () {
  const KEY = 'habitly_v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }

  function computeStats(list) {
    const total = list.length;
    const completedToday = list.filter(h => !!h.completed).length;
    const streaks = list.map(h => Number(h.streak || 0));
    const average = streaks.length ? (Math.round((streaks.reduce((a,b)=>a+b,0)/streaks.length)*10)/10) : 0;
    const longest = streaks.length ? Math.max(...streaks) : 0;
    const active = list.filter(h => (h.streak && h.streak > 0)).length;
    return { total, completedToday, average, longest, active };
  }

  function renderIntoNodes(stats) {
    const el = id => document.getElementById(id);
    if (el('stat-total')) el('stat-total').textContent = stats.total;
    if (el('stat-completed')) el('stat-completed').textContent = stats.completedToday;
    if (el('stat-average')) el('stat-average').textContent = stats.average + 'd';
    if (el('stat-longest')) el('stat-longest').textContent = stats.longest + 'd';
    if (el('stat-active')) el('stat-active').textContent = stats.active;
  }

  function render(selector) {
    const data = load();
    const stats = computeStats(data);
    renderIntoNodes(stats);
    // if a selector was provided, render a full stats view there
    if (selector) {
      const target = (typeof selector === 'string') ? document.querySelector(selector) : selector;
      if (target) {
        target.innerHTML = `
          <div style="display:grid;gap:10px">
            <div>Total habits: <strong>${stats.total}</strong></div>
            <div>Completed today: <strong>${stats.completedToday}</strong></div>
            <div>Average streak: <strong>${stats.average}d</strong></div>
            <div>Longest streak: <strong>${stats.longest}d</strong></div>
            <div>Active streaks: <strong>${stats.active}</strong></div>
          </div>
        `;
      }
    }
  }

  // expose for other scripts (habits-actions will call this)
  window.renderSiteStats = render;

  document.addEventListener('DOMContentLoaded', function () {
    render();
    // refresh button if present
    const refresh = document.getElementById('refresh-stats');
    if (refresh) refresh.addEventListener('click', () => render());

    // update when localStorage changes in other tabs
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) render();
    });

    // listen for same-tab custom event
    window.addEventListener('habits-updated', function () { render(); });
  });
})();