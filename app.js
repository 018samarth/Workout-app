/* ══════════════════════════════════════════════════════════════
   FITTRACK PRO — app.js
   Sections:
     1.  Constants & Config
     2.  State
     3.  localStorage Helpers
     4.  Utility Functions
     5.  Toast & Confetti
     6.  Tab Navigation
     7.  Top Bar
     8.  Today Tab
     9.  Workout Log Tab
    10.  Exercise Picker Modal
    11.  Rest Timer
    12.  Food Tab
    13.  Food Autocomplete
    14.  Cardio Burn
    15.  Progress Tab & Charts
    16.  Settings Tab
    17.  BMI / TDEE Calculator
    18.  Export / Import
    19.  Bodyweight Log
    20.  Confirm Modal
    21.  Long-Press Handlers
    22.  Event Delegation
    23.  Initialisation
══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════
   1. CONSTANTS & CONFIG
═══════════════════════════════════════ */

const KEYS = {
  workouts    : 'wl_workouts',
  foodLog     : 'wl_food_log',
  bodyweight  : 'wl_bodyweight',
  settings    : 'wl_settings',
  foodLibrary : 'wl_food_library',
  measurements: 'wl_measurements',
};

const EXERCISE_LIBRARY = [
  // Push
  { name: 'Bench Press',          category: 'Push' },
  { name: 'Incline Bench Press',  category: 'Push' },
  { name: 'Decline Bench Press',  category: 'Push' },
  { name: 'Overhead Press (OHP)', category: 'Push' },
  { name: 'Dumbbell Press',       category: 'Push' },
  { name: 'Lateral Raises',       category: 'Push' },
  { name: 'Front Raises',         category: 'Push' },
  { name: 'Tricep Pushdown',      category: 'Push' },
  { name: 'Skull Crushers',       category: 'Push' },
  { name: 'Dips',                 category: 'Push' },
  { name: 'Cable Fly',            category: 'Push' },
  { name: 'Pec Deck',             category: 'Push' },
  // Pull
  { name: 'Pull-ups',             category: 'Pull' },
  { name: 'Chin-ups',             category: 'Pull' },
  { name: 'Barbell Row',          category: 'Pull' },
  { name: 'Dumbbell Row',         category: 'Pull' },
  { name: 'Cable Row',            category: 'Pull' },
  { name: 'Lat Pulldown',         category: 'Pull' },
  { name: 'Face Pulls',           category: 'Pull' },
  { name: 'Bicep Curls',          category: 'Pull' },
  { name: 'Hammer Curls',         category: 'Pull' },
  { name: 'Preacher Curls',       category: 'Pull' },
  { name: 'Deadlift',             category: 'Pull' },
  { name: 'Romanian Deadlift',    category: 'Pull' },
  // Legs
  { name: 'Squat',                category: 'Legs' },
  { name: 'Front Squat',          category: 'Legs' },
  { name: 'Leg Press',            category: 'Legs' },
  { name: 'Leg Curl',             category: 'Legs' },
  { name: 'Leg Extension',        category: 'Legs' },
  { name: 'Walking Lunges',       category: 'Legs' },
  { name: 'Bulgarian Split Squat',category: 'Legs' },
  { name: 'Calf Raises',          category: 'Legs' },
  { name: 'Hip Thrust',           category: 'Legs' },
  { name: 'Sumo Deadlift',        category: 'Legs' },
  // Core
  { name: 'Plank',                category: 'Core' },
  { name: 'Cable Crunch',         category: 'Core' },
  { name: 'Hanging Leg Raises',   category: 'Core' },
  { name: 'Ab Wheel',             category: 'Core' },
  // Cardio
  { name: 'Running',              category: 'Cardio' },
  { name: 'Cycling',              category: 'Cardio' },
  { name: 'Jump Rope',            category: 'Cardio' },
  { name: 'Rowing Machine',       category: 'Cardio' },
  { name: 'Stairmaster',          category: 'Cardio' },
  { name: 'HIIT',                 category: 'Cardio' },
];

const PRESET_FOODS = [
  { id:'dal',     name:'Dal (1 cup)',          calories:198, protein:12, carbs:34, fats:1  },
  { id:'rice',    name:'White Rice (1 cup)',   calories:206, protein:4,  carbs:45, fats:0.5},
  { id:'roti',    name:'Roti (1 piece)',       calories:104, protein:3,  carbs:20, fats:1.5},
  { id:'paneer',  name:'Paneer (100g)',        calories:265, protein:18, carbs:2,  fats:20 },
  { id:'curd',    name:'Curd (1 cup)',         calories:98,  protein:8,  carbs:7,  fats:4  },
  { id:'banana',  name:'Banana (1 medium)',    calories:105, protein:1,  carbs:27, fats:0.3},
  { id:'whey',    name:'Whey Protein (1 scoop)',calories:120,protein:25, carbs:3,  fats:1.5},
  { id:'oats',    name:'Oats (100g dry)',      calories:389, protein:17, carbs:66, fats:7  },
  { id:'almonds', name:'Almonds (30g)',        calories:174, protein:6,  carbs:6,  fats:15 },
  { id:'eggs',    name:'Eggs (2 whole)',       calories:156, protein:12, carbs:1,  fats:10 },
];

const DEFAULT_SETTINGS = {
  useLbs          : false,
  darkMode        : true,
  calorieTarget   : 3200,
  proteinTarget   : 160,
  carbTarget      : 400,
  fatTarget       : 80,
  name            : '',
  height          : '',
  dob             : '',
  sex             : 'male',
  currentWeight   : '',
  targetWeight    : '',
  activityLevel   : 'moderate',
  defaultRestSecs : 90,
};

const ACTIVITY_MULTIPLIERS = {
  sedentary  : 1.2,
  light      : 1.375,
  moderate   : 1.55,
  active     : 1.725,
  very_active: 1.9,
};

const KG_TO_LBS = 2.20462;

/* ═══════════════════════════════════════
   2. STATE
═══════════════════════════════════════ */

const state = {
  settings       : { ...DEFAULT_SETTINGS },
  todayDate      : '',          // YYYY-MM-DD — active date on Today tab
  foodDate       : '',          // YYYY-MM-DD — active date on Food tab
  activeTab      : 'today',
  session        : null,        // workout being built in modal
  modalStack     : [],          // open modal id stack
  confirmCb      : null,        // pending confirm callback
  longPressTimer : null,
  charts         : {},          // Chart.js instances keyed by id
  chartRanges    : { bodyweight:'4w', strength:'4w', volume:'8w' },
  strengthExercise: '',
  logFilter      : 'all',
  exerciseFilter : 'All',
  timer: {
    interval  : null,
    remaining : 90,
    initial   : 90,
    running   : false,
  },
  exercisePickerTarget: null,   // exercise block index waiting for picker
  audioCtx     : null,
};

/* ═══════════════════════════════════════
   3. LOCALSTORAGE HELPERS
═══════════════════════════════════════ */

function load(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {
    showToast('Storage full — clear some data in Settings.', '⚠️');
  }
}

function loadSettings() {
  const saved = load(KEYS.settings, {});
  state.settings = { ...DEFAULT_SETTINGS, ...saved };
}

function saveSettings() {
  save(KEYS.settings, state.settings);
}

/* ═══════════════════════════════════════
   4. UTILITY FUNCTIONS
═══════════════════════════════════════ */

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dateStr(d) {                        // Date → 'YYYY-MM-DD'
  return d.toISOString().slice(0, 10);
}

function parseDate(str) {                    // 'YYYY-MM-DD' → local Date
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(str) {
  const d = parseDate(str);
  const today = parseDate(getTodayStr());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (str === dateStr(today))     return 'Today';
  if (str === dateStr(yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
}

function shiftDate(str, days) {
  const d = parseDate(str);
  d.setDate(d.getDate() + days);
  return dateStr(d);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function toDisplayWeight(kg) {
  if (!kg && kg !== 0) return '';
  return state.settings.useLbs
    ? Math.round(kg * KG_TO_LBS * 10) / 10
    : Math.round(kg * 10) / 10;
}

function toStoredWeight(val) {              // input value → kg
  const n = parseFloat(val) || 0;
  return state.settings.useLbs ? n / KG_TO_LBS : n;
}

function weightUnit() {
  return state.settings.useLbs ? 'lbs' : 'kg';
}

function fmtWeight(kg) {
  return `${toDisplayWeight(kg)} ${weightUnit()}`;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function pct(val, total) { return total ? clamp(Math.round((val / total) * 100), 0, 100) : 0; }

function pad2(n) { return String(n).padStart(2, '0'); }

function secsToMMSS(s) { return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; }

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function el(id)  { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function setText(id, text) { const e = el(id); if (e) e.textContent = text; }

/* ═══════════════════════════════════════
   5. TOAST & CONFETTI
═══════════════════════════════════════ */

function showToast(msg, icon = '✓') {
  const t = el('toast');
  el('toast-message').textContent = msg;
  el('toast-icon').textContent = icon;
  t.classList.remove('show');
  void t.offsetWidth;                       // reflow to restart animation
  t.classList.add('show');
}

function launchConfetti() {
  const canvas = el('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#00FF88','#4A9EFF','#FF8C42','#FFD166','#FF6B6B','#B06EFF','#FFFFFF'];
  const pieces = Array.from({ length: 130 }, () => ({
    x  : Math.random() * canvas.width,
    y  : Math.random() * canvas.height - canvas.height,
    w  : Math.random() * 9 + 4,
    h  : Math.random() * 5 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.15,
    vx : (Math.random() - 0.5) * 2.5,
    vy : Math.random() * 4 + 2,
    opacity: 1,
  }));

  let raf;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height * 0.65) p.opacity -= 0.025;
      if (p.opacity > 0) alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (alive) raf = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  raf = requestAnimationFrame(tick);
  setTimeout(() => { cancelAnimationFrame(raf); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);
}

function flashPR(exerciseName) {
  // Glow overlay
  const div = document.createElement('div');
  div.className = 'pr-flash-overlay';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 900);

  // Banner
  const banner = document.createElement('div');
  banner.className = 'pr-banner';
  banner.textContent = `🏆 New PR — ${exerciseName}!`;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3200);

  // Screen-reader announcement
  el('pr-announcer').textContent = `New personal record on ${exerciseName}!`;
  setTimeout(() => { el('pr-announcer').textContent = ''; }, 3000);
}

/* ═══════════════════════════════════════
   6. TAB NAVIGATION
═══════════════════════════════════════ */

function switchTab(targetId) {
  if (state.activeTab === targetId) return;

  const prev = el(`tab-${state.activeTab}`);
  const next = el(targetId);
  if (!next) return;

  // Animate out
  if (prev) {
    prev.classList.add('leaving');
    prev.addEventListener('animationend', () => {
      prev.classList.remove('leaving', 'active');
      prev.hidden = true;
    }, { once: true });
  }

  // Animate in
  next.hidden = false;
  requestAnimationFrame(() => {
    next.classList.add('active');
  });

  // Nav buttons
  qsa('.nav-item').forEach(b => {
    const active = b.dataset.target === targetId;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active);
  });

  state.activeTab = targetId.replace('tab-', '');
  onTabEnter(state.activeTab);
}

function onTabEnter(tab) {
  if (tab === 'today')    renderToday();
  if (tab === 'log')      renderLog();
  if (tab === 'food')     renderFood();
  if (tab === 'progress') renderProgress();
  if (tab === 'settings') renderSettings();
  updateTopBar();
}

/* ═══════════════════════════════════════
   7. TOP BAR
═══════════════════════════════════════ */

function updateTopBar() {
  const today    = getTodayStr();
  const settings = state.settings;
  const foodLog  = load(KEYS.foodLog, []);
  const workouts = load(KEYS.workouts, []);

  // Calories left
  const todayFood  = foodLog.filter(e => e.date === today);
  const consumed   = todayFood.reduce((s, e) => s + (e.calories || 0), 0);
  const calsLeft   = settings.calorieTarget - consumed;
  const tbCal      = el('tb-calories-left');
  if (tbCal) {
    tbCal.textContent = calsLeft >= 0 ? calsLeft : 0;
    tbCal.style.color = calsLeft < 0 ? 'var(--danger)' : '';
  }

  // Protein left
  const proteinConsumed = todayFood.reduce((s, e) => s + (e.protein || 0), 0);
  const proteinLeft = Math.max(0, settings.proteinTarget - proteinConsumed);
  setText('tb-protein-left', `${Math.round(proteinLeft)}g`);

  // Workouts this week
  const weekStart = getWeekStart(today);
  const weekEnd   = shiftDate(weekStart, 6);
  const weekCount = workouts.filter(w => w.date >= weekStart && w.date <= weekEnd).length;
  setText('tb-workouts-week', `${weekCount}×`);

  // Streak
  setText('tb-streak', `${calcStreak(workouts)}🔥`);
}

function getWeekStart(dateStr) {             // Monday of the given date's week
  const d = parseDate(dateStr);
  const day = d.getDay();                    // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return dateStr(d);
}

function calcStreak(workouts) {
  if (!workouts.length) return 0;
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  let cursor = getTodayStr();
  for (const d of dates) {
    if (d === cursor || d === shiftDate(cursor, -1)) {
      streak++;
      cursor = d;
    } else break;
  }
  return streak;
}

/* ═══════════════════════════════════════
   8. TODAY TAB
═══════════════════════════════════════ */

function renderToday() {
  const d = state.todayDate || getTodayStr();
  state.todayDate = d;
  el('today-date-display').textContent = formatDisplayDate(d);

  const foodLog  = load(KEYS.foodLog, []);
  const workouts = load(KEYS.workouts, []);
  const settings = state.settings;

  const entries = foodLog.filter(e => e.date === d);
  const totalCals    = entries.reduce((s,e) => s+(e.calories||0), 0);
  const totalProtein = entries.reduce((s,e) => s+(e.protein||0), 0);
  const totalCarbs   = entries.reduce((s,e) => s+(e.carbs||0), 0);
  const totalFats    = entries.reduce((s,e) => s+(e.fats||0), 0);

  // Macro ring chart
  renderMacroRing(totalProtein, totalCarbs, totalFats);

  setText('today-calories-consumed', Math.round(totalCals));
  setText('today-protein-val',  `${Math.round(totalProtein)}g`);
  setText('today-carbs-val',    `${Math.round(totalCarbs)}g`);
  setText('today-fats-val',     `${Math.round(totalFats)}g`);
  setText('today-protein-target', `/ ${settings.proteinTarget}g`);
  setText('today-carbs-target',   `/ ${settings.carbTarget}g`);
  setText('today-fats-target',    `/ ${settings.fatTarget}g`);
  setText('today-calorie-target-label', `${settings.calorieTarget} kcal goal`);

  // Calorie progress bar
  const calPct = pct(totalCals, settings.calorieTarget);
  const calBar = el('today-calorie-bar');
  calBar.style.width = `${Math.min(calPct, 100)}%`;
  calBar.classList.toggle('over-goal', totalCals > settings.calorieTarget);

  // Calorie goal hit animation
  if (totalCals >= settings.calorieTarget && totalCals < settings.calorieTarget * 1.05) {
    el('today-macro-card').classList.add('goal-hit');
    setTimeout(() => el('today-macro-card').classList.remove('goal-hit'), 1500);
  }

  // Today food list (simple summary)
  const foodList  = el('today-food-items');
  const foodEmpty = el('today-food-empty');
  const foodTotal = el('today-food-totals');
  foodList.innerHTML = '';
  if (entries.length) {
    foodEmpty.hidden = true;
    foodList.hidden  = false;
    foodTotal.hidden = false;
    entries.slice(0, 6).forEach(e => {         // show max 6 on today tab
      foodList.insertAdjacentHTML('beforeend', foodItemHTML(e));
    });
    if (entries.length > 6) {
      foodList.insertAdjacentHTML('beforeend',
        `<li class="food-item" style="justify-content:center;color:var(--text-tertiary);font-size:0.8125rem">
          +${entries.length - 6} more items
        </li>`);
    }
    setText('today-total-kcal', `${Math.round(totalCals)} kcal`);
    setText('today-total-p', `P: ${Math.round(totalProtein)}g`);
    setText('today-total-c', `C: ${Math.round(totalCarbs)}g`);
    setText('today-total-f', `F: ${Math.round(totalFats)}g`);
  } else {
    foodEmpty.hidden = false;
    foodList.hidden  = true;
    foodTotal.hidden = true;
  }

  // Today workout
  const todaySessions = workouts.filter(w => w.date === d);
  const workoutEmpty  = el('today-workout-empty');
  const workoutList   = el('today-workout-list');
  const workoutMeta   = el('today-workout-meta');
  workoutList.innerHTML = '';
  if (todaySessions.length) {
    workoutEmpty.hidden = true;
    workoutList.hidden  = false;
    workoutMeta.hidden  = false;
    todaySessions.forEach(session => {
      session.exercises.forEach(ex => {
        const bestSet = ex.sets.reduce((best, s) =>
          s.weight > (best?.weight||0) ? s : best, null);
        workoutList.insertAdjacentHTML('beforeend', `
          <div class="exercise-summary-item">
            <span class="exercise-summary-name">${ex.name}</span>
            <span class="exercise-summary-sets">${ex.sets.length} sets
              ${bestSet ? `· ${fmtWeight(bestSet.weight)}` : ''}</span>
          </div>`);
      });
    });
    const vol = todaySessions.reduce((s, w) => s + sessionVolume(w), 0);
    setText('today-volume-display', `Vol: ${fmtWeight(vol)}`);
    const dur = todaySessions.reduce((s, w) => s + (w.duration || 0), 0);
    setText('today-duration-display', dur ? `${dur} min` : '');
  } else {
    workoutEmpty.hidden = false;
    workoutList.hidden  = true;
    workoutMeta.hidden  = true;
  }

  // Net calories
  const burned = entries.reduce((s,e) => s+(e.caloriesBurned||0), 0);
  setText('net-consumed', Math.round(totalCals));
  setText('net-burned',   Math.round(burned));
  const net = totalCals - burned;
  const netEl = el('net-total');
  netEl.textContent = Math.round(net);
  netEl.classList.toggle('deficit', net < 0);
}

function renderMacroRing(protein, carbs, fats) {
  const canvas = el('chart-today-macros');
  if (!canvas) return;

  const proteinCals = protein * 4;
  const carbsCals   = carbs   * 4;
  const fatsCals    = fats    * 9;
  const total       = proteinCals + carbsCals + fatsCals || 1;

  const data = {
    labels  : ['Protein', 'Carbs', 'Fats'],
    datasets: [{
      data           : [proteinCals, carbsCals, fatsCals],
      backgroundColor: ['#4A9EFF', '#FF8C42', '#FFD166'],
      borderWidth    : 0,
      hoverOffset    : 4,
    }],
  };

  destroyChart('todayMacros');
  state.charts.todayMacros = new Chart(canvas, {
    type: 'doughnut',
    data,
    options: {
      cutout   : '72%',
      responsive: false,
      animation: { duration: 500 },
      plugins  : { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
}

/* ═══════════════════════════════════════
   9. WORKOUT LOG TAB
═══════════════════════════════════════ */

function renderLog() {
  const workouts = load(KEYS.workouts, []);
  const filter   = state.logFilter;
  const filtered = filter === 'all'
    ? workouts
    : workouts.filter(w => w.category === filter);

  const container = el('log-sessions-container');
  const empty     = el('log-empty-state');

  container.innerHTML = '';

  if (!filtered.length) {
    container.appendChild(empty);
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  // Group by month
  const byMonth = {};
  [...filtered].sort((a,b) => b.date.localeCompare(a.date)).forEach(w => {
    const month = w.date.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(w);
  });

  Object.entries(byMonth).forEach(([month, sessions]) => {
    const [y, m] = month.split('-');
    const label  = new Date(+y, +m-1, 1).toLocaleDateString('en-GB', { month:'long', year:'numeric' });
    container.insertAdjacentHTML('beforeend',
      `<div class="log-month-divider">${label}</div>`);
    sessions.forEach(w => {
      container.insertAdjacentHTML('beforeend', sessionCardHTML(w));
    });
  });

  // Attach long-press on session cards
  setupSessionLongPress();
}

function sessionCardHTML(w) {
  const vol   = sessionVolume(w);
  const tags  = w.exercises.slice(0, 4).map(ex => {
    const pr = ex.sets.some(s => s.isPR);
    return `<span class="exercise-tag${pr?' has-pr':''}">${ex.name}${pr?' 🏆':''}</span>`;
  }).join('');
  const more  = w.exercises.length > 4
    ? `<span class="exercise-tag">+${w.exercises.length-4}</span>` : '';

  return `
  <div class="session-card" data-session-id="${w.id}" data-date="${w.date}">
    <div class="session-card-header">
      <div>
        <div class="session-date">${formatDisplayDate(w.date)}</div>
        <div class="session-title">${w.category} Day</div>
      </div>
      <span class="session-category-badge" data-category="${w.category}">${w.category}</span>
    </div>
    <div class="session-exercise-tags">${tags}${more}</div>
    <div class="session-stats-row">
      <div class="session-stat">📦 <span>${w.exercises.length} exercises</span></div>
      ${vol   ? `<div class="session-stat">⚡ <span>${fmtWeight(vol)}</span></div>` : ''}
      ${w.duration ? `<div class="session-stat">⏱ <span>${w.duration} min</span></div>` : ''}
    </div>
    <div class="session-actions">
      <button class="btn btn-secondary btn-sm" data-action="edit-workout" data-id="${w.id}">Edit</button>
      <button class="btn btn-secondary btn-sm" data-action="open-rest-timer">⏱ Rest</button>
    </div>
  </div>`;
}

function sessionVolume(session) {
  return session.exercises.reduce((total, ex) =>
    total + ex.sets.reduce((s, set) =>
      s + (set.reps || 0) * (set.weight || 0), 0), 0);
}

// ── Open "Add / Edit Workout" modal ──────────────────────────

function openAddWorkoutModal(prefillDate, sessionId) {
  const existing = sessionId
    ? load(KEYS.workouts, []).find(w => w.id === sessionId)
    : null;

  state.session = existing
    ? JSON.parse(JSON.stringify(existing))   // deep clone for editing
    : {
        id       : uid(),
        date     : prefillDate || getTodayStr(),
        category : 'Push',
        duration : '',
        notes    : '',
        exercises: [],
      };

  el('modal-workout-title').textContent = existing ? 'Edit Workout' : 'New Workout';
  el('workout-date').value     = state.session.date;
  el('workout-category').value = state.session.category;
  el('workout-duration').value = state.session.duration || '';
  el('workout-notes').value    = state.session.notes    || '';

  renderSessionExercises();
  openModal('modal-add-workout');
}

function renderSessionExercises() {
  const list  = el('session-exercises-list');
  const empty = el('session-exercises-empty');
  list.innerHTML = '';
  if (!state.session.exercises.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  state.session.exercises.forEach((ex, ei) => {
    list.insertAdjacentHTML('beforeend', exerciseBlockHTML(ex, ei));
  });
}

function exerciseBlockHTML(ex, ei) {
  const setsHTML = ex.sets.map((s, si) => setRowHTML(s, ei, si)).join('');
  return `
  <div class="exercise-block" data-exercise-index="${ei}">
    <div class="exercise-block-header">
      <span class="exercise-chosen-name" data-action="open-exercise-picker" data-exercise-index="${ei}">
        ${ex.name || 'Pick exercise…'}
      </span>
      <span class="exercise-tag" style="margin-left:auto;margin-right:8px"
        data-category-badge="${ei}">${ex.category||''}</span>
      <button class="icon-btn danger small" data-action="remove-exercise" data-index="${ei}" aria-label="Remove exercise">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="sets-list-header">
      <span>SET</span><span>REPS</span><span>WEIGHT</span><span>PR</span><span></span>
    </div>
    <div class="sets-list" id="sets-list-${ei}">${setsHTML}</div>
    <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
      <button class="btn-text accent small" data-action="add-set" data-exercise-index="${ei}">+ Set</button>
      <button class="rest-timer-trigger" data-action="open-rest-timer" aria-label="Start rest timer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Rest
      </button>
    </div>
  </div>`;
}

function setRowHTML(set, ei, si) {
  const w     = toDisplayWeight(set.weight || 0);
  const isPR  = set.isPR;
  return `
  <div class="set-row${isPR?' is-pr':''}" data-exercise-index="${ei}" data-set-index="${si}">
    <span class="set-num">${si + 1}</span>
    <div class="set-input-group">
      <label>Reps</label>
      <div class="stepper">
        <button class="stepper-btn" data-action="decrement" data-field="reps"
          data-ei="${ei}" data-si="${si}">−</button>
        <input class="stepper-input" type="number" inputmode="numeric"
          value="${set.reps || 8}" min="1" max="999"
          data-field="reps" data-ei="${ei}" data-si="${si}" />
        <button class="stepper-btn" data-action="increment" data-field="reps"
          data-ei="${ei}" data-si="${si}">+</button>
      </div>
    </div>
    <div class="set-input-group">
      <label>Wt (${weightUnit()})</label>
      <div class="stepper">
        <button class="stepper-btn" data-action="decrement" data-field="weight"
          data-ei="${ei}" data-si="${si}">−</button>
        <input class="stepper-input" type="number" inputmode="decimal"
          value="${w}" step="2.5"
          data-field="weight" data-ei="${ei}" data-si="${si}" />
        <button class="stepper-btn" data-action="increment" data-field="weight"
          data-ei="${ei}" data-si="${si}">+</button>
      </div>
    </div>
    ${isPR ? '<span class="pr-badge">PR</span>' : '<span></span>'}
    <button class="icon-btn danger small" data-action="remove-set"
      data-ei="${ei}" data-si="${si}" aria-label="Remove set" style="min-width:32px">×</button>
  </div>`;
}

function addExerciseToSession() {
  state.session.exercises.push({ name:'', category:'', sets: [{ reps:8, weight:0, isPR:false }] });
  const idx = state.session.exercises.length - 1;
  renderSessionExercises();
  // Immediately open picker for the new exercise
  state.exercisePickerTarget = idx;
  openModal('modal-exercise-picker');
  renderExercisePicker('All', '');
}

function addSetToExercise(ei) {
  const ex      = state.session.exercises[ei];
  const lastSet = ex.sets[ex.sets.length - 1];
  ex.sets.push({ reps: lastSet?.reps || 8, weight: lastSet?.weight || 0, isPR: false });
  const list = el(`sets-list-${ei}`);
  if (list) {
    const si = ex.sets.length - 1;
    list.insertAdjacentHTML('beforeend', setRowHTML(ex.sets[si], ei, si));
  }
}

function removeExercise(idx) {
  state.session.exercises.splice(idx, 1);
  renderSessionExercises();
}

function removeSet(ei, si) {
  state.session.exercises[ei].sets.splice(si, 1);
  const list = el(`sets-list-${ei}`);
  if (list) {
    list.innerHTML = state.session.exercises[ei].sets
      .map((s, i) => setRowHTML(s, ei, i)).join('');
  }
  // Re-number set labels
  qsa(`[data-exercise-index="${ei}"] .set-num`).forEach((el, i) => {
    el.textContent = i + 1;
  });
}

// Sync stepper input → state.session
function stepperChange(field, ei, si, delta) {
  const ex  = state.session.exercises[ei];
  const set = ex.sets[si];
  if (field === 'reps') {
    set.reps = Math.max(1, (set.reps || 0) + delta);
  } else {
    const step = state.settings.useLbs ? 5 : 2.5;
    const cur  = toDisplayWeight(set.weight || 0);
    const next = Math.max(0, cur + delta * step);
    set.weight = toStoredWeight(next);
  }
  // Update the input value
  const row = qs(`.set-row[data-exercise-index="${ei}"][data-set-index="${si}"]`);
  if (row) {
    const inp = row.querySelector(`[data-field="${field}"]`);
    if (inp) inp.value = field === 'weight' ? toDisplayWeight(set.weight) : set.reps;
  }
}

function syncSetFromInput(field, ei, si, value) {
  const set = state.session.exercises[ei].sets[si];
  if (field === 'reps') {
    set.reps = parseInt(value) || 0;
  } else {
    set.weight = toStoredWeight(value);
  }
}

// ── PR Detection ──────────────────────────────────────────────

function getExerciseHistory(name) {
  const workouts = load(KEYS.workouts, []);
  const sets = [];
  workouts.forEach(w => {
    w.exercises.filter(ex => ex.name === name).forEach(ex => {
      ex.sets.forEach(s => sets.push({ weight: s.weight, reps: s.reps, date: w.date }));
    });
  });
  return sets;
}

function detectPR(name, weight, reps) {
  const history = getExerciseHistory(name);
  if (!history.length) return true;            // first ever log = PR
  const bestWeight = Math.max(...history.map(s => s.weight || 0));
  return weight > bestWeight;
}

// ── Save Workout ──────────────────────────────────────────────

function syncSessionFromDOM() {
  state.session.date     = el('workout-date').value     || getTodayStr();
  state.session.category = el('workout-category').value || 'Push';
  state.session.duration = parseInt(el('workout-duration').value) || 0;
  state.session.notes    = el('workout-notes').value    || '';

  // Read every stepper input value back into state
  state.session.exercises.forEach((ex, ei) => {
    ex.sets.forEach((set, si) => {
      const row = qs(`.set-row[data-exercise-index="${ei}"][data-set-index="${si}"]`);
      if (!row) return;
      const repsInp   = row.querySelector('[data-field="reps"]');
      const weightInp = row.querySelector('[data-field="weight"]');
      if (repsInp)   set.reps   = parseInt(repsInp.value)   || 0;
      if (weightInp) set.weight = toStoredWeight(weightInp.value);
    });
  });
}

function saveWorkout() {
  syncSessionFromDOM();

  if (!state.session.exercises.length) {
    showToast('Add at least one exercise first.', '⚠️');
    el('session-exercises-list').classList.add('shake');
    setTimeout(() => el('session-exercises-list').classList.remove('shake'), 450);
    return;
  }

  // PR detection — run before saving old record
  const newPRs = [];
  state.session.exercises.forEach(ex => {
    if (!ex.name) return;
    ex.sets.forEach(set => {
      if (set.weight > 0 && detectPR(ex.name, set.weight, set.reps)) {
        set.isPR = true;
        if (!newPRs.includes(ex.name)) newPRs.push(ex.name);
      } else {
        set.isPR = false;
      }
    });
  });

  const workouts = load(KEYS.workouts, []);
  const idx      = workouts.findIndex(w => w.id === state.session.id);
  if (idx >= 0) workouts[idx] = state.session;
  else          workouts.push(state.session);
  save(KEYS.workouts, workouts);

  closeModal();
  showToast('Workout saved!', '✓');

  if (newPRs.length) {
    newPRs.forEach(name => flashPR(name));
  }

  // Streak milestone confetti
  const streak = calcStreak(load(KEYS.workouts, []));
  if ([7, 14, 30, 60, 100].includes(streak)) launchConfetti();

  renderLog();
  renderToday();
  updateTopBar();
}

function duplicateLastWorkout() {
  const workouts = load(KEYS.workouts, []);
  if (!workouts.length) { showToast('No previous workout to copy.', '⚠️'); return; }
  const last = [...workouts].sort((a,b) => b.date.localeCompare(a.date))[0];
  const copy = JSON.parse(JSON.stringify(last));
  copy.id   = uid();
  copy.date = el('workout-date').value || getTodayStr();
  copy.exercises.forEach(ex => ex.sets.forEach(s => { s.isPR = false; }));
  state.session = copy;
  el('workout-category').value = copy.category;
  el('workout-duration').value = copy.duration || '';
  el('workout-notes').value    = copy.notes    || '';
  renderSessionExercises();
  showToast('Last workout duplicated!', '📋');
}

function deleteWorkout(id) {
  const workouts = load(KEYS.workouts, []).filter(w => w.id !== id);
  save(KEYS.workouts, workouts);
  showToast('Workout deleted.', '🗑');
  renderLog();
  renderToday();
  updateTopBar();
}

/* ═══════════════════════════════════════
   10. EXERCISE PICKER MODAL
═══════════════════════════════════════ */

function renderExercisePicker(categoryFilter, searchQuery) {
  const library = [
    ...EXERCISE_LIBRARY,
    ...load(KEYS.foodLibrary, [])
      .filter(f => f._isExercise)
      .map(f => ({ name: f.name, category: 'Custom' })),
  ];

  const q = (searchQuery || '').toLowerCase();
  const filtered = library.filter(ex => {
    const matchCat    = categoryFilter === 'All' || ex.category === categoryFilter;
    const matchSearch = !q || ex.name.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const list = el('exercise-picker-list');
  list.innerHTML = '';

  if (!filtered.length) {
    list.insertAdjacentHTML('beforeend',
      `<li style="padding:24px;text-align:center;color:var(--text-tertiary)">No exercises found</li>`);
    return;
  }

  filtered.forEach(ex => {
    list.insertAdjacentHTML('beforeend', `
      <li class="picker-item" role="option" tabindex="0"
          data-action="select-exercise" data-name="${ex.name}" data-category="${ex.category}">
        <span class="picker-item-name">${ex.name}</span>
        <span class="picker-item-cat" data-cat="${ex.category}">${ex.category}</span>
      </li>`);
  });
}

function selectExercise(name, category) {
  const idx = state.exercisePickerTarget;
  if (idx === null || idx === undefined) return;
  const ex   = state.session.exercises[idx];
  ex.name     = name;
  ex.category = category;
  closeModal();
  // Refresh exercise block name
  const block = qs(`[data-exercise-index="${idx}"]`);
  if (block) {
    const nameEl = block.querySelector('.exercise-chosen-name');
    if (nameEl) nameEl.textContent = name;
    const catEl  = block.querySelector('[data-category-badge]');
    if (catEl)  catEl.textContent = category;
  }
  state.exercisePickerTarget = null;
}

function addCustomExercise() {
  const input = el('custom-exercise-name');
  const name  = input.value.trim();
  if (!name) return;
  selectExercise(name, 'Custom');
  input.value = '';
}

/* ═══════════════════════════════════════
   11. REST TIMER
═══════════════════════════════════════ */

function openRestTimer() {
  renderTimerDisplay(state.timer.remaining);
  openModal('modal-rest-timer');
  syncTimerPresetButtons(state.timer.initial);
}

function setTimerDuration(secs) {
  state.timer.initial   = secs;
  state.timer.remaining = secs;
  state.timer.running   = false;
  clearInterval(state.timer.interval);
  renderTimerDisplay(secs);
  updateTimerRing(1);
  el('timer-start-btn').textContent = 'Start';
  el('timer-start-btn').dataset.state = 'stopped';
  syncTimerPresetButtons(secs);
}

function toggleTimer() {
  if (state.timer.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (state.timer.remaining <= 0) {
    state.timer.remaining = state.timer.initial;
  }
  state.timer.running = true;
  el('timer-start-btn').textContent    = 'Pause';
  el('timer-start-btn').dataset.state  = 'running';
  showTimerChip();

  state.timer.interval = setInterval(() => {
    state.timer.remaining--;
    renderTimerDisplay(state.timer.remaining);
    updateTimerRing(state.timer.remaining / state.timer.initial);

    // Almost done (≤5s): ring turns red
    const ring = el('timer-ring-progress');
    ring.classList.toggle('almost-done', state.timer.remaining <= 5);

    if (state.timer.remaining <= 0) {
      timerDone();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.timer.interval);
  state.timer.running = false;
  el('timer-start-btn').textContent   = 'Resume';
  el('timer-start-btn').dataset.state = 'stopped';
}

function resetTimer() {
  clearInterval(state.timer.interval);
  state.timer.running   = false;
  state.timer.remaining = state.timer.initial;
  renderTimerDisplay(state.timer.initial);
  updateTimerRing(1);
  el('timer-start-btn').textContent   = 'Start';
  el('timer-start-btn').dataset.state = 'stopped';
  el('timer-ring-progress').classList.remove('almost-done');
}

function timerDone() {
  clearInterval(state.timer.interval);
  state.timer.running   = false;
  state.timer.remaining = 0;
  playBeep();
  showToast('Rest done — go! 💪', '⏱');
  el('timer-start-btn').textContent   = 'Start';
  el('timer-start-btn').dataset.state = 'stopped';
  el('timer-ring-progress').classList.remove('almost-done');
  hideTimerChip();
}

function renderTimerDisplay(secs) {
  const s = Math.max(0, secs);
  setText('timer-minutes', pad2(Math.floor(s / 60)));
  setText('timer-seconds', pad2(s % 60));
  setText('timer-chip-display', secsToMMSS(s));
}

function updateTimerRing(fraction) {
  const ring          = el('timer-ring-progress');
  if (!ring) return;
  const circumference = 2 * Math.PI * 54;          // r=54 from SVG
  ring.style.strokeDashoffset = circumference * (1 - clamp(fraction, 0, 1));
}

function showTimerChip() {
  const chip = el('timer-chip');
  chip.hidden = false;
}
function hideTimerChip() {
  const chip = el('timer-chip');
  chip.hidden = true;
}
function stopTimerChip() {
  clearInterval(state.timer.interval);
  state.timer.running = false;
  hideTimerChip();
  if (el('timer-start-btn')) {
    el('timer-start-btn').textContent   = 'Start';
    el('timer-start-btn').dataset.state = 'stopped';
  }
}

function syncTimerPresetButtons(secs) {
  qsa('.timer-preset-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.seconds) === secs);
  });
}

// Web Audio API beep sequence
function playBeep() {
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audioCtx;
    [0, 0.22, 0.44].forEach(offset => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = offset === 0.44 ? 1046 : 880;
      osc.type            = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + offset);
      gain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.35);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime  + offset + 0.4);
    });
  } catch (e) { /* Audio unavailable */ }
}

/* ═══════════════════════════════════════
   12. FOOD TAB
═══════════════════════════════════════ */

function renderFood() {
  const d = state.foodDate || getTodayStr();
  state.foodDate = d;
  el('food-date-display').textContent = formatDisplayDate(d);

  const foodLog = load(KEYS.foodLog, []);
  const entries = foodLog.filter(e => e.date === d);

  const totalCals    = entries.reduce((s,e) => s+(e.calories||0), 0);
  const totalProtein = entries.reduce((s,e) => s+(e.protein||0), 0);
  const totalCarbs   = entries.reduce((s,e) => s+(e.carbs||0), 0);
  const totalFats    = entries.reduce((s,e) => s+(e.fats||0), 0);

  setText('food-summary-kcal',    Math.round(totalCals));
  setText('food-summary-protein', `${Math.round(totalProtein)}g`);
  setText('food-summary-carbs',   `${Math.round(totalCarbs)}g`);
  setText('food-summary-fats',    `${Math.round(totalFats)}g`);

  const calBar = el('food-calorie-bar');
  calBar.style.width = `${Math.min(pct(totalCals, state.settings.calorieTarget), 100)}%`;
  calBar.classList.toggle('over-goal', totalCals > state.settings.calorieTarget);

  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  meals.forEach(meal => {
    const mealEntries = entries.filter(e => e.meal === meal);
    const list        = el(`meal-list-${meal}`);
    const kcalEl      = el(`meal-kcal-${meal}`);
    list.innerHTML    = '';
    const mealCals    = mealEntries.reduce((s,e) => s+(e.calories||0), 0);
    if (kcalEl) kcalEl.textContent = mealCals ? `${Math.round(mealCals)} kcal` : '';

    mealEntries.forEach(entry => {
      const li = document.createElement('li');
      li.className      = 'food-item';
      li.dataset.foodId = entry.id;
      li.innerHTML = `
        <div style="flex:1">
          <div class="food-item-name">${entry.name}</div>
          <div class="food-item-macros">
            <span class="p">P:${Math.round(entry.protein||0)}g</span>
            <span class="c">C:${Math.round(entry.carbs||0)}g</span>
            <span class="f">F:${Math.round(entry.fats||0)}g</span>
          </div>
        </div>
        <span class="food-item-kcal">${Math.round(entry.calories||0)}</span>`;
      list.appendChild(li);
    });
  });

  // Empty state
  const hasAny = entries.length > 0;
  const emptyEl = el('food-diary-empty');
  if (emptyEl) emptyEl.hidden = hasAny;

  setupFoodLongPress();
}

function foodItemHTML(entry) {
  return `
  <li class="food-item" data-food-id="${entry.id}">
    <div style="flex:1">
      <div class="food-item-name">${entry.name}</div>
      <div class="food-item-macros">
        <span class="p">P:${Math.round(entry.protein||0)}g</span>
        <span class="c">C:${Math.round(entry.carbs||0)}g</span>
        <span class="f">F:${Math.round(entry.fats||0)}g</span>
      </div>
    </div>
    <span class="food-item-kcal">${Math.round(entry.calories||0)}</span>
  </li>`;
}

function openAddFoodModal(meal, prefillData) {
  el('food-name-input').value     = prefillData?.name     || '';
  el('food-calories').value       = prefillData?.calories || '';
  el('food-protein').value        = prefillData?.protein  || '';
  el('food-carbs').value          = prefillData?.carbs    || '';
  el('food-fats').value           = prefillData?.fats     || '';
  el('food-meal-select').value    = meal || 'dinner';
  el('food-save-to-library').checked = false;
  el('food-autocomplete').hidden  = true;
  openModal('modal-add-food');
}

function saveFoodEntry() {
  const name     = el('food-name-input').value.trim();
  const calories = parseFloat(el('food-calories').value) || 0;
  const protein  = parseFloat(el('food-protein').value)  || 0;
  const carbs    = parseFloat(el('food-carbs').value)    || 0;
  const fats     = parseFloat(el('food-fats').value)     || 0;
  const meal     = el('food-meal-select').value || 'dinner';

  if (!name) {
    el('food-name-input').classList.add('shake');
    setTimeout(() => el('food-name-input').classList.remove('shake'), 450);
    showToast('Enter a food name first.', '⚠️');
    return;
  }

  const entry = {
    id      : uid(),
    date    : state.foodDate || getTodayStr(),
    meal,
    name,
    calories,
    protein,
    carbs,
    fats,
  };

  const foodLog = load(KEYS.foodLog, []);
  foodLog.push(entry);
  save(KEYS.foodLog, foodLog);

  // Save to personal library if requested
  if (el('food-save-to-library').checked && name) {
    const lib = load(KEYS.foodLibrary, []);
    if (!lib.find(f => f.name.toLowerCase() === name.toLowerCase())) {
      lib.push({ id: uid(), name, calories, protein, carbs, fats });
      save(KEYS.foodLibrary, lib);
    }
  }

  closeModal();
  showToast(`${name} added!`, '✓');

  const totalCals = load(KEYS.foodLog,[])
    .filter(e => e.date === entry.date)
    .reduce((s,e) => s+(e.calories||0), 0);
  if (totalCals >= state.settings.calorieTarget) {
    showToast('🎉 Calorie goal reached!', '🎯');
  }

  renderFood();
  if (state.activeTab === 'today') renderToday();
  updateTopBar();
}

function deleteFoodEntry(id) {
  const log = load(KEYS.foodLog, []).filter(e => e.id !== id);
  save(KEYS.foodLog, log);
  showToast('Food entry removed.', '🗑');
  renderFood();
  if (state.activeTab === 'today') renderToday();
  updateTopBar();
}

function copyYesterdayMeals() {
  const today     = state.foodDate || getTodayStr();
  const yesterday = shiftDate(today, -1);
  const log       = load(KEYS.foodLog, []);
  const yEntries  = log.filter(e => e.date === yesterday);

  if (!yEntries.length) {
    showToast('No meals logged yesterday.', '⚠️');
    return;
  }

  const hasToday = log.some(e => e.date === today);
  if (hasToday) {
    openConfirm(
      'This will add yesterday\'s meals on top of today\'s. Continue?',
      () => doCopyMeals(yEntries, today, log)
    );
  } else {
    doCopyMeals(yEntries, today, log);
  }
}

function doCopyMeals(entries, targetDate, log) {
  const copies = entries.map(e => ({ ...e, id: uid(), date: targetDate }));
  save(KEYS.foodLog, [...log, ...copies]);
  showToast(`${copies.length} meals copied!`, '📋');
  renderFood();
  if (state.activeTab === 'today') renderToday();
  updateTopBar();
}

/* ═══════════════════════════════════════
   13. FOOD AUTOCOMPLETE
═══════════════════════════════════════ */

function setupFoodAutocomplete() {
  const input   = el('food-name-input');
  const listEl  = el('food-autocomplete');
  if (!input || !listEl) return;

  const onInput = debounce(() => {
    const q   = input.value.trim().toLowerCase();
    const lib = [...PRESET_FOODS, ...load(KEYS.foodLibrary, [])];
    const matches = q.length < 1
      ? []
      : lib.filter(f => f.name.toLowerCase().includes(q)).slice(0, 8);

    listEl.innerHTML = '';
    if (!matches.length) { listEl.hidden = true; return; }

    matches.forEach(f => {
      listEl.insertAdjacentHTML('beforeend', `
        <li class="autocomplete-item" data-action="autocomplete-select"
            data-preset-name="${f.name}"
            data-calories="${f.calories}" data-protein="${f.protein}"
            data-carbs="${f.carbs}"     data-fats="${f.fats}">
          <span class="autocomplete-item-name">${f.name}</span>
          <span class="autocomplete-item-meta">${f.calories} kcal · P${f.protein}g</span>
        </li>`);
    });
    listEl.hidden = false;
  }, 180);

  input.addEventListener('input', onInput);
  input.addEventListener('blur', () => setTimeout(() => { listEl.hidden = true; }, 200));
}

function fillFoodFromPreset(name, calories, protein, carbs, fats) {
  el('food-name-input').value = name;
  el('food-calories').value   = calories;
  el('food-protein').value    = protein;
  el('food-carbs').value      = carbs;
  el('food-fats').value       = fats;
  el('food-autocomplete').hidden = true;
}

/* ═══════════════════════════════════════
   14. CARDIO BURN
═══════════════════════════════════════ */

function openCardioBurnModal() {
  el('cardio-activity').value  = '';
  el('cardio-kcal').value      = '';
  el('cardio-duration').value  = '';
  openModal('modal-cardio-burn');
}

function saveCardioBurn() {
  const activity      = el('cardio-activity').value.trim() || 'Cardio';
  const caloriesBurned= parseFloat(el('cardio-kcal').value)     || 0;
  const duration      = parseFloat(el('cardio-duration').value) || 0;

  if (!caloriesBurned) {
    showToast('Enter calories burned.', '⚠️');
    return;
  }

  const entry = {
    id           : uid(),
    date         : state.todayDate || getTodayStr(),
    meal         : 'burn',
    name         : `${activity} (burn)`,
    calories     : 0,
    protein      : 0,
    carbs        : 0,
    fats         : 0,
    caloriesBurned,
    duration,
    _isBurn      : true,
  };

  const log = load(KEYS.foodLog, []);
  log.push(entry);
  save(KEYS.foodLog, log);

  closeModal();
  showToast(`${Math.round(caloriesBurned)} kcal burn logged!`, '🔥');
  renderToday();
  updateTopBar();
}

/* ═══════════════════════════════════════
   15. PROGRESS TAB & CHARTS
═══════════════════════════════════════ */

function renderProgress() {
  renderWeeklyAverages();
  renderMonthlySummary();
  renderBodyweightChart();
  renderStrengthChart();
  renderVolumeChart();
  renderCaloriesChart();
  populateStrengthSelect();
}

// ── 7-day averages ────────────────────────────────────────────

function renderWeeklyAverages() {
  const today    = getTodayStr();
  const foodLog  = load(KEYS.foodLog, []);
  const workouts = load(KEYS.workouts, []);
  let totalCals = 0, totalProtein = 0, totalVol = 0, days = 0;

  for (let i = 0; i < 7; i++) {
    const d       = shiftDate(today, -i);
    const entries = foodLog.filter(e => e.date === d && !e._isBurn);
    if (entries.length) {
      totalCals    += entries.reduce((s,e) => s+(e.calories||0), 0);
      totalProtein += entries.reduce((s,e) => s+(e.protein||0), 0);
      days++;
    }
    const daySessions = workouts.filter(w => w.date === d);
    totalVol += daySessions.reduce((s, w) => s + sessionVolume(w), 0);
  }

  const weekWorkouts = workouts.filter(w => w.date >= shiftDate(today,-6) && w.date <= today).length;
  setText('avg-calories', days ? Math.round(totalCals / days) : '—');
  setText('avg-protein',  days ? `${Math.round(totalProtein / days)}g` : '—');
  setText('avg-workouts', weekWorkouts);
  setText('avg-volume',   totalVol > 0 ? fmtWeight(totalVol / 7) : '—');
}

// ── Monthly summary ───────────────────────────────────────────

function renderMonthlySummary() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const monthStart = `${y}-${m}-01`;
  const monthEnd   = `${y}-${m}-31`;

  const workouts = load(KEYS.workouts, []).filter(w => w.date >= monthStart && w.date <= monthEnd);
  const foodLog  = load(KEYS.foodLog,  []).filter(e => e.date >= monthStart && e.date <= monthEnd && !e._isBurn);

  const totalWorkouts = workouts.length;
  const days          = [...new Set(foodLog.map(e => e.date))].length;
  const avgCals       = days ? Math.round(foodLog.reduce((s,e)=>s+(e.calories||0),0) / days) : 0;

  // Best lift (highest weight in any set)
  let bestLiftName = '—', bestWeight = 0;
  workouts.forEach(w => w.exercises.forEach(ex => ex.sets.forEach(s => {
    if ((s.weight || 0) > bestWeight) { bestWeight = s.weight; bestLiftName = ex.name; }
  })));

  const totalVol = workouts.reduce((s, w) => s + sessionVolume(w), 0);

  const monthLabel = now.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
  setText('monthly-label',       monthLabel);
  setText('monthly-workouts',    totalWorkouts);
  setText('monthly-avg-kcal',    avgCals || '—');
  setText('monthly-best-lift',   bestWeight ? `${fmtWeight(bestWeight)}` : '—');
  setText('monthly-total-volume',totalVol > 0 ? fmtWeight(totalVol) : '—');
}

// ── Bodyweight chart ──────────────────────────────────────────

function renderBodyweightChart() {
  const all    = load(KEYS.bodyweight, []).sort((a,b) => a.date.localeCompare(b.date));
  const range  = state.chartRanges.bodyweight;
  const cutoff = rangeCutoff(range);
  const data   = all.filter(e => e.date >= cutoff);

  const emptyEl = el('bodyweight-chart-empty');
  const canvas  = el('chart-bodyweight');

  if (!data.length) {
    emptyEl.classList.add('visible');
    canvas.style.display = 'none';
    return;
  }
  emptyEl.classList.remove('visible');
  canvas.style.display = 'block';

  destroyChart('bodyweight');
  state.charts.bodyweight = new Chart(canvas, {
    type: 'line',
    data: {
      labels  : data.map(e => shortDate(e.date)),
      datasets: [{
        label          : `Weight (${weightUnit()})`,
        data           : data.map(e => Math.round(toDisplayWeight(e.weight) * 10) / 10),
        borderColor    : '#00FF88',
        backgroundColor: 'rgba(0,255,136,0.08)',
        pointBackgroundColor: '#00FF88',
        pointRadius    : 4,
        pointHoverRadius: 6,
        tension        : 0.35,
        fill           : true,
      }],
    },
    options: chartOptions(`Weight (${weightUnit()})`),
  });
}

// ── Strength progress chart ───────────────────────────────────

function populateStrengthSelect() {
  const sel      = el('strength-exercise-select');
  const workouts = load(KEYS.workouts, []);
  const names    = [...new Set(workouts.flatMap(w => w.exercises.map(ex => ex.name)))].sort();

  sel.innerHTML = '<option value="">Select exercise…</option>';
  names.forEach(n => {
    const opt = document.createElement('option');
    opt.value       = n;
    opt.textContent = n;
    if (n === state.strengthExercise) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderStrengthChart() {
  const name    = state.strengthExercise;
  const empty   = el('strength-chart-empty');
  const canvas  = el('chart-strength');

  if (!name) {
    empty.classList.add('visible');
    canvas.style.display = 'none';
    return;
  }

  const workouts = load(KEYS.workouts, []).sort((a,b) => a.date.localeCompare(b.date));
  const cutoff   = rangeCutoff(state.chartRanges.strength);
  const points   = [];

  workouts.filter(w => w.date >= cutoff).forEach(w => {
    w.exercises.filter(ex => ex.name === name).forEach(ex => {
      const best = ex.sets.reduce((b, s) => (s.weight||0) > (b?.weight||0) ? s : b, null);
      if (best) points.push({ date: w.date, weight: best.weight });
    });
  });

  if (!points.length) {
    empty.classList.add('visible');
    canvas.style.display = 'none';
    destroyChart('strength');
    return;
  }
  empty.classList.remove('visible');
  canvas.style.display = 'block';

  destroyChart('strength');
  state.charts.strength = new Chart(canvas, {
    type: 'line',
    data: {
      labels  : points.map(p => shortDate(p.date)),
      datasets: [{
        label          : `${name} (${weightUnit()})`,
        data           : points.map(p => Math.round(toDisplayWeight(p.weight)*10)/10),
        borderColor    : '#4A9EFF',
        backgroundColor: 'rgba(74,158,255,0.08)',
        pointBackgroundColor: '#4A9EFF',
        pointRadius    : 4,
        pointHoverRadius: 6,
        tension        : 0.3,
        fill           : true,
      }],
    },
    options: chartOptions(`${name} best set (${weightUnit()})`),
  });
}

// ── Weekly volume bar chart ───────────────────────────────────

function renderVolumeChart() {
  const weeks   = state.chartRanges.volume === '8w' ? 8 : 16;
  const today   = getTodayStr();
  const workouts= load(KEYS.workouts, []);
  const labels  = [], volumes = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd   = shiftDate(today, -(i * 7));
    const weekStart = shiftDate(weekEnd, -6);
    const label     = shortDate(weekStart);
    const vol       = workouts
      .filter(w => w.date >= weekStart && w.date <= weekEnd)
      .reduce((s, w) => s + sessionVolume(w), 0);
    labels.push(label);
    volumes.push(Math.round(toDisplayWeight(vol)));
  }

  const empty  = el('volume-chart-empty');
  const canvas = el('chart-volume');

  if (volumes.every(v => v === 0)) {
    empty.classList.add('visible');
    canvas.style.display = 'none';
    return;
  }
  empty.classList.remove('visible');
  canvas.style.display = 'block';

  destroyChart('volume');
  state.charts.volume = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets:[{
        label          : `Weekly Volume (${weightUnit()})`,
        data           : volumes,
        backgroundColor: 'rgba(0,255,136,0.55)',
        borderColor    : '#00FF88',
        borderWidth    : 1,
        borderRadius   : 6,
      }],
    },
    options: chartOptions(`Volume (${weightUnit()})`),
  });
}

// ── 14-day calorie bar chart ──────────────────────────────────

function renderCaloriesChart() {
  const today   = getTodayStr();
  const foodLog = load(KEYS.foodLog, []);
  const labels  = [], cals = [];

  for (let i = 13; i >= 0; i--) {
    const d       = shiftDate(today, -i);
    const entries = foodLog.filter(e => e.date === d && !e._isBurn);
    labels.push(shortDate(d));
    cals.push(Math.round(entries.reduce((s,e)=>s+(e.calories||0), 0)));
  }

  const empty  = el('calories-chart-empty');
  const canvas = el('chart-calories');

  if (cals.every(c => c === 0)) {
    empty.classList.add('visible');
    canvas.style.display = 'none';
    return;
  }
  empty.classList.remove('visible');
  canvas.style.display = 'block';

  const target = state.settings.calorieTarget;
  destroyChart('calories');
  state.charts.calories = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets:[
        {
          label          : 'Calories',
          data           : cals,
          backgroundColor: cals.map(c => c > target ? 'rgba(255,71,87,0.6)' : 'rgba(74,158,255,0.6)'),
          borderColor    : cals.map(c => c > target ? '#FF4757' : '#4A9EFF'),
          borderWidth    : 1,
          borderRadius   : 6,
        },
        {
          label    : 'Target',
          data     : Array(14).fill(target),
          type     : 'line',
          borderColor    : 'rgba(0,255,136,0.6)',
          borderDash     : [4, 4],
          borderWidth    : 2,
          pointRadius    : 0,
          fill           : false,
        },
      ],
    },
    options: chartOptions('kcal'),
  });
}

// ── Chart helpers ─────────────────────────────────────────────

function destroyChart(key) {
  if (state.charts[key]) {
    state.charts[key].destroy();
    delete state.charts[key];
  }
}

function chartOptions(yLabel) {
  const isDark = state.settings.darkMode;
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const textColor = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.5)';
  return {
    responsive         : true,
    maintainAspectRatio: false,
    animation          : { duration: 400 },
    plugins: {
      legend : { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1A1A1F' : '#FFFFFF',
        titleColor     : isDark ? '#FFF'    : '#000',
        bodyColor      : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
        borderColor    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth    : 1,
        padding        : 10,
        cornerRadius   : 8,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 10 }, maxRotation: 0 },
        grid : { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { size: 10 } },
        grid : { color: gridColor },
        title: { display: false },
      },
    },
  };
}

function rangeCutoff(range) {
  const today = getTodayStr();
  const days  = range === '4w' ? 28 : range === '3m' ? 90 : range === '16w' ? 112 : 999;
  return shiftDate(today, -days);
}

function shortDate(str) {
  const d = parseDate(str);
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}

/* ═══════════════════════════════════════
   16. SETTINGS TAB
═══════════════════════════════════════ */

function renderSettings() {
  const s = state.settings;
  const fields = [
    'name','height','dob','sex','activityLevel',
    'calorieTarget','proteinTarget','carbTarget','fatTarget',
  ];
  fields.forEach(key => {
    const el_ = qs(`[data-setting="${key}"]`);
    if (el_) el_.value = s[key] ?? '';
  });

  // Weight fields (convert to display unit)
  const cwEl = el('settings-current-weight');
  const twEl = el('settings-target-weight');
  if (cwEl) cwEl.value = s.currentWeight ? toDisplayWeight(s.currentWeight) : '';
  if (twEl) twEl.value = s.targetWeight  ? toDisplayWeight(s.targetWeight)  : '';

  // Unit badge labels
  qsa('[data-unit-display="weight"]').forEach(e => { e.textContent = weightUnit(); });

  // Toggles
  const darkToggle = el('toggle-dark-mode');
  const lbsToggle  = el('toggle-unit-lbs');
  if (darkToggle) darkToggle.checked = s.darkMode;
  if (lbsToggle)  lbsToggle.checked  = s.useLbs;

  // Targets
  const ids = ['target-calories','target-protein','target-carbs','target-fats'];
  const keys= ['calorieTarget','proteinTarget','carbTarget','fatTarget'];
  ids.forEach((id,i) => { const e=el(id); if(e) e.value = s[keys[i]] ?? ''; });

  recalcBMITDEE();
}

function saveProfile() {
  const s    = state.settings;
  s.name     = el('settings-name')?.value.trim() || s.name;
  s.height   = parseFloat(el('settings-height')?.value) || s.height;
  s.dob      = el('settings-dob')?.value    || s.dob;
  s.sex      = el('settings-sex')?.value    || s.sex;
  s.activityLevel = el('settings-activity')?.value || s.activityLevel;

  const cwVal = el('settings-current-weight')?.value;
  const twVal = el('settings-target-weight')?.value;
  if (cwVal) s.currentWeight = toStoredWeight(cwVal);
  if (twVal) s.targetWeight  = toStoredWeight(twVal);

  saveSettings();
  recalcBMITDEE();
  showToast('Profile saved!', '✓');
}

function saveTargets() {
  const s = state.settings;
  s.calorieTarget = parseInt(el('target-calories')?.value) || s.calorieTarget;
  s.proteinTarget = parseInt(el('target-protein')?.value)  || s.proteinTarget;
  s.carbTarget    = parseInt(el('target-carbs')?.value)    || s.carbTarget;
  s.fatTarget     = parseInt(el('target-fats')?.value)     || s.fatTarget;
  saveSettings();
  showToast('Targets updated!', '✓');
  updateTopBar();
}

function saveMeasurements() {
  const fields = ['chest','waist','hips','arms','thighs'];
  const record = { date: getTodayStr() };
  fields.forEach(f => {
    const inp = qs(`[data-measurement="${f}"]`);
    if (inp && inp.value) record[f] = parseFloat(inp.value);
  });
  const log = load(KEYS.measurements, []);
  const idx = log.findIndex(m => m.date === record.date);
  if (idx >= 0) log[idx] = { ...log[idx], ...record };
  else          log.push(record);
  save(KEYS.measurements, log);
  showToast('Measurements saved!', '📏');
}

function setDarkMode(enabled) {
  document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
  state.settings.darkMode = enabled;
  saveSettings();
  // Rebuild charts with correct colors
  if (state.activeTab === 'progress') renderProgress();
}

function setUnit(useLbs) {
  state.settings.useLbs = useLbs;
  saveSettings();
  showToast(`Switched to ${useLbs ? 'lbs' : 'kg'}`, '⚖️');
  qsa('[data-unit-display="weight"]').forEach(e => { e.textContent = weightUnit(); });
  if (state.activeTab === 'progress') renderProgress();
  if (state.activeTab === 'today')    renderToday();
  updateTopBar();
}

/* ═══════════════════════════════════════
   17. BMI / TDEE CALCULATOR
═══════════════════════════════════════ */

function recalcBMITDEE() {
  const s = state.settings;
  if (!s.height || !s.currentWeight) {
    setText('display-bmi',  '—');
    setText('display-tdee', '—');
    setText('display-bmi-cat', '');
    return;
  }

  const heightM = s.height / 100;
  const weightKg= s.currentWeight;
  const bmi     = weightKg / (heightM * heightM);

  let bmiCat = '', bmiClass = '';
  if      (bmi < 18.5) { bmiCat = 'Underweight'; bmiClass = 'underweight'; }
  else if (bmi < 25)   { bmiCat = 'Normal';       bmiClass = 'normal'; }
  else if (bmi < 30)   { bmiCat = 'Overweight';   bmiClass = 'overweight'; }
  else                  { bmiCat = 'Obese';        bmiClass = 'obese'; }

  setText('display-bmi', bmi.toFixed(1));
  const catEl = el('display-bmi-cat');
  if (catEl) { catEl.textContent = bmiCat; catEl.className = `bmi-cat ${bmiClass}`; }

  // Mifflin-St Jeor BMR
  let age = 25;
  if (s.dob) {
    const born = new Date(s.dob);
    age = Math.floor((Date.now() - born) / (365.25 * 24 * 3600 * 1000));
  }
  const bmr = s.sex === 'female'
    ? 10 * weightKg + 6.25 * s.height - 5 * age - 161
    : 10 * weightKg + 6.25 * s.height - 5 * age + 5;

  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[s.activityLevel] || 1.55));
  setText('display-tdee', tdee);
}

/* ═══════════════════════════════════════
   18. EXPORT / IMPORT
═══════════════════════════════════════ */

function exportJSON() {
  const data = {
    exported   : new Date().toISOString(),
    version    : '1.0.0',
    workouts   : load(KEYS.workouts,     []),
    foodLog    : load(KEYS.foodLog,      []),
    bodyweight : load(KEYS.bodyweight,   []),
    settings   : load(KEYS.settings,     {}),
    foodLibrary: load(KEYS.foodLibrary,  []),
    measurements:load(KEYS.measurements, []),
  };
  downloadFile(
    `fittrack-backup-${getTodayStr()}.json`,
    JSON.stringify(data, null, 2),
    'application/json'
  );
  showToast('JSON backup downloaded!', '💾');
}

function exportCSV() {
  const workouts = load(KEYS.workouts, []);
  const rows     = [['Date','Category','Exercise','Set','Reps','Weight (kg)','isPR','Duration','Notes']];
  workouts.forEach(w => {
    if (!w.exercises.length) {
      rows.push([w.date, w.category, '', '', '', '', '', w.duration||'', w.notes||'']);
      return;
    }
    w.exercises.forEach(ex => {
      ex.sets.forEach((s, i) => {
        rows.push([
          w.date, w.category, ex.name, i+1, s.reps, s.weight?.toFixed(2)||0,
          s.isPR?'Yes':'', w.duration||'', w.notes||'',
        ]);
      });
    });
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadFile(`fittrack-workouts-${getTodayStr()}.csv`, csv, 'text/csv');
  showToast('CSV downloaded!', '📊');
}

function triggerImport() {
  el('import-file-input').click();
}

function importJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.workouts)    save(KEYS.workouts,    data.workouts);
      if (data.foodLog)     save(KEYS.foodLog,     data.foodLog);
      if (data.bodyweight)  save(KEYS.bodyweight,  data.bodyweight);
      if (data.settings)    save(KEYS.settings,    data.settings);
      if (data.foodLibrary) save(KEYS.foodLibrary, data.foodLibrary);
      if (data.measurements)save(KEYS.measurements,data.measurements);
      loadSettings();
      applyTheme();
      showToast('Backup restored successfully!', '✓');
      onTabEnter(state.activeTab);
      updateTopBar();
    } catch {
      showToast('Invalid backup file.', '⚠️');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  loadSettings();
  applyTheme();
  showToast('All data cleared.', '🗑');
  state.todayDate = getTodayStr();
  state.foodDate  = getTodayStr();
  onTabEnter(state.activeTab);
  updateTopBar();
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════
   19. BODYWEIGHT LOG
═══════════════════════════════════════ */

function openLogBodyweightModal() {
  el('bw-date').value   = getTodayStr();
  const s = state.settings;
  el('bw-weight').value = s.currentWeight ? toDisplayWeight(s.currentWeight) : '';
  qsa('[data-unit-display="weight"]').forEach(e => { e.textContent = weightUnit(); });
  openModal('modal-log-bodyweight');
}

function saveBodyweight() {
  const date   = el('bw-date').value   || getTodayStr();
  const rawVal = el('bw-weight').value;
  const kg     = toStoredWeight(rawVal);

  if (!kg) {
    showToast('Enter a valid weight.', '⚠️');
    return;
  }

  const log = load(KEYS.bodyweight, []);
  const idx = log.findIndex(e => e.date === date);
  if (idx >= 0) log[idx].weight = kg;
  else          log.push({ date, weight: kg });
  save(KEYS.bodyweight, log);

  // Update current weight in settings
  if (date === getTodayStr()) {
    state.settings.currentWeight = kg;
    saveSettings();
  }

  closeModal();
  showToast(`Weight logged: ${fmtWeight(kg)}`, '✓');
  if (state.activeTab === 'progress') renderBodyweightChart();
}

/* ═══════════════════════════════════════
   20. CONFIRM MODAL
═══════════════════════════════════════ */

function openConfirm(message, callback) {
  el('modal-confirm-body').textContent = message;
  state.confirmCb = callback;
  openModal('modal-confirm');
}

function confirmOK() {
  closeModal();
  if (typeof state.confirmCb === 'function') {
    state.confirmCb();
    state.confirmCb = null;
  }
}

/* ═══════════════════════════════════════
   21. MODAL MANAGEMENT
═══════════════════════════════════════ */

function openModal(id) {
  const overlay = el(id);
  if (!overlay) return;
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  state.modalStack.push(id);

  // If food modal: setup autocomplete
  if (id === 'modal-add-food') {
    setupFoodAutocomplete();
    // Set default date on food date context
    const mealSel = el('food-meal-select');
    // Try to default meal based on time of day
    const h = new Date().getHours();
    if (mealSel && !mealSel.dataset._manualSet) {
      if      (h < 11) mealSel.value = 'breakfast';
      else if (h < 15) mealSel.value = 'lunch';
      else if (h < 20) mealSel.value = 'dinner';
      else             mealSel.value = 'snacks';
    }
  }
}

function closeModal() {
  const id = state.modalStack.pop();
  if (!id) return;
  const overlay = el(id);
  if (!overlay) return;

  overlay.classList.add('closing');
  overlay.addEventListener('animationend', () => {
    overlay.classList.remove('closing');
    overlay.hidden = true;
    if (!state.modalStack.length) document.body.classList.remove('modal-open');
  }, { once: true });
}

function closeAllModals() {
  while (state.modalStack.length) closeModal();
}

/* ═══════════════════════════════════════
   22. LONG-PRESS HANDLERS
═══════════════════════════════════════ */

const LONG_PRESS_MS = 550;

function setupSessionLongPress() {
  qsa('.session-card').forEach(card => {
    let timer;
    const start = () => {
      timer = setTimeout(() => {
        const id = card.dataset.sessionId;
        card.classList.add('long-pressed');
        openConfirm('Delete this workout session? This cannot be undone.', () => {
          deleteWorkout(id);
        });
      }, LONG_PRESS_MS);
    };
    const cancel = () => {
      clearTimeout(timer);
      card.classList.remove('long-pressed');
    };
    card.addEventListener('touchstart', start,  { passive: true });
    card.addEventListener('touchend',   cancel);
    card.addEventListener('touchcancel',cancel);
    card.addEventListener('mousedown',  start);
    card.addEventListener('mouseup',    cancel);
    card.addEventListener('mouseleave', cancel);
  });
}

function setupFoodLongPress() {
  qsa('.food-item').forEach(item => {
    let timer;
    const start = () => {
      timer = setTimeout(() => {
        const id = item.dataset.foodId;
        if (!id) return;
        item.classList.add('long-pressed');
        openConfirm('Remove this food entry?', () => {
          deleteFoodEntry(id);
        });
      }, LONG_PRESS_MS);
    };
    const cancel = () => {
      clearTimeout(timer);
      item.classList.remove('long-pressed');
    };
    item.addEventListener('touchstart', start,  { passive: true });
    item.addEventListener('touchend',   cancel);
    item.addEventListener('touchcancel',cancel);
    item.addEventListener('mousedown',  start);
    item.addEventListener('mouseup',    cancel);
    item.addEventListener('mouseleave', cancel);
  });
}

/* ═══════════════════════════════════════
   23. EVENT DELEGATION
═══════════════════════════════════════ */

function setupEvents() {

  // ── Bottom nav ───────────────────────────────────────────────
  document.addEventListener('click', e => {
    const navItem = e.target.closest('.nav-item[data-target]');
    if (navItem) { switchTab(navItem.dataset.target); return; }
  });

  // ── Top bar tab links ─────────────────────────────────────────
  document.addEventListener('click', e => {
    const pill = e.target.closest('[data-tab-link]');
    if (pill) switchTab(pill.dataset.tabLink);
  });

  // ── data-action dispatcher ───────────────────────────────────
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {

      // ── Modals open/close
      case 'close-modal':     closeModal(); break;
      case 'confirm-ok':      confirmOK();  break;

      // ── Today
      case 'today-prev-day':
        state.todayDate = shiftDate(state.todayDate, -1);
        renderToday(); break;
      case 'today-next-day':
        if (state.todayDate < getTodayStr()) {
          state.todayDate = shiftDate(state.todayDate, 1);
          renderToday();
        } break;

      // ── Food date nav
      case 'food-prev-day':
        state.foodDate = shiftDate(state.foodDate, -1);
        renderFood(); break;
      case 'food-next-day':
        if (state.foodDate < getTodayStr()) {
          state.foodDate = shiftDate(state.foodDate, 1);
          renderFood();
        } break;

      // ── Add workout
      case 'open-add-workout': {
        const prefill = btn.dataset.prefillDate === 'today' ? getTodayStr() : btn.dataset.prefillDate;
        openAddWorkoutModal(prefill, null);
        break;
      }
      case 'edit-workout':
        openAddWorkoutModal(null, btn.dataset.id); break;

      case 'add-exercise-to-session': addExerciseToSession(); break;
      case 'remove-exercise': removeExercise(parseInt(btn.dataset.index)); break;
      case 'add-set':         addSetToExercise(parseInt(btn.dataset.exerciseIndex)); break;
      case 'remove-set':      removeSet(parseInt(btn.dataset.ei), parseInt(btn.dataset.si)); break;
      case 'save-workout':    saveWorkout(); break;
      case 'duplicate-last-workout': duplicateLastWorkout(); break;

      // ── Exercise picker
      case 'open-exercise-picker':
        state.exercisePickerTarget = parseInt(btn.dataset.exerciseIndex);
        renderExercisePicker(state.exerciseFilter, el('exercise-search')?.value || '');
        openModal('modal-exercise-picker');
        break;
      case 'select-exercise':
        selectExercise(btn.dataset.name, btn.dataset.category); break;
      case 'add-custom-exercise': addCustomExercise(); break;

      // ── Steppers
      case 'increment':
      case 'decrement': {
        const delta = action === 'increment' ? 1 : -1;
        stepperChange(btn.dataset.field, parseInt(btn.dataset.ei), parseInt(btn.dataset.si), delta);
        break;
      }

      // ── Rest timer
      case 'open-rest-timer': openRestTimer(); break;
      case 'timer-toggle':    toggleTimer();   break;
      case 'timer-reset':     resetTimer();    break;
      case 'timer-stop':      stopTimerChip(); break;

      // ── Food
      case 'open-add-food': {
        const meal = btn.dataset.meal || null;
        openAddFoodModal(meal, null);
        if (meal) el('food-meal-select').dataset._manualSet = '1';
        break;
      }
      case 'save-food-entry': saveFoodEntry(); break;
      case 'copy-yesterday-meals': copyYesterdayMeals(); break;

      // ── Quick add presets
      case undefined: {
        const chip = e.target.closest('.quick-chip[data-preset]');
        if (chip) {
          const preset = PRESET_FOODS.find(p => p.id === chip.dataset.preset);
          if (preset) {
            openAddFoodModal(null, preset);
          }
        }
        break;
      }

      // ── Cardio burn
      case 'open-cardio-burn': openCardioBurnModal(); break;
      case 'save-cardio-burn': saveCardioBurn(); break;

      // ── Bodyweight
      case 'open-log-bodyweight': openLogBodyweightModal(); break;
      case 'save-bodyweight':     saveBodyweight(); break;

      // ── Autocomplete
      case 'autocomplete-select':
        fillFoodFromPreset(
          btn.dataset.presetName,
          btn.dataset.calories,
          btn.dataset.protein,
          btn.dataset.carbs,
          btn.dataset.fats
        ); break;

      // ── Settings
      case 'save-profile':       saveProfile();      break;
      case 'save-targets':       saveTargets();      break;
      case 'save-measurements':  saveMeasurements(); break;
      case 'calc-tdee':          recalcBMITDEE();    break;
      case 'export-json':        exportJSON();       break;
      case 'export-csv':         exportCSV();        break;
      case 'trigger-import':     triggerImport();    break;
      case 'confirm-clear-data':
        openConfirm('Delete ALL data permanently? This cannot be undone.', clearAllData); break;
    }
  });

  // ── Quick chips (delegated via closest, handles undefined action above) ────
  document.addEventListener('click', e => {
    const chip = e.target.closest('.quick-chip[data-preset]');
    if (chip) {
      const preset = PRESET_FOODS.find(p => p.id === chip.dataset.preset);
      if (preset) openAddFoodModal(null, preset);
    }
  });

  // ── Filter chips — log tab ────────────────────────────────────
  document.addEventListener('click', e => {
    const chip = e.target.closest('#tab-log .filter-chip[data-filter]');
    if (!chip) return;
    qsa('#tab-log .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.logFilter = chip.dataset.filter;
    renderLog();
  });

  // ── Filter chips — exercise picker ──────────────────────────
  document.addEventListener('click', e => {
    const chip = e.target.closest('[data-role="exercise-category-filter"] .filter-chip');
    if (!chip) return;
    qsa('[data-role="exercise-category-filter"] .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.exerciseFilter = chip.dataset.filter;
    renderExercisePicker(state.exerciseFilter, el('exercise-search')?.value || '');
  });

  // ── Exercise search ──────────────────────────────────────────
  const exerciseSearch = el('exercise-search');
  if (exerciseSearch) {
    exerciseSearch.addEventListener('input', debounce(() => {
      renderExercisePicker(state.exerciseFilter, exerciseSearch.value);
    }, 200));
  }

  // ── Stepper input change ─────────────────────────────────────
  document.addEventListener('change', e => {
    const inp = e.target.closest('.stepper-input[data-field]');
    if (!inp) return;
    syncSetFromInput(inp.dataset.field, parseInt(inp.dataset.ei), parseInt(inp.dataset.si), inp.value);
  });

  // ── Timer preset buttons ─────────────────────────────────────
  document.addEventListener('click', e => {
    const btn_ = e.target.closest('.timer-preset-btn[data-seconds]');
    if (btn_) setTimerDuration(parseInt(btn_.dataset.seconds));
  });

  // ── Timer custom input ────────────────────────────────────────
  const timerCustom = el('timer-custom-seconds');
  if (timerCustom) {
    timerCustom.addEventListener('change', () => {
      const v = parseInt(timerCustom.value);
      if (v > 0) setTimerDuration(v);
    });
  }

  // ── Dark mode toggle ─────────────────────────────────────────
  document.addEventListener('change', e => {
    if (e.target.id === 'toggle-dark-mode') setDarkMode(e.target.checked);
    if (e.target.id === 'toggle-unit-lbs')  setUnit(e.target.checked);
  });

  // ── Strength chart exercise select ───────────────────────────
  document.addEventListener('change', e => {
    if (e.target.id === 'strength-exercise-select') {
      state.strengthExercise = e.target.value;
      renderStrengthChart();
    }
  });

  // ── Chart range buttons ──────────────────────────────────────
  document.addEventListener('click', e => {
    const rb = e.target.closest('.range-btn[data-range]');
    if (!rb) return;
    const group = rb.closest('[data-chart]');
    if (!group) return;
    const chartKey = group.dataset.chart;
    group.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
    rb.classList.add('active');
    state.chartRanges[chartKey] = rb.dataset.range;
    if (chartKey === 'bodyweight') renderBodyweightChart();
    if (chartKey === 'strength')   renderStrengthChart();
    if (chartKey === 'volume')     renderVolumeChart();
  });

  // ── Import file input ─────────────────────────────────────────
  const fileInput = el('import-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      importJSON(e.target.files[0]);
      e.target.value = '';
    });
  }

  // ── Workout date/category live sync ──────────────────────────
  ['workout-date','workout-category'].forEach(id => {
    const inp = el(id);
    if (inp) {
      inp.addEventListener('change', () => {
        if (state.session) {
          if (id === 'workout-date')     state.session.date     = inp.value;
          if (id === 'workout-category') state.session.category = inp.value;
        }
      });
    }
  });

  // ── Close modal on overlay backdrop click ────────────────────
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });

  // ── Keyboard: Escape closes modal ────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.modalStack.length) closeModal();
  });

  // ── Today tab quick-chip shortcut (within today tab) ─────────
  document.addEventListener('click', e => {
    const tb = e.target.closest('[data-tab-link]');
    if (tb && !e.target.closest('.modal-overlay')) {
      const target = tb.dataset.tabLink;
      if (target) switchTab(target);
    }
  });
}

/* ═══════════════════════════════════════
   24. THEME APPLY
═══════════════════════════════════════ */

function applyTheme() {
  document.documentElement.setAttribute(
    'data-theme',
    state.settings.darkMode ? 'dark' : 'light'
  );
}

/* ═══════════════════════════════════════
   25. INITIALISATION
═══════════════════════════════════════ */

function initApp() {
  loadSettings();
  applyTheme();

  state.todayDate = getTodayStr();
  state.foodDate  = getTodayStr();

  // Activate the initial tab without animation
  const initialTab = el('tab-today');
  initialTab.hidden = false;
  initialTab.classList.add('active');

  updateTopBar();
  renderToday();
  setupEvents();

  // Pre-populate quick-add grid from JS (replaces static HTML chips)
  const grid = el('quick-add-grid');
  if (grid) {
    grid.innerHTML = PRESET_FOODS.map(p => `
      <button class="quick-chip" data-preset="${p.id}" aria-label="Add ${p.name}">
        ${p.name.split('(')[0].trim()}
      </button>`).join('');
  }

  // Populate strength exercise select when progress tab first opens
  // (handled in renderProgress → populateStrengthSelect)
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
