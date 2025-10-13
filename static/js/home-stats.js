// Renders stats and a small sparkline on the homepage.
// Uses same storage key used by the app: 'habitly_v1' (fall back to defaults).

(function () {
  const KEY = 'habitly_v1';
  const defaults = [
    { id: '1', name: 'Drink 8 glasses of water', completed: false, streak: 5 },
    { id: '2', name: 'Take 10,000 steps', completed: true, streak: 12 },
    { id: '3', name: 'Read for 30 minutes', completed: false, streak: 3 },
    { id: '4', name: 'Meditate for 10 minutes', completed: true, streak: 8 },
  ];

  function load() { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : defaults.slice(); } catch (e) { return defaults.slice(); } }
  function computeStats(list) {
    const total = list.length;
    const completedToday = list.filter(h => !!h.completed).length;
    const streaks = list.map(h => Number(h.streak || 0));
    const average = streaks.length ? Math.round((streaks.reduce((a,b)=>a+b,0)/streaks.length)*10)/10 : 0;
    const longest = streaks.length ? Math.max(...streaks) : 0;
    const active = list.filter(h => h.streak && h.streak > 0).length;
    const completionRate = total ? Math.round((completedToday / total) * 100) : 0;
    const totalDaysTracked = streaks.reduce((a,b) => a + b, 0);
    const weekly = list.slice(0,7).map(h => Number(h.streak || 0));
    return { total, completedToday, average, longest, active, completionRate, totalDaysTracked, weekly };
  }

  function renderCards(stats) {
    const totalEl = document.getElementById('home-stat-total');
    const completedEl = document.getElementById('home-stat-completed');
    const avgEl = document.getElementById('home-stat-average');
    const longEl = document.getElementById('home-stat-longest');
    if (totalEl) totalEl.textContent = stats.total;
    if (completedEl) completedEl.textContent = `${stats.completedToday}/${stats.total}`;
    if (avgEl) avgEl.textContent = `${stats.average}d`;
    if (longEl) longEl.textContent = `${stats.longest}d`;
  }

  function renderInsights(stats) {
    const list = document.getElementById('home-insights');
    if (!list) return;
    list.innerHTML = `
      <div>Completion rate: <strong>${stats.completionRate}%</strong></div>
      <div>Tracked days: <strong>${stats.totalDaysTracked}</strong></div>
      <div>Active streaks: <strong>${stats.active}</strong></div>
      <div style="margin-top:8px;color:var(--muted-foreground)">Tip: small consistent actions build long-term habits.</div>
    `;
  }

  function renderSparkline(weekly) {
    const target = document.getElementById('home-chart');
    if (!target) return;
    target.innerHTML = '';
    const w = target.clientWidth || 320;
    const h = 120;
    const max = Math.max(...weekly, 1);
    const min = Math.min(...weekly, 0);
    const points = weekly.map((v,i) => {
      const x = (i / Math.max(weekly.length - 1, 1)) * (w - 20) + 10;
      const y = h - 20 - ((v - min) / Math.max(max - min, 1)) * (h - 40);
      return [x,y];
    });
    const path = points.map((p,i) => `${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns,'svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#a7f3d0" stop-opacity="0.7"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${path} L ${w-10} ${h-10} L 10 ${h-10} Z" fill="url(#g1)" opacity="0.9"></path>
      <path d="${path}" fill="none" stroke="#059669" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></path>
    `;
    target.appendChild(svg);
  }

  function renderAll(selector) {
    const data = load();
    const stats = computeStats(data);
    renderCards(stats);
    renderInsights(stats);
    renderSparkline(stats.weekly.length ? stats.weekly : [0,0,0,0,0,0,0]);
    // if caller provided a selector, render a mini-dump there
    if (selector) {
      const target = (typeof selector === 'string') ? document.querySelector(selector) : selector;
      if (target) {
        target.innerHTML = `<pre style="white-space:pre-wrap">${JSON.stringify({stats, items:data}, null, 2)}</pre>`;
      }
    }
  }

  // expose for other scripts
  window.renderHomeStats = renderAll;

  document.addEventListener('DOMContentLoaded', function () {
    renderAll();
    const refresh = document.getElementById('stats-refresh');
    if (refresh) refresh.addEventListener('click', () => renderAll());
    window.addEventListener('storage', function (e) { if (e.key === KEY) renderAll(); });
    window.addEventListener('habits-updated', function () { renderAll(); });
  });
})();