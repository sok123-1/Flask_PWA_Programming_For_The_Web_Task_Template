// Renders a weekly LineChart (SVG) using habit history or approximated from streaks.
// Listens for 'habits-updated' and storage events to re-render.
(function () {
  const HISTORY_KEY = 'habitly_history'; // { 'YYYY-MM-DD': number }
  const HABITS_KEY = 'habitly_v1';
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

  function loadHabits() {
    try { return JSON.parse(localStorage.getItem(HABITS_KEY)) || []; }
    catch (e) { return []; }
  }

  // Build last 7 dates (Mon..Sun labels will map to last 7 days ending today)
  function last7Dates() {
    const out = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      out.push(d.toISOString().slice(0,10));
    }
    return out;
  }

  // Approximate counts from history, fallback to computing from streaks
  function weeklyCounts() {
    const hist = loadHistory();
    const habits = loadHabits();
    const dates = last7Dates();
    const counts = dates.map(date => (hist[date] !== undefined ? hist[date] : 0));

    // If history is empty, approximate using streaks: for each habit, increment last n days.
    const histEmpty = Object.keys(hist).length === 0;
    if (histEmpty && habits.length) {
      habits.forEach(h => {
        const s = Number(h.streak || 0);
        for (let i = 0; i < s && i < 7; i++) {
          counts[counts.length - 1 - i] = (counts[counts.length - 1 - i] || 0) + 1;
        }
      });
    }

    return { dates, counts };
  }

  // draw SVG line chart into containerId
  function drawChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const w = Math.max(320, container.clientWidth || 720);
    const h = 220;
    const pad = { l: 36, r: 12, t: 12, b: 28 };

    const { dates, counts } = weeklyCounts();
    const max = Math.max(1, ...counts);
    const points = counts.map((v, idx) => {
      const x = pad.l + (idx / Math.max(counts.length - 1, 1)) * (w - pad.l - pad.r);
      const y = pad.t + (1 - (v / max)) * (h - pad.t - pad.b);
      return { x, y, v, label: DAYS[(new Date(dates[idx])).getDay() === 0 ? 6 : (new Date(dates[idx])).getDay() - 1] };
    });

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.display = 'block';
    svg.style.overflow = 'visible';

    // grid lines and y ticks
    const gridGroup = document.createElementNS(ns, 'g');
    for (let i = 0; i <= 4; i++) {
      const yy = pad.t + (i / 4) * (h - pad.t - pad.b);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', pad.l);
      line.setAttribute('x2', w - pad.r);
      line.setAttribute('y1', yy);
      line.setAttribute('y2', yy);
      line.setAttribute('stroke', 'rgba(6,49,42,0.04)');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);
    }
    svg.appendChild(gridGroup);

    // axes labels (x)
    const xGroup = document.createElementNS(ns, 'g');
    points.forEach((p, i) => {
      const tx = document.createElementNS(ns, 'text');
      tx.setAttribute('x', p.x);
      tx.setAttribute('y', h - 6);
      tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('font-size', '12');
      tx.setAttribute('fill', 'rgba(6,49,42,0.45)');
      tx.textContent = p.label;
      xGroup.appendChild(tx);
    });
    svg.appendChild(xGroup);

    // line path
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPathD = `${d} L ${w - pad.r} ${h - pad.b} L ${pad.l} ${h - pad.b} Z`;

    // area fill
    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#a7f3d0" stop-opacity="0.45"></stop>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"></stop>
      </linearGradient>
    `;
    svg.appendChild(defs);

    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', areaPathD);
    area.setAttribute('fill', 'url(#pg)');
    area.setAttribute('opacity', '0.95');
    svg.appendChild(area);

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#059669');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);

    // dots + interactive tooltip
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.padding = '6px 8px';
    tooltip.style.background = 'white';
    tooltip.style.borderRadius = '8px';
    tooltip.style.boxShadow = '0 6px 20px rgba(8,127,58,0.08)';
    tooltip.style.fontSize = '13px';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '999';
    container.style.position = 'relative';
    container.appendChild(tooltip);

    points.forEach((p) => {
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.setAttribute('r', 5.5);
      dot.setAttribute('fill', '#059669');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '1.5');
      svg.appendChild(dot);

      dot.addEventListener('mouseenter', (ev) => {
        tooltip.innerHTML = `<strong style="color:#059669">${p.v}</strong> habits<br/><small style="color:rgba(6,49,42,0.6)">${p.label}</small>`;
        tooltip.style.left = (ev.clientX - container.getBoundingClientRect().left + 8) + 'px';
        tooltip.style.top = (ev.clientY - container.getBoundingClientRect().top - 36) + 'px';
        tooltip.style.display = 'block';
      });
      dot.addEventListener('mouseleave', () => tooltip.style.display = 'none');
    });

    container.appendChild(svg);
  }

  // Public rerender
  function renderProgressChart() {
    drawChart('home-chart');
  }

  // Expose
  window.renderProgressChart = renderProgressChart;

  // Listen for updates
  document.addEventListener('DOMContentLoaded', function () {
    renderProgressChart();
    window.addEventListener('storage', function (e) {
      if (e.key === HISTORY_KEY || e.key === HABITS_KEY) renderProgressChart();
    });
    window.addEventListener('habits-updated', function () { renderProgressChart(); });
  });
})();