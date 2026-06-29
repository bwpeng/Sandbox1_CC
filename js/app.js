/* =====================================================
   FIFA World Cup — Live Scores App
   Real data from TheSportsDB (free, CORS-enabled API)
   ===================================================== */

// =====================================================
// CONFIG
// =====================================================
const API_KEY    = '3';                                  // TheSportsDB free/test key
const API_V1     = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const WC_LEAGUE  = '4429';                               // FIFA World Cup league id
const REFRESH_MS = 25000;                                // auto-refresh interval

// =====================================================
// COUNTRY FLAG EMOJI MAP (fallback to crest badge image)
// =====================================================
const FLAGS = {
  'Argentina':'🇦🇷','Australia':'🇦🇺','Austria':'🇦🇹','Belgium':'🇧🇪','Bolivia':'🇧🇴',
  'Brazil':'🇧🇷','Cameroon':'🇨🇲','Canada':'🇨🇦','Chile':'🇨🇱','Colombia':'🇨🇴',
  'Costa Rica':'🇨🇷','Croatia':'🇭🇷','Czech Republic':'🇨🇿','Denmark':'🇩🇰','Ecuador':'🇪🇨',
  'Egypt':'🇪🇬','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','France':'🇫🇷','Germany':'🇩🇪','Ghana':'🇬🇭',
  'Greece':'🇬🇷','Iran':'🇮🇷','Italy':'🇮🇹','Ivory Coast':'🇨🇮','Jamaica':'🇯🇲',
  'Japan':'🇯🇵','Mexico':'🇲🇽','Morocco':'🇲🇦','Netherlands':'🇳🇱','New Zealand':'🇳🇿',
  'Nigeria':'🇳🇬','Norway':'🇳🇴','Panama':'🇵🇦','Paraguay':'🇵🇾','Peru':'🇵🇪',
  'Poland':'🇵🇱','Portugal':'🇵🇹','Qatar':'🇶🇦','Saudi Arabia':'🇸🇦','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Senegal':'🇸🇳','Serbia':'🇷🇸','Slovakia':'🇸🇰','Slovenia':'🇸🇮','South Korea':'🇰🇷',
  'Korea Republic':'🇰🇷','Spain':'🇪🇸','Sweden':'🇸🇪','Switzerland':'🇨🇭','Tunisia':'🇹🇳',
  'Turkey':'🇹🇷','Ukraine':'🇺🇦','United States':'🇺🇸','USA':'🇺🇸','Uruguay':'🇺🇾',
  'Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Algeria':'🇩🇿','Honduras':'🇭🇳','El Salvador':'🇸🇻',
  'Guatemala':'🇬🇹','Venezuela':'🇻🇪','South Africa':'🇿🇦','Mali':'🇲🇱','Cape Verde':'🇨🇻',
  'Jordan':'🇯🇴','Uzbekistan':'🇺🇿','Curacao':'🇨🇼','Haiti':'🇭🇹','Bahrain':'🇧🇭',
  'Iraq':'🇮🇶','UAE':'🇦🇪','New Caledonia':'🇳🇨','Bolivia ':'🇧🇴',
};

function flagFor(name, badge) {
  const key = (name || '').trim();
  if (FLAGS[key]) return `<span class="card-flag">${FLAGS[key]}</span>`;
  if (badge) return `<img class="flag-img" src="${badge}" alt="${key}" loading="lazy">`;
  return `<span class="card-flag">🏳️</span>`;
}

function bigFlagFor(name, badge) {
  const key = (name || '').trim();
  if (FLAGS[key]) return `<span class="detail-flag">${FLAGS[key]}</span>`;
  if (badge) return `<img class="detail-flag-img" src="${badge}" alt="${key}">`;
  return `<span class="detail-flag">🏳️</span>`;
}

// =====================================================
// STATUS HELPERS
// =====================================================
const LIVE_STATUSES     = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE', 'INT'];
const FINISHED_STATUSES = ['FT', 'AET', 'PEN', 'FT_PEN', 'AWD', 'WO', 'Match Finished'];

function classify(ev) {
  const s = (ev.strStatus || '').trim();
  if (LIVE_STATUSES.includes(s)) return 'live';
  if (FINISHED_STATUSES.includes(s)) return 'finished';
  // Score present but unknown status while past kickoff → treat as live
  if (s !== 'NS' && s !== '' && ev.intHomeScore != null && !isUpcomingStatus(s)) {
    return 'finished';
  }
  return 'upcoming';
}

function isUpcomingStatus(s) {
  return ['NS', 'TBD', 'PST', 'CANC', 'ABD', 'SUSP', 'Not Started'].includes(s);
}

function statusLabel(ev, kind) {
  const s = (ev.strStatus || '').trim();
  if (kind === 'live') {
    const map = { '1H': '1st Half', '2H': '2nd Half', 'HT': 'Half Time', 'ET': 'Extra Time', 'P': 'Penalties', 'BT': 'Break' };
    const base = map[s] || 'LIVE';
    if (ev.strProgress && /\d/.test(ev.strProgress)) return `${ev.strProgress}'`;
    return base;
  }
  if (kind === 'finished') {
    if (s === 'AET') return 'AET';
    if (s === 'PEN' || s === 'FT_PEN') return 'PENS';
    return 'FT';
  }
  if (s === 'PST') return 'POSTPONED';
  if (s === 'CANC') return 'CANCELLED';
  return kickoffLabel(ev);
}

function roundLabel(ev) {
  const r = (ev.intRound || '').toString();
  const knockout = { '32': 'Round of 32', '16': 'Round of 16', '8': 'Quarter-final', '4': 'Semi-final', '2': 'Final', '1': 'Final' };
  if (knockout[r]) return `🏆 ${knockout[r]}`;
  if (ev.strGroup) return ev.strGroup;
  if (r) return `Matchday ${r}`;
  return 'FIFA World Cup';
}

function kickoffLabel(ev) {
  if (!ev.strTimestamp) return ev.strTime ? ev.strTime.slice(0, 5) : 'TBD';
  const d = new Date(ev.strTimestamp + 'Z');
  if (isNaN(d)) return ev.strTime ? ev.strTime.slice(0, 5) : 'TBD';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function todayStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// =====================================================
// STATE
// =====================================================
let currentTab = 'live';
const state = { live: null, upcoming: null, results: null };
const eventsById = {};            // id -> event (for detail lookups)
const detailCache = {};           // id -> { timeline, stats }
let prevLiveScores = {};          // id -> "h-a"

// =====================================================
// DOM REFS
// =====================================================
const openBtn        = document.getElementById('openScoresBtn');
const closeScoresBtn = document.getElementById('closeScoresBtn');
const scoresPopup    = document.getElementById('scoresPopup');
const matchesArea    = document.getElementById('matchesArea');
const refreshBtn     = document.getElementById('refreshBtn');
const detailOverlay  = document.getElementById('detailOverlay');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const detailContent  = document.getElementById('detailContent');
const goalOverlay    = document.getElementById('goalOverlay');
const confettiRoot   = document.getElementById('confettiRoot');

// =====================================================
// DATA FETCHING
// =====================================================
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadTab(tab, { silent = false } = {}) {
  if (!silent && state[tab] == null) showLoading();

  try {
    let events = [];
    if (tab === 'live') {
      const data = await fetchJSON(`${API_V1}/eventsday.php?d=${todayStr()}&l=${WC_LEAGUE}`);
      events = data.events || [];
      // eventsday is heavily cached; refresh in-play matches from the
      // fresher single-event endpoint to cut the live-score delay.
      await refreshLiveEvents(events);
      // sort: in-play first, then upcoming, then finished; by kickoff time
      events.sort((a, b) => order(a) - order(b) || tsOf(a) - tsOf(b));
    } else if (tab === 'upcoming') {
      const data = await fetchJSON(`${API_V1}/eventsnextleague.php?id=${WC_LEAGUE}`);
      events = data.events || [];
    } else if (tab === 'results') {
      const data = await fetchJSON(`${API_V1}/eventspastleague.php?id=${WC_LEAGUE}`);
      events = (data.events || []).filter(ev => classify(ev) === 'finished');
    }

    events.forEach(ev => { eventsById[ev.idEvent] = ev; });
    state[tab] = events;

    if (tab === 'live') { detectGoals(events); markUpdated(); }
    if (currentTab === tab) render();
  } catch (err) {
    if (currentTab === tab) showError(err.message);
  }
}

function order(ev) {
  const k = classify(ev);
  return k === 'live' ? 0 : k === 'upcoming' ? 1 : 2;
}
function tsOf(ev) {
  return ev.strTimestamp ? new Date(ev.strTimestamp + 'Z').getTime() : 0;
}

function loadActive(opts) { return loadTab(currentTab, opts); }

// Refresh in-play matches (and any that have kicked off but still show a
// stale "NS") from the per-event endpoint, which updates far sooner than
// the cached day list. Overwrites score/status fields in place.
async function refreshLiveEvents(events) {
  const targets = events.filter(ev => {
    if (classify(ev) === 'finished') return false;
    if (classify(ev) === 'live') return true;
    const t = tsOf(ev);
    return t && t <= Date.now();          // started, but day list lags
  });

  await Promise.all(targets.map(async ev => {
    try {
      const d = await fetchJSON(`${API_V1}/lookupevent.php?id=${ev.idEvent}`);
      const fresh = d.events && d.events[0];
      if (!fresh) return;
      if (fresh.strStatus  != null) ev.strStatus  = fresh.strStatus;
      if (fresh.strProgress != null) ev.strProgress = fresh.strProgress;
      if (fresh.intHomeScore != null) ev.intHomeScore = fresh.intHomeScore;
      if (fresh.intAwayScore != null) ev.intAwayScore = fresh.intAwayScore;
    } catch { /* keep cached values on failure */ }
  }));
}

function markUpdated() {
  const el = document.getElementById('updatedAt');
  if (el) el.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// =====================================================
// GOAL DETECTION (celebrate on real score change)
// =====================================================
function detectGoals(events) {
  const next = {};
  let scored = false;
  events.forEach(ev => {
    if (classify(ev) !== 'live') return;
    const key = `${ev.intHomeScore ?? 0}-${ev.intAwayScore ?? 0}`;
    next[ev.idEvent] = key;
    const prev = prevLiveScores[ev.idEvent];
    if (prev !== undefined && prev !== key) {
      const [ph, pa] = prev.split('-').map(Number);
      const [nh, na] = key.split('-').map(Number);
      if (nh > ph || na > pa) scored = true;
    }
  });
  prevLiveScores = next;
  if (scored && scoresPopup.classList.contains('open')) showGoalCelebration();
}

// =====================================================
// RENDER
// =====================================================
function showLoading() {
  matchesArea.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon spin-ball">⚽</div>
      <div class="empty-msg">Loading live scores…</div>
    </div>`;
}

function showError(msg) {
  matchesArea.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📡</div>
      <div class="empty-msg">Couldn't load scores</div>
      <div class="empty-sub">${msg || 'Please try again'} · tap ↻ Refresh</div>
    </div>`;
}

function render() {
  const data = state[currentTab];

  if (data == null) { showLoading(); return; }

  if (data.length === 0) {
    const msg = currentTab === 'live'
      ? 'No World Cup matches today'
      : currentTab === 'upcoming'
        ? 'No upcoming fixtures listed'
        : 'No recent results';
    matchesArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-msg">${msg}</div>
        <div class="empty-sub">Check back when matches are scheduled</div>
      </div>`;
    return;
  }

  matchesArea.innerHTML = data.map((ev, i) => buildCard(ev, i * 55)).join('');
  matchesArea.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
}

function buildCard(ev, delay) {
  const kind = currentTab === 'upcoming' ? 'upcoming' : classify(ev);
  if (kind === 'upcoming') return buildUpcomingCard(ev, delay);

  const isLive = kind === 'live';
  const badge = isLive
    ? `<span class="status-badge live-badge"><span class="badge-dot"></span>${statusLabel(ev, 'live')}</span>`
    : `<span class="status-badge finished-badge">${statusLabel(ev, 'finished')}</span>`;

  return `
    <div class="match-card ${kind}" data-id="${ev.idEvent}" style="animation-delay:${delay}ms">
      <div class="card-meta">
        <span class="card-group">${roundLabel(ev)}</span>
        ${badge}
      </div>
      <div class="card-score-row">
        <div class="card-team home">
          ${flagFor(ev.strHomeTeam, ev.strHomeTeamBadge)}
          <div class="card-team-name">${ev.strHomeTeam || '—'}</div>
        </div>
        <div class="score-box">
          <span class="score-num">${ev.intHomeScore ?? 0}</span>
          <span class="score-sep">:</span>
          <span class="score-num">${ev.intAwayScore ?? 0}</span>
        </div>
        <div class="card-team away">
          ${flagFor(ev.strAwayTeam, ev.strAwayTeamBadge)}
          <div class="card-team-name">${ev.strAwayTeam || '—'}</div>
        </div>
      </div>
      <div class="card-venue">📍 ${ev.strVenue || 'TBD'}${ev.strCity ? ', ' + ev.strCity : ''}</div>
    </div>`;
}

function buildUpcomingCard(ev, delay) {
  return `
    <div class="match-card upcoming" data-id="${ev.idEvent}" style="animation-delay:${delay}ms">
      <div class="card-meta">
        <span class="card-group">${roundLabel(ev)}</span>
        <span class="status-badge upcoming-badge">${shortDate(ev)}</span>
      </div>
      <div class="card-score-row">
        <div class="card-team home">
          ${flagFor(ev.strHomeTeam, ev.strHomeTeamBadge)}
          <div class="card-team-name">${ev.strHomeTeam || '—'}</div>
        </div>
        <div class="vs-box">
          <span class="vs-label">VS</span>
          <span class="vs-time">${kickoffLabel(ev)}</span>
        </div>
        <div class="card-team away">
          ${flagFor(ev.strAwayTeam, ev.strAwayTeamBadge)}
          <div class="card-team-name">${ev.strAwayTeam || '—'}</div>
        </div>
      </div>
      <div class="card-venue">📍 ${ev.strVenue || 'TBD'}${ev.strCity ? ', ' + ev.strCity : ''}</div>
    </div>`;
}

function shortDate(ev) {
  if (!ev.strTimestamp) return ev.dateEvent || 'TBD';
  const d = new Date(ev.strTimestamp + 'Z');
  if (isNaN(d)) return ev.dateEvent || 'TBD';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// =====================================================
// MATCH DETAIL
// =====================================================
async function openDetail(id) {
  const ev = eventsById[id];
  if (!ev) return;

  const kind = classify(ev);
  detailOverlay.classList.add('open');
  renderDetail(ev, kind, null);   // header immediately, body loading

  if (detailCache[id]) {
    renderDetail(ev, kind, detailCache[id]);
    return;
  }

  try {
    const [tl, st] = await Promise.all([
      fetchJSON(`${API_V1}/lookuptimeline.php?id=${id}`).catch(() => ({})),
      fetchJSON(`${API_V1}/lookupeventstats.php?id=${id}`).catch(() => ({})),
    ]);
    const bundle = { timeline: tl.timeline || [], stats: st.eventstats || [] };
    detailCache[id] = bundle;
    // only update if still showing this match
    if (detailOverlay.classList.contains('open')) renderDetail(ev, kind, bundle);
  } catch {
    if (detailOverlay.classList.contains('open')) renderDetail(ev, kind, { timeline: [], stats: [] });
  }
}

function renderDetail(ev, kind, bundle) {
  const isLive = kind === 'live';
  const statusCls = isLive ? 'live-badge' : 'finished-badge';
  const statusTxt = kind === 'upcoming'
    ? kickoffLabel(ev) + (ev.strTimestamp ? ' · ' + shortDate(ev) : '')
    : statusLabel(ev, kind);

  let bodyHTML;
  if (bundle == null) {
    bodyHTML = `<div class="detail-body"><div class="loading-row"><span class="spin-ball">⚽</span> Loading match details…</div></div>`;
  } else {
    bodyHTML = `<div class="detail-body">${goalsSection(ev, bundle.timeline)}${statsSection(bundle.stats)}</div>`;
  }

  detailContent.innerHTML = `
    <div class="detail-header">
      <div class="detail-comp">${roundLabel(ev)} · ${ev.strSeason || ''}</div>
      <div class="detail-status ${statusCls}">
        ${isLive ? '<span class="badge-dot"></span>' : ''} ${statusTxt}
      </div>
      <div class="detail-teams">
        <div class="detail-team">
          ${bigFlagFor(ev.strHomeTeam, ev.strHomeTeamBadge)}
          <div class="detail-team-code">${ev.strHomeTeam || '—'}</div>
        </div>
        <div class="detail-score-display">
          <span class="detail-score-num">${ev.intHomeScore ?? '-'}</span>
          <span class="detail-score-sep">:</span>
          <span class="detail-score-num">${ev.intAwayScore ?? '-'}</span>
        </div>
        <div class="detail-team">
          ${bigFlagFor(ev.strAwayTeam, ev.strAwayTeamBadge)}
          <div class="detail-team-code">${ev.strAwayTeam || '—'}</div>
        </div>
      </div>
      <div class="detail-venue">📍 ${ev.strVenue || 'TBD'}${ev.strCity ? ', ' + ev.strCity : ''}</div>
    </div>
    ${bodyHTML}`;
}

function goalsSection(ev, timeline) {
  const goals = (timeline || [])
    .filter(t => (t.strTimeline || '').toLowerCase() === 'goal')
    .map(t => {
      let tag = '';
      const d = (t.strTimelineDetail || '').toLowerCase();
      if (d.includes('penalty')) tag = ' (P)';
      else if (d.includes('own')) tag = ' (OG)';
      const side = (t.strHome === 'Yes') ? ev.strHomeTeam : ev.strAwayTeam;
      return { min: parseInt(t.intTime) || 0, player: t.strPlayer || 'Goal', team: side, tag, flag: FLAGS[(side || '').trim()] || '⚽' };
    })
    .sort((a, b) => a.min - b.min);

  const rows = goals.length
    ? goals.map(g => `
        <div class="goal-row">
          <span class="goal-min">${g.min}'</span>
          <span>${g.flag}</span>
          <span>${g.player}${g.tag}</span>
        </div>`).join('')
    : `<p class="detail-note">${classify(ev) === 'upcoming' ? 'Match has not started yet ⏳' : 'No goals recorded'}</p>`;

  return `<div class="detail-section">⚽ Goals</div><div class="goals-list">${rows}</div>`;
}

const STAT_ORDER = [
  ['Ball Possession', 'Possession'],
  ['Total Shots', 'Shots'],
  ['Shots on Goal', 'On Target'],
  ['Corner Kicks', 'Corners'],
  ['Fouls', 'Fouls'],
  ['Yellow Cards', 'Yellow Cards 🟨'],
];

function statsSection(stats) {
  if (!stats || stats.length === 0) {
    return `<div class="detail-section" style="margin-top:0.4rem">📊 Match Stats</div>
            <p class="detail-note">Stats not available for this match</p>`;
  }
  const lookup = {};
  stats.forEach(s => { lookup[s.strStat] = s; });

  const rows = STAT_ORDER.filter(([k]) => lookup[k]).map(([k, label]) => {
    const s = lookup[k];
    const hRaw = (s.intHome ?? '0').toString();
    const aRaw = (s.intAway ?? '0').toString();
    const hn = parseFloat(hRaw) || 0;
    const an = parseFloat(aRaw) || 0;
    const total = hn + an;
    const hw = total > 0 ? Math.round((hn / total) * 100) : 50;
    return `
      <div class="stat-row">
        <div class="stat-val home">${hRaw}</div>
        <div class="stat-center">
          <div class="stat-name">${label}</div>
          <div class="stat-bar">
            <div class="bar-home" style="width:${hw}%"></div>
            <div class="bar-away" style="width:${100 - hw}%"></div>
          </div>
        </div>
        <div class="stat-val away">${aRaw}</div>
      </div>`;
  }).join('');

  if (!rows) {
    return `<div class="detail-section" style="margin-top:0.4rem">📊 Match Stats</div>
            <p class="detail-note">Stats not available for this match</p>`;
  }
  return `<div class="detail-section" style="margin-top:0.4rem">📊 Match Stats</div>
          <div class="stats-list">${rows}</div>`;
}

// =====================================================
// POPUP OPEN / CLOSE
// =====================================================
openBtn.addEventListener('click', () => {
  scoresPopup.classList.add('open');
  loadActive();
});
closeScoresBtn.addEventListener('click', () => scoresPopup.classList.remove('open'));
scoresPopup.addEventListener('click', e => { if (e.target === scoresPopup) scoresPopup.classList.remove('open'); });

closeDetailBtn.addEventListener('click', () => detailOverlay.classList.remove('open'));
detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) detailOverlay.classList.remove('open'); });

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (detailOverlay.classList.contains('open')) detailOverlay.classList.remove('open');
  else if (scoresPopup.classList.contains('open')) scoresPopup.classList.remove('open');
});

// =====================================================
// TABS
// =====================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    render();
    loadActive();          // refresh / lazy-load this tab
  });
});

// =====================================================
// REFRESH BUTTON
// =====================================================
refreshBtn.addEventListener('click', () => {
  refreshBtn.classList.add('spinning');
  Promise.resolve(loadActive({ silent: true })).finally(() => {
    setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
  });
});

// =====================================================
// GOAL CELEBRATION + CONFETTI
// =====================================================
function showGoalCelebration() {
  goalOverlay.classList.add('show');
  launchConfetti();
  setTimeout(() => goalOverlay.classList.remove('show'), 1800);
}

const CONFETTI_COLORS = ['#FFD700', '#003087', '#e60000', '#22c55e', '#f97316', '#a855f7', '#ffffff'];

function launchConfetti() {
  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-bit';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        width: ${Math.random() * 8 + 5}px;
        height: ${Math.random() * 8 + 5}px;
        background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${Math.random() * 1.8 + 1.4}s;
        animation-delay: ${Math.random() * 0.4}s;`;
      confettiRoot.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 25);
  }
}

// =====================================================
// FLOATING BACKGROUND BALLS
// =====================================================
function spawnBgBalls() {
  const container = document.getElementById('bgBalls');
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'float-ball';
    el.textContent = '⚽';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${Math.random() * 1.4 + 0.9}rem;
      animation-duration: ${Math.random() * 14 + 10}s;
      animation-delay: -${Math.random() * 20}s;`;
    container.appendChild(el);
  }
}

// =====================================================
// DYNAMIC DATE LABELS
// =====================================================
function setDateLabels() {
  const pretty = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const sub = document.getElementById('popupSubtitle');
  const chip = document.getElementById('dateChip');
  if (sub) sub.textContent = `Live Scores · ${pretty}`;
  if (chip) chip.textContent = pretty;
}

// =====================================================
// AUTO-REFRESH (live tab keeps polling even when closed so
//               goal celebration is ready on open)
// =====================================================
setInterval(() => {
  if (scoresPopup.classList.contains('open')) {
    loadActive({ silent: true });
  } else {
    loadTab('live', { silent: true });   // keep live state fresh
  }
}, REFRESH_MS);

// =====================================================
// INIT
// =====================================================
spawnBgBalls();
setDateLabels();
loadTab('live', { silent: true });        // warm up so first open is instant
