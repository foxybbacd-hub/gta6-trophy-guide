// GTA VI trophy guide & tracker: a checklist whose progress is saved in the
// browser (localStorage), with filters, a spoiler setting, export and import.
// All data comes from data/trophies.json; the app makes no network request.
const PROGRESS_KEY = 'gta6-trophy-guide-progress';
const SETTINGS_KEY = 'gta6-trophy-guide-settings';

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const earnedOnlyEl = document.getElementById('earnedOnly');
const countEl = document.getElementById('countText');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const gradeText = document.getElementById('gradeText');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceByKey = new Map((doc.sources || []).map((s) => [s.key, s]));

let earned = loadProgress();
let settings = loadSettings();
let kindFilter = settings.kind || 'all';

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    const ids = new Set(trophies.map((t) => t.id));
    return new Set((Array.isArray(raw) ? raw : []).filter((n) => ids.has(n)));
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') || {};
  } catch {
    return {};
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoiler: spoilerEl.checked, kind: kindFilter, grade: gradeEl.value }));
}

function isStoryTrophy(t) {
  return t.kind === 'story' || t.kind === 'character';
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', character: 'Character', collectible: 'Collectible', activity: 'Activity', crime: 'Crime', money: 'Money', misc: 'Misc', platinum: 'Platinum', completion: '100%' }[kind] || kind;
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindFilter === 'story' && !isStoryTrophy(t)) return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'collectible' && t.kind !== 'collectible') return false;
  if (kindFilter === 'activity' && t.kind !== 'activity') return false;
  if (kindFilter === 'crime' && t.kind !== 'crime') return false;
  if (kindFilter === 'money' && t.kind !== 'money') return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
  return true;
}

function sourceLinks(t) {
  const span = document.createElement('p');
  span.className = 'sources-line';
  span.textContent = 'Sources: ';
  for (const key of t.sources || []) {
    const s = sourceByKey.get(key);
    if (!s) continue;
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      span.append(a);
    } else {
      const b = document.createElement('span');
      b.textContent = s.name;
      span.append(b);
      span.append(document.createTextNode(' '));
    }
  }
  return span;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  card.id = `trophy-${t.id}`;
  card.dataset.id = String(t.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => toggleEarned(t.id, box.checked));
  card.append(box);

  const body = document.createElement('div');
  const spoilerHidden = spoilerEl.checked && isStoryTrophy(t) && !earned.has(t.id);
  if (spoilerHidden) {
    const h = document.createElement('h3');
    h.textContent = 'Hidden story trophy';
    body.append(h);
    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.append(badge(t.grade, gradeLabel(t.grade)), badge('hidden', 'Hidden'), badge('kind', 'Story'));
    body.append(badges);
    const p = document.createElement('p');
    p.className = 'hidden-note';
    p.textContent = 'Its name and description stay hidden until you earn it. Tick the box once you have it to reveal the guide.';
    body.append(p);
  } else {
    const h = document.createElement('h3');
    h.textContent = t.name;
    body.append(h);
    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.append(badge(t.grade, gradeLabel(t.grade)));
    if (t.hidden) badges.append(badge('hidden', 'Hidden'));
    if (t.missable) badges.append(badge('missable', 'Possibly missable'));
    // The platinum trophy's kind is itself "platinum", so the grade badge
    // already says it; a second PLATINUM kind badge would only repeat it.
    if (t.kind !== 'platinum') badges.append(badge('kind', kindLabel(t.kind)));
    body.append(badges);
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = t.description;
    body.append(desc);
    const guide = document.createElement('p');
    guide.className = 'guide';
    const strong = document.createElement('strong');
    strong.textContent = 'How to get it: ';
    guide.append(strong, document.createTextNode(t.guide));
    body.append(guide);
    body.append(sourceLinks(t));
  }
  card.append(body);
  return card;
}

function badge(cls, text) {
  const b = document.createElement('span');
  b.className = `badge ${cls}`;
  b.textContent = text;
  return b;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  progressFill.style.width = `${(n / total) * 100}%`;
  progressText.textContent = `${n} of ${total} earned`;
  const byGrade = {};
  for (const t of trophies) if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  gradeText.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g] || 0} ${gradeLabel(g)}`)
    .join(' · ');
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const s of doc.sources || []) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a, document.createTextNode(` — ${s.covers}`));
    } else {
      li.textContent = `${s.name} — ${s.covers}`;
    }
    ul.append(li);
  }
}

function renderTrophies() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  if (!shown.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match these filters.';
    listEl.append(p);
  } else {
    for (const t of shown) listEl.append(trophyCard(t));
  }
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  renderProgress();
}

function toggleEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveProgress();
  renderTrophies();
}

function exportProgress() {
  const data = {
    game: doc.game,
    platform: doc.platform,
    exportedAt: new Date().toISOString(),
    earned: trophies.filter((t) => earned.has(t.id)).map((t) => ({ id: t.id, name: t.name })),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const items = Array.isArray(data) ? data : data.earned || [];
    const byId = new Map(trophies.map((t) => [t.id, t]));
    const byName = new Map(trophies.map((t) => [t.name, t]));
    const next = new Set();
    for (const item of items) {
      const t = typeof item === 'number' ? byId.get(item) : byId.get(item.id) || byName.get(item.name);
      if (t) next.add(t.id);
    }
    earned = next;
    saveProgress();
    renderTrophies();
  } catch {
    countEl.textContent = 'That file is not a trophy-progress export.';
  }
}

function resetProgress() {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderTrophies();
}

function applyQueryParams() {
  const params = new URLSearchParams(location.search);
  const filter = params.get('filter');
  if (filter) {
    kindFilter = ['all', 'story', 'missable', 'collectible', 'activity', 'crime', 'money'].includes(filter) ? filter : 'all';
    document.querySelectorAll('#kindFilters button').forEach((b) => b.classList.toggle('on', b.dataset.kind === kindFilter));
  }
  const grade = params.get('grade');
  if (grade) gradeEl.value = grade;
  if (params.get('spoiler') === 'on') spoilerEl.checked = true;
  const search = params.get('search');
  if (search) searchEl.value = search;
  renderTrophies();
  const view = params.get('view');
  if (view === 'roadmap') document.getElementById('roadmap').scrollIntoView();
  const trophyId = Number(params.get('trophy'));
  if (trophyId) {
    const card = document.getElementById(`trophy-${trophyId}`);
    if (card) {
      card.classList.add('spotlight');
      card.scrollIntoView({ block: 'center' });
    }
  }
}

document.querySelectorAll('#kindFilters button').forEach((b) => {
  b.addEventListener('click', () => {
    kindFilter = b.dataset.kind;
    document.querySelectorAll('#kindFilters button').forEach((x) => x.classList.toggle('on', x === b));
    saveSettings();
    renderTrophies();
  });
});
searchEl.addEventListener('input', renderTrophies);
gradeEl.addEventListener('change', () => { saveSettings(); renderTrophies(); });
spoilerEl.addEventListener('change', () => { saveSettings(); renderTrophies(); });
earnedOnlyEl.addEventListener('change', renderTrophies);
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (e) => importProgress(e.target.files[0]));
document.getElementById('resetBtn').addEventListener('click', resetProgress);

spoilerEl.checked = !!settings.spoiler;
if (settings.grade) gradeEl.value = settings.grade;
renderSources();
applyQueryParams();
