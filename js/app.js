/* =====================================================
   FIFA World Cup 2026 — Live Scores App
   ===================================================== */

// =====================================================
// MATCH DATA  (June 27, 2026 · Group Stage · Day 17)
// =====================================================
const MATCHES = {
  live: [
    {
      id: 1,
      group: 'Group B · Matchday 3',
      home: { code: 'USA', name: 'United States', flag: '🇺🇸' },
      away: { code: 'IRAN', name: 'Iran', flag: '🇮🇷' },
      score: [2, 1],
      minute: 67,
      status: 'live',
      venue: 'MetLife Stadium, New Jersey',
      homeGoals: ["Pulisic 23'", "Weah 54'"],
      awayGoals: ["Taremi 41'"],
      stats: { possession:[58,42], shots:[12,7], onTarget:[5,3], corners:[6,3], fouls:[8,11], yellows:[1,2] }
    },
    {
      id: 2,
      group: 'Group G · Matchday 3',
      home: { code: 'FRANCE', name: 'France', flag: '🇫🇷' },
      away: { code: 'MOROCCO', name: 'Morocco', flag: '🇲🇦' },
      score: [1, 1],
      minute: '45+3',
      status: 'live',
      venue: 'AT&T Stadium, Dallas',
      homeGoals: ["Mbappé 31'"],
      awayGoals: ["En-Nesyri 44'"],
      stats: { possession:[54,46], shots:[9,6], onTarget:[4,3], corners:[4,2], fouls:[6,9], yellows:[0,1] }
    },
    {
      id: 3,
      group: 'Group E · Matchday 3',
      home: { code: 'JAPAN', name: 'Japan', flag: '🇯🇵' },
      away: { code: 'CROATIA', name: 'Croatia', flag: '🇭🇷' },
      score: [0, 0],
      minute: 'HT',
      status: 'live',
      venue: 'SoFi Stadium, Los Angeles',
      homeGoals: [],
      awayGoals: [],
      stats: { possession:[45,55], shots:[4,5], onTarget:[1,2], corners:[3,4], fouls:[7,5], yellows:[1,1] }
    },
    {
      id: 4,
      group: 'Group F · Matchday 3',
      home: { code: 'PORTUGAL', name: 'Portugal', flag: '🇵🇹' },
      away: { code: 'SWISS', name: 'Switzerland', flag: '🇨🇭' },
      score: [3, 0],
      minute: 22,
      status: 'live',
      venue: 'Lumen Field, Seattle',
      homeGoals: ["Ronaldo 8'", 'Félix 17\'', "Leão 21'"],
      awayGoals: [],
      stats: { possession:[62,38], shots:[10,2], onTarget:[4,0], corners:[5,1], fouls:[3,8], yellows:[0,1] }
    },
  ],

  upcoming: [
    {
      id: 5,
      group: 'Group H · Matchday 3',
      home: { code: 'BRAZIL', name: 'Brazil', flag: '🇧🇷' },
      away: { code: 'SERBIA', name: 'Serbia', flag: '🇷🇸' },
      kickOff: '18:00',
      status: 'upcoming',
      venue: 'Gillette Stadium, Boston',
    },
    {
      id: 6,
      group: 'Group C · Matchday 3',
      home: { code: 'GERMANY', name: 'Germany', flag: '🇩🇪' },
      away: { code: 'SPAIN', name: 'Spain', flag: '🇪🇸' },
      kickOff: '21:00',
      status: 'upcoming',
      venue: 'Rose Bowl, Los Angeles',
    },
    {
      id: 10,
      group: 'Group A · Matchday 3',
      home: { code: 'CANADA', name: 'Canada', flag: '🇨🇦' },
      away: { code: 'ECUADOR', name: 'Ecuador', flag: '🇪🇨' },
      kickOff: '21:00',
      status: 'upcoming',
      venue: 'BMO Field, Toronto',
    },
  ],

  results: [
    {
      id: 7,
      group: 'Group C · Matchday 3',
      home: { code: 'ARGENTINA', name: 'Argentina', flag: '🇦🇷' },
      away: { code: 'MEXICO', name: 'Mexico', flag: '🇲🇽' },
      score: [2, 1],
      status: 'finished',
      venue: 'Estadio Azteca, Mexico City',
      homeGoals: ["Messi 34'", "Di María 78'"],
      awayGoals: ["Lozano 56'"],
      stats: { possession:[56,44], shots:[15,9], onTarget:[6,3], corners:[7,4], fouls:[9,12], yellows:[1,3] }
    },
    {
      id: 8,
      group: 'Group D · Matchday 3',
      home: { code: 'ENGLAND', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      away: { code: 'WALES', name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
      score: [0, 0],
      status: 'finished',
      venue: 'BC Place, Vancouver',
      homeGoals: [],
      awayGoals: [],
      stats: { possession:[52,48], shots:[8,6], onTarget:[2,1], corners:[5,3], fouls:[11,10], yellows:[2,2] }
    },
    {
      id: 9,
      group: 'Group A · Matchday 3',
      home: { code: 'AUSTRALIA', name: 'Australia', flag: '🇦🇺' },
      away: { code: 'NIGERIA', name: 'Nigeria', flag: '🇳🇬' },
      score: [1, 2],
      status: 'finished',
      venue: 'BMO Field, Toronto',
      homeGoals: ["Goodwin 61'"],
      awayGoals: ["Osimhen 22'", "Iheanacho 88'"],
      stats: { possession:[47,53], shots:[11,13], onTarget:[3,5], corners:[6,5], fouls:[10,8], yellows:[2,1] }
    },
  ]
};

// =====================================================
// STATE
// =====================================================
let currentTab = 'live';
const liveMinutes = {}; // simulated minutes per live match id

MATCHES.live.forEach(m => {
  if (m.minute !== 'HT') liveMinutes[m.id] = Number(m.minute);
});

// =====================================================
// DOM REFS
// =====================================================
const openBtn       = document.getElementById('openScoresBtn');
const closeScoresBtn= document.getElementById('closeScoresBtn');
const scoresPopup   = document.getElementById('scoresPopup');
const matchesArea   = document.getElementById('matchesArea');
const refreshBtn    = document.getElementById('refreshBtn');
const detailOverlay = document.getElementById('detailOverlay');
const closeDetailBtn= document.getElementById('closeDetailBtn');
const detailContent = document.getElementById('detailContent');
const goalOverlay   = document.getElementById('goalOverlay');
const confettiRoot  = document.getElementById('confettiRoot');

// =====================================================
// POPUP OPEN / CLOSE
// =====================================================
openBtn.addEventListener('click', () => {
  scoresPopup.classList.add('open');
  render();
});

closeScoresBtn.addEventListener('click', closeScores);
scoresPopup.addEventListener('click', e => { if (e.target === scoresPopup) closeScores(); });

function closeScores() {
  scoresPopup.classList.remove('open');
}

// Detail popup
closeDetailBtn.addEventListener('click', closeDetail);
detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) closeDetail(); });

function closeDetail() {
  detailOverlay.classList.remove('open');
}

// =====================================================
// TABS
// =====================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    render();
  });
});

// =====================================================
// RENDER
// =====================================================
function render() {
  const data = MATCHES[currentTab];

  if (!data || data.length === 0) {
    matchesArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-msg">No matches here</div>
      </div>`;
    return;
  }

  matchesArea.innerHTML = data.map((m, i) =>
    buildCard(m, i * 60)
  ).join('');

  matchesArea.querySelectorAll('.match-card').forEach(card => {
    card.addEventListener('click', () => openDetail(Number(card.dataset.id)));
  });
}

function buildCard(m, animDelay) {
  if (m.status === 'upcoming') return buildUpcomingCard(m, animDelay);
  return buildScoreCard(m, animDelay);
}

function buildScoreCard(m, delay) {
  const isLive  = m.status === 'live';
  const min     = isLive ? (liveMinutes[m.id] ?? m.minute) : null;
  const minStr  = min === 'HT' ? 'HT' : isLive ? `${min}'` : 'FT';

  const statusBadge = isLive
    ? `<span class="status-badge live-badge"><span class="badge-dot"></span>${minStr}</span>`
    : `<span class="status-badge finished-badge">FT</span>`;

  const homeScorers = (m.homeGoals || []).map(g => `<div class="scorer-item">${g}</div>`).join('');
  const awayScorers = (m.awayGoals || []).map(g => `<div class="scorer-item">${g}</div>`).join('');
  const hasScorers  = homeScorers || awayScorers;

  return `
    <div class="match-card ${m.status}" data-id="${m.id}" style="animation-delay:${delay}ms">
      <div class="card-meta">
        <span class="card-group">${m.group}</span>
        ${statusBadge}
      </div>
      <div class="card-score-row">
        <div class="card-team home">
          <span class="card-flag">${m.home.flag}</span>
          <div class="card-team-name">${m.home.code}</div>
        </div>
        <div class="score-box">
          <span class="score-num" id="sh-${m.id}">${m.score[0]}</span>
          <span class="score-sep">:</span>
          <span class="score-num" id="sa-${m.id}">${m.score[1]}</span>
        </div>
        <div class="card-team away">
          <span class="card-flag">${m.away.flag}</span>
          <div class="card-team-name">${m.away.code}</div>
        </div>
      </div>
      ${hasScorers ? `
        <div class="card-scorers">
          <div class="scorer-col">${homeScorers}</div>
          <div class="scorer-col right">${awayScorers}</div>
        </div>` : ''}
      <div class="card-venue">📍 ${m.venue}</div>
    </div>`;
}

function buildUpcomingCard(m, delay) {
  return `
    <div class="match-card upcoming" data-id="${m.id}" style="animation-delay:${delay}ms">
      <div class="card-meta">
        <span class="card-group">${m.group}</span>
        <span class="status-badge upcoming-badge">KO ${m.kickOff}</span>
      </div>
      <div class="card-score-row">
        <div class="card-team home">
          <span class="card-flag">${m.home.flag}</span>
          <div class="card-team-name">${m.home.code}</div>
        </div>
        <div class="vs-box">
          <span class="vs-label">VS</span>
          <span class="vs-time">${m.kickOff} ET</span>
        </div>
        <div class="card-team away">
          <span class="card-flag">${m.away.flag}</span>
          <div class="card-team-name">${m.away.code}</div>
        </div>
      </div>
      <div class="card-venue">📍 ${m.venue}</div>
    </div>`;
}

// =====================================================
// MATCH DETAIL
// =====================================================
function openDetail(id) {
  const all = [...MATCHES.live, ...MATCHES.upcoming, ...MATCHES.results];
  const m   = all.find(x => x.id === id);
  if (!m || m.status === 'upcoming') return;

  const isLive = m.status === 'live';
  const min    = isLive ? (liveMinutes[m.id] ?? m.minute) : null;
  const minStr = isLive ? (min === 'HT' ? 'Half Time' : `${min}'`) : 'Full Time';
  const statusCls = isLive ? 'live-badge' : 'finished-badge';

  // Build goals sorted by minute
  const parseGoal = (s, flag) => {
    const last = s.split(' ').pop().replace("'", '');
    const name = s.split(' ').slice(0, -1).join(' ');
    return { minute: parseInt(last) || 0, name, flag };
  };
  const allGoals = [
    ...(m.homeGoals || []).map(g => parseGoal(g, m.home.flag)),
    ...(m.awayGoals || []).map(g => parseGoal(g, m.away.flag)),
  ].sort((a, b) => a.minute - b.minute);

  const goalsHTML = allGoals.length
    ? allGoals.map(g => `
        <div class="goal-row">
          <span class="goal-min">${g.minute}'</span>
          <span>${g.flag}</span>
          <span>${g.name}</span>
        </div>`).join('')
    : `<p style="text-align:center;color:#bbb;font-size:0.82rem;font-weight:800;padding:0.6rem 0">No goals yet ⏳</p>`;

  const statsHTML = m.stats ? buildStats(m) : '';

  detailContent.innerHTML = `
    <div class="detail-header">
      <div class="detail-comp">⚽ ${m.group}</div>
      <div class="detail-status ${statusCls}">
        ${isLive ? '<span class="badge-dot"></span>' : ''} ${minStr}
      </div>
      <div class="detail-teams">
        <div class="detail-team">
          <span class="detail-flag">${m.home.flag}</span>
          <div class="detail-team-code">${m.home.code}</div>
          <div class="detail-team-full">${m.home.name}</div>
        </div>
        <div class="detail-score-display">
          <span class="detail-score-num">${m.score[0]}</span>
          <span class="detail-score-sep">:</span>
          <span class="detail-score-num">${m.score[1]}</span>
        </div>
        <div class="detail-team">
          <span class="detail-flag">${m.away.flag}</span>
          <div class="detail-team-code">${m.away.code}</div>
          <div class="detail-team-full">${m.away.name}</div>
        </div>
      </div>
      <div class="detail-venue">📍 ${m.venue}</div>
    </div>

    <div class="detail-body">
      <div class="detail-section">⚽ Goals</div>
      <div class="goals-list">${goalsHTML}</div>
      ${statsHTML}
    </div>`;

  detailOverlay.classList.add('open');
}

function buildStats(m) {
  const s = m.stats;
  const rows = [
    { label: 'Possession', h: `${s.possession[0]}%`, a: `${s.possession[1]}%`, hn: s.possession[0], an: s.possession[1] },
    { label: 'Shots',        h: s.shots[0],         a: s.shots[1],         hn: s.shots[0],      an: s.shots[1] },
    { label: 'On Target',    h: s.onTarget[0],      a: s.onTarget[1],      hn: s.onTarget[0],   an: s.onTarget[1] },
    { label: 'Corners',      h: s.corners[0],       a: s.corners[1],       hn: s.corners[0],    an: s.corners[1] },
    { label: 'Fouls',        h: s.fouls[0],         a: s.fouls[1],         hn: s.fouls[0],      an: s.fouls[1] },
    { label: 'Yellow Cards 🟨', h: s.yellows[0],   a: s.yellows[1],       hn: s.yellows[0],    an: s.yellows[1] },
  ];

  const rowsHTML = rows.map(r => {
    const total = r.hn + r.an;
    const hw = total > 0 ? Math.round((r.hn / total) * 100) : 50;
    const aw = 100 - hw;
    return `
      <div class="stat-row">
        <div class="stat-val home">${r.h}</div>
        <div class="stat-center">
          <div class="stat-name">${r.label}</div>
          <div class="stat-bar">
            <div class="bar-home" style="width:${hw}%"></div>
            <div class="bar-away" style="width:${aw}%"></div>
          </div>
        </div>
        <div class="stat-val away">${r.a}</div>
      </div>`;
  }).join('');

  return `
    <div class="detail-section" style="margin-top:0.4rem">📊 Match Stats</div>
    <div class="stats-list">${rowsHTML}</div>`;
}

// =====================================================
// LIVE SIMULATION
// =====================================================
function tickLive() {
  let rerender = false;

  MATCHES.live.forEach(m => {
    if (m.minute === 'HT') return;

    const cur = liveMinutes[m.id];
    if (cur >= 90) return;

    // Advance 1–3 minutes each tick
    const advance = Math.floor(Math.random() * 3) + 1;
    liveMinutes[m.id] = Math.min(90, cur + advance);
    m.minute = liveMinutes[m.id];
    rerender = true;

    // 12% chance of goal per tick
    if (Math.random() < 0.12) {
      const homeGoal = Math.random() < 0.5;
      const min = liveMinutes[m.id];

      if (homeGoal) {
        m.score[0]++;
        m.homeGoals.push(`${m.home.code.charAt(0) + m.home.code.slice(1).toLowerCase()} ${min}'`);
        if (currentTab === 'live') flashScore(`sh-${m.id}`, true);
      } else {
        m.score[1]++;
        m.awayGoals.push(`${m.away.code.charAt(0) + m.away.code.slice(1).toLowerCase()} ${min}'`);
        if (currentTab === 'live') flashScore(`sa-${m.id}`, true);
      }
      showGoalCelebration();
    }
  });

  if (rerender && scoresPopup.classList.contains('open') && currentTab === 'live') {
    render();
  }
}

function flashScore(id, withGoal) {
  // Short delay so render() has run first
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('goal-pop');
    setTimeout(() => el.classList.remove('goal-pop'), 500);
  }, 80);
}

function showGoalCelebration() {
  goalOverlay.classList.add('show');
  launchConfetti();
  setTimeout(() => goalOverlay.classList.remove('show'), 1800);
}

// =====================================================
// CONFETTI
// =====================================================
const CONFETTI_COLORS = ['#FFD700','#003087','#e60000','#22c55e','#f97316','#a855f7','#ffffff'];

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
        animation-delay: ${Math.random() * 0.4}s;
      `;
      confettiRoot.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 25);
  }
}

// =====================================================
// REFRESH BUTTON
// =====================================================
refreshBtn.addEventListener('click', () => {
  refreshBtn.classList.add('spinning');
  tickLive();
  setTimeout(() => {
    refreshBtn.classList.remove('spinning');
    render();
  }, 500);
});

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
      animation-delay: -${Math.random() * 20}s;
    `;
    container.appendChild(el);
  }
}

// =====================================================
// AUTO-TICK (every 30 s)
// =====================================================
setInterval(tickLive, 30_000);

// =====================================================
// INIT
// =====================================================
spawnBgBalls();
render(); // pre-render so first open is instant
