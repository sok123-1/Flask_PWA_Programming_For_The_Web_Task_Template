// New: central habits actions script — wire this into /templates/habits.html
(function () {
  const KEY = 'habitly_v1';
  const HISTORY_KEY = 'habitly_history';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

  function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch (e) { return {}; } }
  function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

  function todayKey() {
    return new Date().toISOString().slice(0,10);
  }

  function adjustTodayCount(delta) {
    const h = loadHistory();
    const k = todayKey();
    h[k] = (h[k] || 0) + delta;
    if (h[k] < 0) h[k] = 0;
    saveHistory(h);
  }

  function renderList() {
    const list = document.getElementById('habits-list');
    if (!list) return;
    const data = load();
    list.innerHTML = '';
    data.forEach(h => {
      const li = document.createElement('li');
      li.className = 'habit-item' + (h.completed ? ' completed' : '');
      li.innerHTML = `
        <input type="checkbox" class="habit-checkbox" ${h.completed ? 'checked' : ''} data-id="${h.id}">
        <span class="habit-name">${escapeHtml(h.name)}</span>
        <span class="habit-streak">Streak: ${h.streak}</span>
        <button class="delete-habit-btn" data-id="${h.id}" title="Delete">Delete</button>
      `;
      list.appendChild(li);
    });
  }

  function addHabit(name) {
    const data = load();
    const newHabit = { id: uid(), name, completed: false, streak: 1 };
    data.push(newHabit);
    save(data);
    notifyUpdate();
    renderList();
  }

  function toggleHabit(id) {
    let data = load();
    data = data.map(h => {
      if (h.id === id) {
        if (!h.completed) {
          // becoming completed: increase streak and history
          h.streak = (h.streak < 2) ? 2 : (h.streak + 1);
          adjustTodayCount(1);
        } else {
          // un-completing: do not change streak but decrement today's count
          adjustTodayCount(-1);
        }
        h.completed = !h.completed;
      }
      return h;
    });
    save(data);
    // notify and re-render
    window.dispatchEvent(new CustomEvent('habits-updated'));
    renderList();
  }

  function deleteHabit(id) {
    // optionally adjust history if the habit was completed today
    const dataBefore = load();
    const toDelete = dataBefore.find(h => h.id === id);
    if (toDelete && toDelete.completed) adjustTodayCount(-1);
    const data = dataBefore.filter(h => h.id !== id);
    save(data);
    window.dispatchEvent(new CustomEvent('habits-updated'));
    renderList();
  }

  function notifyUpdate() {
    // inform same-tab listeners
    window.dispatchEvent(new CustomEvent('habits-updated'));
    // also write to localStorage to allow other tabs to pick it up
    // (already saved)
  }

  // helpers
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

  // wire UI
  document.addEventListener('DOMContentLoaded', function () {
    // initial render
    renderList();

    // form add
    const form = document.getElementById('habit-form');
    const input = document.getElementById('habit-input');
    if (form && input) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) return;
        addHabit(val);
        input.value = '';
        input.focus();
      });
    }

    // list actions (delegation)
    const list = document.getElementById('habits-list');
    if (list) {
      list.addEventListener('click', function (e) {
        const t = e.target;
        if (t.classList.contains('habit-checkbox')) {
          const id = t.getAttribute('data-id');
          toggleHabit(id);
        } else if (t.classList.contains('delete-habit-btn')) {
          const id = t.getAttribute('data-id');
          deleteHabit(id);
        } else if (t.closest('.habit-item') && t.tagName === 'SPAN') {
          // clicking name toggles too (optional)
          const parent = t.closest('.habit-item');
          const idAttr = parent.querySelector('.habit-checkbox')?.getAttribute('data-id');
          if (idAttr) toggleHabit(idAttr);
        }
      });
    }

    // react to storage events from other tabs
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) renderList();
    });
  });
})();