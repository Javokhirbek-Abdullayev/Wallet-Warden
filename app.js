/* Wallet Warden redesign - offline first */
const STORAGE_KEY = "wallet-warden-v3";
const LEGACY_KEYS = ["wallet-warden-v2", "wallet-warden-v1"];
const DEFAULT_CATEGORIES = Object.freeze([
  { id: "cat_food", name: "Food", emoji: "🍕" }, { id: "cat_coffee", name: "Coffee", emoji: "☕" },
  { id: "cat_transit", name: "Transit", emoji: "🚌" }, { id: "cat_school", name: "School", emoji: "📚" },
  { id: "cat_rent", name: "Rent", emoji: "🏠" }, { id: "cat_tuition", name: "Tuition", emoji: "🎓" },
  { id: "cat_subs", name: "Subscriptions", emoji: "📦" }, { id: "cat_fun", name: "Fun", emoji: "🎮" },
  { id: "cat_other", name: "Other", emoji: "💸" }
]);
const CURRENCIES = [
  "USD","EUR","GBP","TRY","KZT","UAH","INR","CAD","AUD","JPY","CNY","KRW","CHF","SEK","NOK","DKK","PLN","CZK","HUF","BRL","MXN","SGD"
];
const TIPS = [
  "The 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Buying coffee daily can cost hundreds yearly. Cut 3 days/week.",
  "Emergency funds should ideally cover 3 months of expenses.",
  "Unsubscribe from one service you did not use this month.",
  "Pay yourself first: save before spending."
];
const DEFAULT_STATE = Object.freeze({
  schemaVersion: 4, monthlyIncome: 0, fixedExpenses: 0, incomeSources: [], recurringItems: [],
  categories: [...DEFAULT_CATEGORIES], transactions: [],
  quickAdds: [{ id: "q1", emoji: "☕", label: "Coffee", amount: 5, categoryId: "cat_coffee" }, { id: "q2", emoji: "🚌", label: "Transit", amount: 3, categoryId: "cat_transit" }, { id: "q3", emoji: "🍕", label: "Food", amount: 10, categoryId: "cat_food" }, { id: "q4", emoji: "📚", label: "School", amount: 8, categoryId: "cat_school" }],
  rolloverMode: "next-day", carryForwardBalance: 0, savingsGoalName: "New laptop", savingsTotal: 0,
  goals: [{ id: "goal_laptop", name: "New laptop", target: 900, saved: 0, emoji: "💻", active: true, type: "Tech", deadline: "" }],
  onboardingSeen: false, settlementDayKey: "", lastRecurringAppliedMonth: "",
  theme: "dark", currencyCode: "USD", activeTab: "home", logRange: "all",
  semesterMode: false, semesterLumpSum: 0, semesterEndDate: "",
  badges: [], dailyReminderEnabled: false, dailyReminderTime: "20:00",
  lastBackupAt: "", challengeWeekKey: "", challengeCompleted: false, installPromptSeenCount: 0
});

const $ = (id) => document.getElementById(id);
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  safeSpendValue: $("safe-spend-value"),
  daysRemaining: $("days-remaining"),
  monthSpent: $("month-spent"),
  streakCount: $("streak-count"),
  historyTotal: $("history-total"),
  transactionList: $("transaction-list"),
  quickAddGrid: $("quick-add-grid"),
  planForm: $("plan-form"),
  incomeInput: $("income"),
  fixedInput: $("fixed-expenses"),
  openSettings: $("open-settings"), themeToggle: $("theme-toggle"),
  closeSettings: $("close-settings"),
  settingsModal: $("settings-modal"),
  resetData: $("reset-data"),
  savingsGoalWrapper: $("savings-goal-wrapper"),
  savingsGoalName: $("savings-goal-name"),
  savingsTotal: $("savings-total"),
  editQuickAdds: $("edit-quick-adds"),
  budgetStatusPill: $("budget-status-pill"),
  savedTodayPill: $("saved-today-pill"),
  undoLast: $("undo-last"),
  toast: $("app-toast"),

  quickAddModal: $("quick-add-modal"),
  closeQuickAdds: $("close-quick-adds"),
  quickAddForm: $("quick-add-form"),
  quickAddEditorList: $("quick-add-editor-list"),
  quickAddTemplate: $("quick-add-editor-template"),

  onboardingModal: $("onboarding-modal"),
  startUsingApp: $("start-using-app"),
  dontShowOnboarding: $("dont-show-onboarding"),

  tabButtons: qsa(".tabbar-btn"), tabLinks: qsa("[data-tab-link]"),
  tabPanels: qsa("[data-tab-panel]"),

  openAddTransaction: $("open-add-transaction"),
  addTxModal: $("add-transaction-modal"),
  closeAddTx: $("close-add-transaction"),
  addTxForm: $("add-transaction-form"),
  cancelTx: $("cancel-tx"),
  txEmoji: $("tx-emoji"),
  txAmount: $("tx-amount"),
  txLabel: $("tx-label"),
  txCategory: $("tx-category"),
  txNote: $("tx-note"),
  txDate: $("tx-date"), txSplitToggle: $("tx-split-toggle"), txSplitFields: $("tx-split-fields"), txSplitCount: $("tx-split-count"), txSplitNames: $("tx-split-names"),

  searchQuery: $("search-query"),
  filterCategory: $("filter-category"),
  filterMonth: $("filter-month"),
  filteredTotal: $("filtered-total"),
  filteredList: $("filtered-transaction-list"),
  timeFilterChips: $("time-filter-chips"), sharedList: $("shared-expense-list"), sharedBalance: $("shared-balance"),

  goalsList: $("goals-list"),
  openGoalsEditor: $("open-goals-editor"),

  monthlySegments: $("monthly-segments"), trendChart: $("trend-chart"), smartInsights: $("smart-insights"),
  categoryBreakdown: $("category-breakdown"),

  modeMonthly: $("mode-monthly"), modeSemester: $("mode-semester"), semesterFields: $("semester-fields"),
  semesterLumpSum: $("semester-lump-sum"), semesterEndDate: $("semester-end-date"),

  dataModal: $("data-modal"),
  closeData: $("close-data"),
  exportJson: $("export-json"),
  exportCsv: $("export-csv"),
  importJson: $("import-json"),
  importJsonBtn: $("import-json-btn"),
  forecastBanner: $("forecast-banner"), heroRingFill: $("hero-ring-fill"), heroRingPercent: $("hero-ring-percent"),
  statSpentMonth: $("stat-spent-month"), statSavedSoFar: $("stat-saved-so-far"), statAvgDay: $("stat-avg-day"), statTopCategory: $("stat-top-category"),
  weeklyChart: $("weekly-chart"), donutWrap: $("donut-wrap"), donutLegend: $("donut-legend"),
  streakBadge: $("streak-badge"), rankBadge: $("rank-badge"), rankProgress: $("rank-progress"), rankNextText: $("rank-next-text"),
  streakCalendar: $("streak-calendar"), longestStreak: $("longest-streak"), challengeStatus: $("challenge-status"), challengeText: $("challenge-text"),
  tipCard: $("tip-card"), currencySelect: $("currency-select"), dailyReminderToggle: $("daily-reminder-toggle"),
  dailyReminderTime: $("daily-reminder-time"), openDataModal: $("open-data-modal"), lastBackupText: $("last-backup-text"),
  onboardingSteps: $("onboarding-steps"), onboardingNext: $("onboarding-next"),
  modeMonth: $("mode-monthly"), modeSem: $("mode-semester")
};

let state = normalizeState(loadState());

function deepClone(value) { if (typeof structuredClone === "function") return structuredClone(value); return JSON.parse(JSON.stringify(value)); }

function clampNumber(value, min = 0, max = Number.POSITIVE_INFINITY) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function sanitizeText(value, fallback, maxLength) {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text.slice(0, maxLength);
}

function safeRandomId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date();
}

function dateKey(dateObj) {
  return dateObj.toISOString().slice(0, 10);
}

function monthKey(dateObj) {
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthBounds(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { start, end, totalDays: end.getDate() };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) return JSON.parse(legacy);
    }
    return deepClone(DEFAULT_STATE);
  } catch {
    return deepClone(DEFAULT_STATE);
  }
}

function normalizeCategory(item, idx) {
  const id = sanitizeText(item?.id, `cat_${idx}`, 32).replace(/\s+/g, "_");
  return { id, name: sanitizeText(item?.name, "Category", 28), emoji: sanitizeText(item?.emoji, "🏷️", 4) };
}

function normalizeQuickAdd(item, idx) {
  return {
    id: sanitizeText(item?.id, `q${idx + 1}`, 16),
    emoji: sanitizeText(item?.emoji, "💸", 4),
    label: sanitizeText(item?.label, "Expense", 24),
    amount: clampNumber(item?.amount, 0, 99999),
    categoryId: sanitizeText(item?.categoryId, "cat_other", 32)
  };
}

function normalizeTransaction(item) {
  const d = new Date(item?.createdAt || Date.now());
  if (Number.isNaN(d.getTime())) return null;
  const amount = clampNumber(item?.amount, 0, 999999);
  return {
    id: sanitizeText(item?.id, safeRandomId(), 64),
    emoji: sanitizeText(item?.emoji, "💸", 4),
    label: sanitizeText(item?.label, "Expense", 40),
    categoryId: sanitizeText(item?.categoryId, "cat_other", 32),
    note: sanitizeText(item?.note, "", 120),
    amount,
    createdAt: d.getTime(),
    date: sanitizeText(item?.date, dateKey(d), 12),
    monthKey: sanitizeText(item?.monthKey, monthKey(d), 8),
    split: Boolean(item?.split),
    splitCount: clampNumber(item?.splitCount, 2, 6),
    splitNames: sanitizeText(item?.splitNames, "", 120),
    settled: Boolean(item?.settled)
  };
}

function normalizeGoal(item, idx) {
  return {
    id: sanitizeText(item?.id, `goal_${idx}`, 64),
    name: sanitizeText(item?.name, "Goal", 40),
    target: clampNumber(item?.target, 0, 999999),
    saved: clampNumber(item?.saved, 0, 999999),
    emoji: sanitizeText(item?.emoji, "🎯", 4),
    active: item?.active !== false,
    type: sanitizeText(item?.type, "Other", 20),
    deadline: sanitizeText(item?.deadline, "", 12)
  };
}

function normalizeState(raw) {
  const base = { ...deepClone(DEFAULT_STATE), ...(raw && typeof raw === "object" ? raw : {}) };

  const categories = (Array.isArray(base.categories) ? base.categories : [...DEFAULT_CATEGORIES]).map(normalizeCategory).slice(0, 50);
  const catIds = new Set(categories.map((c) => c.id));
  if (!catIds.has("cat_other")) categories.push({ id: "cat_other", name: "Other", emoji: "💸" });

  const txs = (Array.isArray(base.transactions) ? base.transactions : []).map(normalizeTransaction).filter(Boolean).slice(-3000);
  const quickAdds = (Array.isArray(base.quickAdds) ? base.quickAdds : deepClone(DEFAULT_STATE.quickAdds)).map(normalizeQuickAdd).slice(0, 4);
  const goals = (Array.isArray(base.goals) ? base.goals : deepClone(DEFAULT_STATE.goals)).map(normalizeGoal).slice(0, 25);

  const normalized = {
    schemaVersion: 4,
    monthlyIncome: clampNumber(base.monthlyIncome, 0),
    fixedExpenses: clampNumber(base.fixedExpenses, 0),
    incomeSources: Array.isArray(base.incomeSources) ? base.incomeSources : deepClone(DEFAULT_STATE.incomeSources),
    recurringItems: Array.isArray(base.recurringItems) ? base.recurringItems : deepClone(DEFAULT_STATE.recurringItems),
    categories,
    transactions: txs,
    quickAdds,
    rolloverMode: base.rolloverMode === "savings-goal" ? "savings-goal" : "next-day",
    carryForwardBalance: clampNumber(base.carryForwardBalance, 0),
    savingsGoalName: sanitizeText(base.savingsGoalName, "New laptop", 60),
    savingsTotal: clampNumber(base.savingsTotal, 0),
    goals,
    onboardingSeen: Boolean(base.onboardingSeen),
    settlementDayKey: sanitizeText(base.settlementDayKey, "", 12),
    lastRecurringAppliedMonth: sanitizeText(base.lastRecurringAppliedMonth, "", 8),
    theme: base.theme === "light" ? "light" : "dark",
    currencyCode: CURRENCIES.includes(base.currencyCode) ? base.currencyCode : "USD",
    activeTab: sanitizeText(base.activeTab, "home", 12),
    logRange: ["all","today","week","month"].includes(base.logRange) ? base.logRange : "all",
    semesterMode: Boolean(base.semesterMode),
    semesterLumpSum: clampNumber(base.semesterLumpSum, 0),
    semesterEndDate: sanitizeText(base.semesterEndDate, "", 12),
    badges: Array.isArray(base.badges) ? base.badges.slice(0, 40) : [],
    dailyReminderEnabled: Boolean(base.dailyReminderEnabled),
    dailyReminderTime: sanitizeText(base.dailyReminderTime, "20:00", 5),
    lastBackupAt: sanitizeText(base.lastBackupAt, "", 32),
    challengeWeekKey: sanitizeText(base.challengeWeekKey, "", 16),
    challengeCompleted: Boolean(base.challengeCompleted),
    installPromptSeenCount: clampNumber(base.installPromptSeenCount, 0, 99)
  };

  while (normalized.quickAdds.length < 4) {
    normalized.quickAdds.push(normalizeQuickAdd(DEFAULT_STATE.quickAdds[normalized.quickAdds.length], normalized.quickAdds.length));
  }
  normalized.quickAdds = normalized.quickAdds.map((q, idx) => {
    const cat = catIds.has(q.categoryId) ? q.categoryId : "cat_other";
    return normalizeQuickAdd({ ...q, categoryId: cat }, idx);
  });

  normalized.transactions = normalized.transactions.map((tx) => {
    if (!catIds.has(tx.categoryId)) return { ...tx, categoryId: "cat_other" };
    return tx;
  });

  return normalized;
}

function saveState() {
  try {
    state = normalizeState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast("Storage is full. Export a backup first.");
  }
}

function currency(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: state.currencyCode || "USD" }).format(clampNumber(value, 0)); }

function sumAmounts(entries) {
  return entries.reduce((acc, item) => acc + clampNumber(item.amount, 0), 0);
}

function getCurrentMonthTransactions(dateObj = now()) {
  const key = monthKey(dateObj);
  return state.transactions.filter((tx) => tx.monthKey === key);
}

function getDaysRemaining(dateObj = now()) {
  const { totalDays } = getMonthBounds(dateObj);
  return Math.max(1, totalDays - dateObj.getDate() + 1);
}

function getDailySafeSpendRaw(dateObj = now()) {
  if (state.semesterMode && state.semesterEndDate) {
    const end = new Date(state.semesterEndDate);
    const days = Math.max(1, Math.ceil((end - dateObj) / 86400000) + 1);
    const spent = state.transactions.filter((tx) => tx.createdAt <= dateObj.getTime()).reduce((a, t) => a + t.amount, 0);
    return (state.semesterLumpSum - state.fixedExpenses - spent) / days;
  }
  const monthSpent = sumAmounts(getCurrentMonthTransactions(dateObj));
  const daysRemaining = getDaysRemaining(dateObj);
  const available =
    clampNumber(state.monthlyIncome, 0) -
    clampNumber(state.fixedExpenses, 0) -
    monthSpent +
    clampNumber(state.carryForwardBalance, 0);
  return available / daysRemaining;
}

function getSpentForDay(targetDateKey) {
  return state.transactions.filter((tx) => tx.date === targetDateKey).reduce((acc, tx) => acc + tx.amount, 0);
}

function buildDailyLimitMap(dateObj = now()) {
  const map = {};
  const { totalDays } = getMonthBounds(dateObj);
  const txs = getCurrentMonthTransactions(dateObj).sort((a, b) => a.createdAt - b.createdAt);
  let carry = clampNumber(state.carryForwardBalance, 0);
  for (let day = 1; day <= dateObj.getDate(); day += 1) {
    const thisDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), day);
    const thisDateKey = dateKey(thisDate);
    const spentToDate = txs
      .filter((tx) => new Date(tx.createdAt).getDate() <= day)
      .reduce((acc, tx) => acc + tx.amount, 0);
    const daysRemaining = Math.max(1, totalDays - day + 1);
    const rawLimit = (state.monthlyIncome - state.fixedExpenses - spentToDate + carry) / daysRemaining;
    map[thisDateKey] = clampNumber(rawLimit, 0);
    const daySpend = getSpentForDay(thisDateKey);
    const saved = Math.max(0, map[thisDateKey] - daySpend);
    if (state.rolloverMode === "next-day") carry = saved;
  }
  return map;
}

function getStreak(dateObj = now()) {
  const limitMap = buildDailyLimitMap(dateObj);
  let streak = 0;
  const cursor = new Date(dateObj);
  for (;;) {
    const key = dateKey(cursor);
    if (!(key in limitMap)) break;
    const spent = getSpentForDay(key);
    if (spent <= limitMap[key]) streak += 1;
    else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
function getLongestStreak(dateObj = now()) {
  const map = buildDailyLimitMap(dateObj); const keys = Object.keys(map).sort(); let best = 0; let run = 0;
  keys.forEach((k) => { const ok = getSpentForDay(k) <= map[k]; run = ok ? run + 1 : 0; best = Math.max(best, run); });
  return best;
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => els.toast.classList.add("hidden"), 1900);
}
function applyTheme() {
  document.body.dataset.theme = state.theme;
  const icon = els.themeToggle?.querySelector("i");
  if (icon) icon.className = state.theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");
}

function populateCategorySelect(selectEl, includeAll = false) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  if (includeAll) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "All categories";
    selectEl.appendChild(opt);
  }
  state.categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.emoji} ${c.name}`;
    selectEl.appendChild(opt);
  });
}

function renderQuickAddButtons() {
  if (!els.quickAddGrid) return;
  els.quickAddGrid.innerHTML = "";
  state.quickAdds.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "quick-add-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", `Add ${item.label} ${currency(item.amount)}`);
    btn.innerHTML = `
      <div class="quick-emoji">${item.emoji}</div>
      <div class="quick-title mt-1">${item.label}</div>
      <div class="quick-price">${currency(item.amount)}</div>
    `;
    let pressTimer;
    btn.addEventListener("click", () => addQuickExpense(item));
    btn.addEventListener("touchstart", () => { pressTimer = setTimeout(openQuickAddEditor, 550); }, { passive: true });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));
    els.quickAddGrid.appendChild(btn);
  });
  if (state.quickAdds.length < 8) {
    const plus = document.createElement("button");
    plus.className = "quick-add-btn"; plus.type = "button";
    plus.innerHTML = `<div class="quick-emoji">➕</div><div class="quick-title">Add slot</div><div class="quick-price">Up to 8</div>`;
    plus.addEventListener("click", () => openQuickAddEditor());
    els.quickAddGrid.appendChild(plus);
  }
}

function renderHistory(monthTransactions) {
  if (!els.transactionList) return;
  els.transactionList.innerHTML = "";
  const sorted = [...monthTransactions].sort((a, b) => b.createdAt - a.createdAt);
  if (!sorted.length) {
    const li = document.createElement("li");
    li.className = "text-sm text-zinc-500 py-2";
    li.textContent = "No transactions yet this month.";
    els.transactionList.appendChild(li);
    return;
  }
  sorted.slice(0, 5).forEach((tx) => {
    const item = document.createElement("li");
    item.className = "history-item";
    const time = new Date(tx.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const catObj = state.categories.find((c) => c.id === tx.categoryId);
    item.innerHTML = `
      <div class="history-emoji">${tx.emoji}</div>
      <div>
        <div class="history-label">${tx.label}${catObj ? ` • ${catObj.emoji} ${catObj.name}` : ""}</div>
        <div class="history-meta">${tx.date} • ${time}${tx.note ? ` • ${tx.note}` : ""}</div>
      </div>
      <div class="history-amount">-${currency(tx.amount)} ${tx.split ? '<span class="status-pill status-pill--neutral">split</span>' : ""}</div>
    `;
    els.transactionList.appendChild(item);
  });
}
function drawWeeklyChart() {
  const canvas = els.weeklyChart; if (!canvas) return;
  const ctx = canvas.getContext("2d"); const w = canvas.width; const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const values = days.map((d) => getSpentForDay(dateKey(d)));
  const max = Math.max(1, ...values);
  const barW = w / 11;
  days.forEach((d, i) => {
    const x = 45 + i * (barW + 20); const val = values[i]; const ratio = val / max; const bh = Math.max(8, ratio * (h - 40));
    const lim = clampNumber(buildDailyLimitMap(now())[dateKey(d)] || getDailySafeSpendRaw(d), 0); const over = val > lim;
    ctx.fillStyle = over ? "#FF6B6B" : "#00D4AA";
    if (dateKey(d) === dateKey(now())) { ctx.shadowBlur = 14; ctx.shadowColor = ctx.fillStyle; }
    ctx.fillRect(x, h - bh - 20, barW, bh); ctx.shadowBlur = 0;
  });
}
function renderDonut(monthTx) {
  if (!els.donutWrap || !els.donutLegend) return;
  const byCat = {}; monthTx.forEach((tx) => byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount);
  const rows = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (!rows.length) { els.donutWrap.textContent = "No data yet."; els.donutLegend.innerHTML = ""; return; }
  const total = rows.reduce((a,[,v])=>a+v,0); let start = 0;
  const colors = ["#6C63FF","#00D4AA","#FFB347","#FF6B6B","#8AA4FF"];
  const segs = rows.map(([id,v],i)=>{ const pct = v/total; const end = start + pct*360; const s = `<path d="${arcPath(90,90,58,start,end)}" stroke="${colors[i]}" stroke-width="22" fill="none" data-cat="${id}"></path>`; start = end; return s; }).join("");
  els.donutWrap.innerHTML = `<svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="58" stroke="rgba(255,255,255,.1)" stroke-width="22" fill="none"></circle>${segs}</svg>`;
  els.donutLegend.innerHTML = "";
  rows.forEach(([catId, amt], i) => {
    const cat = state.categories.find((c)=>c.id===catId) || {name:"Other",emoji:"🏷️"};
    const li = document.createElement("li"); li.className = "breakdown-item";
    li.innerHTML = `<div class="goal-row"><div class="goal-title">${cat.emoji} ${cat.name}</div><div class="goal-meta">${currency(amt)}</div></div>`;
    li.addEventListener("click", ()=>{ if (els.filterCategory) { els.filterCategory.value = catId; setActiveTab("log"); renderLogPanel(); } });
    els.donutLegend.appendChild(li);
  });
}
function arcPath(cx, cy, r, a0, a1) {
  const rad = (a) => (a - 90) * Math.PI / 180;
  const x0 = cx + r * Math.cos(rad(a0)); const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1)); const y1 = cy + r * Math.sin(rad(a1));
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

function renderStatusPills(dailyLimit, spentToday) {
  if (!els.budgetStatusPill || !els.savedTodayPill) return;
  const savedToday = Math.max(0, dailyLimit - spentToday);
  const overToday = Math.max(0, spentToday - dailyLimit);
  if (overToday > 0) {
    els.budgetStatusPill.textContent = `Over by ${currency(overToday)}`;
    els.budgetStatusPill.className = "status-pill status-pill--danger";
  } else {
    els.budgetStatusPill.textContent = "On track";
    els.budgetStatusPill.className = "status-pill status-pill--ok";
  }
  els.savedTodayPill.textContent = `Saved today: ${currency(savedToday)}`;
}

function addQuickExpense(item) {
  try {
    const entry = normalizeQuickAdd(item, 0);
    const d = now();
    const tx = normalizeTransaction({
      id: safeRandomId(),
      emoji: entry.emoji,
      label: entry.label,
      amount: entry.amount,
      categoryId: entry.categoryId,
      note: "",
      createdAt: d.getTime(),
      date: dateKey(d),
      monthKey: monthKey(d)
    });
    if (!tx) return;
    state.transactions.push(tx);
    if (state.transactions.length > 3000) state.transactions = state.transactions.slice(-3000);
    saveState();
    render();
    showToast(`${entry.emoji} ${entry.label} logged`);
  } catch {
    showToast("Could not add transaction.");
  }
}

function settleYesterday() {
  const today = now();
  const todayKey = dateKey(today);
  if (state.settlementDayKey === todayKey) return;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (monthKey(yesterday) !== monthKey(today)) {
    state.carryForwardBalance = 0;
    state.settlementDayKey = todayKey;
    saveState();
    return;
  }
  const yKey = dateKey(yesterday);
  const limitMap = buildDailyLimitMap(today);
  const yesterdayLimit = clampNumber(limitMap[yKey], 0);
  const spentYesterday = getSpentForDay(yKey);
  const leftover = Math.max(0, yesterdayLimit - spentYesterday);
  if (state.rolloverMode === "savings-goal") {
    state.savingsTotal = clampNumber(state.savingsTotal + leftover, 0);
    state.carryForwardBalance = 0;
  } else {
    state.carryForwardBalance = leftover;
  }
  state.settlementDayKey = todayKey;
  saveState();
}

function openQuickAddEditor() {
  if (!els.quickAddEditorList || !els.quickAddTemplate) return;
  els.quickAddEditorList.innerHTML = "";
  state.quickAdds.forEach((item) => {
    const fragment = els.quickAddTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".quick-edit-row");
    row.querySelector(".quick-emoji").value = item.emoji;
    row.querySelector(".quick-label").value = item.label;
    row.querySelector(".quick-amount").value = item.amount;
    els.quickAddEditorList.appendChild(fragment);
  });
  openModal(els.quickAddModal);
}

function saveQuickAddEditor(event) {
  event.preventDefault();
  const rows = Array.from(els.quickAddEditorList.querySelectorAll(".quick-edit-row"));
  const next = rows.map((row, idx) => {
    const emoji = sanitizeText(row.querySelector(".quick-emoji").value, "💸", 4);
    const label = sanitizeText(row.querySelector(".quick-label").value, "Expense", 24);
    const amount = clampNumber(row.querySelector(".quick-amount").value, 0, 99999);
    const guessCategory =
      state.categories.find((c) => c.name.toLowerCase() === label.toLowerCase())?.id || "cat_other";
    return normalizeQuickAdd({ id: `q${idx + 1}`, emoji, label, amount, categoryId: guessCategory }, idx);
  });
  state.quickAdds = next;
  saveState();
  closeModal(els.quickAddModal);
  render();
  showToast("Quick add buttons updated");
}

function undoLastTransaction() {
  const currentMonth = monthKey(now());
  const idx = [...state.transactions].reverse().findIndex((tx) => tx.monthKey === currentMonth);
  if (idx < 0) return showToast("Nothing to undo");
  const realIndex = state.transactions.length - 1 - idx;
  state.transactions.splice(realIndex, 1);
  saveState();
  render();
  showToast("Last transaction removed");
}

function setActiveTab(tab) {
  els.tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle("tabbar-btn--active", isActive);
    if (isActive) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  els.tabPanels.forEach((panel) => panel.classList.toggle("hidden", panel.dataset.tabPanel !== tab));
  state.activeTab = tab;
  saveState();
  if (tab === "log") renderLogPanel();
  if (tab === "goals") renderGoals();
  if (tab === "insights") renderInsights();
}

function openAddTransaction() {
  populateCategorySelect(els.txCategory, false);
  const d = now();
  if (els.txEmoji) els.txEmoji.value = "💸";
  if (els.txAmount) els.txAmount.value = "";
  if (els.txLabel) els.txLabel.value = "";
  if (els.txNote) els.txNote.value = "";
  if (els.txDate) els.txDate.value = dateKey(d);
  if (els.txCategory) els.txCategory.value = "cat_other";
  openModal(els.addTxModal);
  els.txAmount?.focus();
}

function saveManualTransaction(event) {
  event.preventDefault();
  const createdAtDate = new Date(els.txDate?.value || dateKey(now()));
  const createdAt = Number.isFinite(createdAtDate.getTime()) ? createdAtDate.getTime() : Date.now();
  const tx = normalizeTransaction({
    id: safeRandomId(),
    emoji: sanitizeText(els.txEmoji?.value, "💸", 4),
    label: sanitizeText(els.txLabel?.value, "Expense", 40),
    amount: clampNumber(els.txAmount?.value, 0, 999999),
    categoryId: sanitizeText(els.txCategory?.value, "cat_other", 32),
    note: sanitizeText(els.txNote?.value, "", 120),
    createdAt,
    date: dateKey(new Date(createdAt)),
    monthKey: monthKey(new Date(createdAt)),
    split: Boolean(els.txSplitToggle?.checked),
    splitCount: clampNumber(els.txSplitCount?.value || 2, 2, 6),
    splitNames: sanitizeText(els.txSplitNames?.value, "", 120),
    settled: false
  });
  if (!tx || tx.amount <= 0) return showToast("Enter an amount > 0");
  state.transactions.push(tx);
  saveState();
  closeModal(els.addTxModal);
  render();
  showToast("Transaction saved");
}

function renderLogPanel() {
  if (!els.filteredList) return;
  populateCategorySelect(els.filterCategory, true);
  if (!els.filterMonth?.value) {
    const d = now();
    els.filterMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const q = sanitizeText(els.searchQuery?.value, "", 80).toLowerCase();
  const cat = els.filterCategory?.value || "";
  const month = els.filterMonth?.value || monthKey(now());

  const filtered = state.transactions
    .filter((tx) => state.logRange === "month" || state.logRange === "all" ? tx.monthKey === month || state.logRange === "all" : true)
    .filter((tx) => {
      const n = now(); const d = new Date(tx.createdAt);
      if (state.logRange === "today") return tx.date === dateKey(n);
      if (state.logRange === "week") return d >= new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6);
      return true;
    })
    .filter((tx) => (cat ? tx.categoryId === cat : true))
    .filter((tx) => {
      if (!q) return true;
      const catName = state.categories.find((c) => c.id === tx.categoryId)?.name || "";
      return `${tx.label} ${tx.note} ${catName}`.toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 400);

  const total = sumAmounts(filtered);
  if (els.filteredTotal) els.filteredTotal.textContent = `-${currency(total)}`;

  els.filteredList.innerHTML = "";
  if (!filtered.length) {
    const li = document.createElement("li");
    li.className = "text-sm text-zinc-500 py-2";
    li.textContent = "No matches.";
    els.filteredList.appendChild(li);
    return;
  }
  filtered.forEach((tx) => {
    const catObj = state.categories.find((c) => c.id === tx.categoryId);
    const item = document.createElement("li");
    item.className = "history-item";
    const time = new Date(tx.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    item.innerHTML = `
      <div class="history-emoji">${tx.emoji}</div>
      <div>
        <div class="history-label">${tx.label}${catObj ? ` • ${catObj.emoji} ${catObj.name}` : ""}</div>
        <div class="history-meta">${tx.date} • ${time}${tx.note ? ` • ${tx.note}` : ""}</div>
      </div>
      <div class="history-amount">-${currency(tx.amount)}</div>
    `;
    item.addEventListener("click", () => {
      const next = window.prompt("Edit label", tx.label); if (!next) return;
      tx.label = sanitizeText(next, tx.label, 40); saveState(); renderLogPanel();
    });
    els.filteredList.appendChild(item);
  });
  renderSharedExpenses(filtered);
}
function renderSharedExpenses(txs) {
  if (!els.sharedList || !els.sharedBalance) return;
  const shared = txs.filter((t) => t.split); els.sharedList.innerHTML = "";
  let owedToYou = 0;
  shared.forEach((tx) => {
    const your = tx.amount / Math.max(2, tx.splitCount || 2); const others = tx.amount - your;
    if (!tx.settled) owedToYou += others;
    const li = document.createElement("li"); li.className = "history-item";
    li.innerHTML = `<div class="history-emoji">🤝</div><div><div class="history-label">${tx.label} • ${tx.splitCount} people</div><div class="history-meta">${currency(tx.amount)} full • your share ${currency(your)}</div></div><button class="subtle-btn">${tx.settled ? "Settled" : "Settle"}</button>`;
    li.querySelector("button").addEventListener("click", () => { tx.settled = !tx.settled; saveState(); renderLogPanel(); });
    els.sharedList.appendChild(li);
  });
  if (!shared.length) els.sharedList.innerHTML = `<li class="hint">No shared expenses yet.</li>`;
  els.sharedBalance.textContent = `${currency(owedToYou)} owed to you`;
}

function renderGoals() {
  if (!els.goalsList) return;
  els.goalsList.innerHTML = "";
  const goals = (state.goals || []).filter((g) => g.active);
  if (!goals.length) {
    const li = document.createElement("li");
    li.className = "text-sm text-zinc-500 py-2";
    li.textContent = "No goals yet. Add one to start saving.";
    els.goalsList.appendChild(li);
    return;
  }
  goals.forEach((g) => {
    const li = document.createElement("li");
    li.className = "goal-item";
    const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    li.innerHTML = `
      <div class="goal-row">
        <div class="goal-title">${g.emoji} ${g.name}</div>
        <div class="goal-meta">${currency(g.saved)} / ${currency(g.target)}</div>
      </div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="goal-meta">Contributing ${currency(10)}/month at current rate</div>
      <div class="row mt8"><button class="subtle-btn" type="button" data-goal-action="add" data-goal-id="${g.id}">+ $10</button><button class="subtle-btn" type="button" data-goal-action="remove" data-goal-id="${g.id}">- $10</button></div>
    `;
    els.goalsList.appendChild(li);
  });
}

function renderInsights() {
  const today = now(); const monthTx = getCurrentMonthTransactions(today); const monthSpent = sumAmounts(monthTx);
  const income = state.monthlyIncome; const saved = Math.max(0, income - state.fixedExpenses - monthSpent);
  if (els.monthlySegments) {
    const i = income || 1; const spentPct = Math.max(4, (monthSpent / i) * 100); const savedPct = Math.max(4, (saved / i) * 100); const fixedPct = Math.max(4, (state.fixedExpenses / i) * 100);
    els.monthlySegments.innerHTML = `<div style="width:${Math.min(100,fixedPct)}%;background:#8aa4ff"></div><div style="width:${Math.min(100,spentPct)}%;background:#FF6B6B"></div><div style="width:${Math.min(100,savedPct)}%;background:#00D4AA"></div>`;
  }
  drawTrendChart();
  const byCat = {}; monthTx.forEach((tx) => (byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount));
  const sorted = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  els.categoryBreakdown.innerHTML = sorted.length ? "" : `<li class="hint">Not enough data yet. Log a few transactions to unlock your insights!</li>`;
  const total = Math.max(1, monthSpent);
  sorted.slice(0, 10).forEach(([catId, amt]) => {
    const cat = state.categories.find((c)=>c.id===catId) || {name:"Other",emoji:"🏷️"};
    const pct = Math.round((amt / total) * 100);
    const li = document.createElement("li"); li.className = "breakdown-item";
    li.innerHTML = `<div class="goal-row"><div class="goal-title">${cat.emoji} ${cat.name}</div><div class="goal-meta">${pct}%</div></div><div class="progress"><div style="width:${pct}%"></div></div>`;
    els.categoryBreakdown.appendChild(li);
  });
  renderSmartInsights(monthTx, sorted);
}
function drawTrendChart() {
  const c = els.trendChart; if (!c) return; const ctx = c.getContext("2d"); ctx.clearRect(0,0,c.width,c.height);
  const days = [...Array(30)].map((_,i)=>{ const d = new Date(); d.setDate(d.getDate()-(29-i)); return d;});
  const vals = days.map((d)=>getSpentForDay(dateKey(d))); const max = Math.max(1, ...vals);
  ctx.strokeStyle = "#6C63FF"; ctx.lineWidth = 2; ctx.beginPath();
  vals.forEach((v,i)=>{ const x = 20 + (i/29)*(c.width-40); const y = c.height - 20 - (v/max)*(c.height-40); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.stroke();
}
function renderSmartInsights(monthTx, sortedCats) {
  if (!els.smartInsights) return; els.smartInsights.innerHTML = "";
  if (!monthTx.length) { els.smartInsights.innerHTML = `<li class="hint">Log transactions to unlock smart insights.</li>`; return; }
  const byWeekday = Array(7).fill(0); monthTx.forEach((t)=>byWeekday[new Date(t.createdAt).getDay()] += t.amount);
  const biggestDay = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][byWeekday.indexOf(Math.max(...byWeekday))];
  const topCat = sortedCats[0]; const topCatObj = state.categories.find((c)=>c.id===topCat?.[0]);
  const lines = [`Your biggest spending day is ${biggestDay}.`, topCat ? `You overspent most on ${topCatObj?.name || "a category"} this month.` : "You are building data steadily.", getStreak(now()) >= 3 ? "You're saving more consistently this week. Great work! 🎉" : "Stay under your limit for a stronger streak."];
  lines.slice(0,3).forEach((t)=>{ const li = document.createElement("li"); li.className = "breakdown-item"; li.textContent = t; els.smartInsights.appendChild(li); });
}

function applyRecurringForMonthIfNeeded() {
  const currentMonth = monthKey(now());
  if (state.lastRecurringAppliedMonth === currentMonth) return;
  const d = now();
  const items = Array.isArray(state.recurringItems) ? state.recurringItems.filter((r) => r?.active) : [];
  items.forEach((r) => {
    if (r.cadence !== "monthly") return;
    if (r.type !== "expense") return; // keep it simple for now (expenses only)
    const day = clampNumber(r.dayOfMonth, 1, 28);
    const dueDate = new Date(d.getFullYear(), d.getMonth(), day);
    const dueKey = dateKey(dueDate);
    const amount = clampNumber(r.amount, 0, 999999);
    if (amount <= 0) return;
    const exists = state.transactions.some((tx) => tx.monthKey === currentMonth && tx.label === r.name && tx.date === dueKey && tx.amount === amount);
    if (exists) return;
    const emoji = state.categories.find((c) => c.id === r.categoryId)?.emoji || "📌";
    state.transactions.push(
      normalizeTransaction({
        id: safeRandomId(),
        emoji,
        label: r.name,
        amount,
        categoryId: r.categoryId,
        note: "Recurring",
        createdAt: dueDate.getTime(),
        date: dueKey,
        monthKey: currentMonth
      })
    );
  });
  state.lastRecurringAppliedMonth = currentMonth;
  saveState();
}

function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportBackupJson() {
  downloadText(`wallet-warden-backup-${dateKey(now())}.json`, JSON.stringify(state, null, 2), "application/json");
  state.lastBackupAt = new Date().toISOString();
  saveState();
  showToast("Backup exported");
}

function exportTransactionsCsv() {
  const header = ["date", "label", "amount", "category", "note"].join(",");
  const rows = state.transactions
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((tx) => {
      const catName = state.categories.find((c) => c.id === tx.categoryId)?.name || "Other";
      const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
      return [tx.date, tx.label, tx.amount.toFixed(2), catName, tx.note].map(escape).join(",");
    });
  downloadText(`wallet-warden-transactions-${dateKey(now())}.csv`, [header, ...rows].join("\n"), "text/csv;charset=utf-8");
  showToast("CSV exported");
}

async function importBackupJson() {
  const file = els.importJson?.files?.[0];
  if (!file) return showToast("Choose a JSON file");
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return showToast("Invalid JSON");
  }
  if (!window.confirm("Import will replace your current data. Continue?")) return;
  state = normalizeState(parsed);
  saveState();
  render();
  showToast("Backup imported");
}

function render() {
  try {
    const today = now();
    const monthTx = getCurrentMonthTransactions(today);
    const monthSpent = sumAmounts(monthTx);
    const dailyLimit = clampNumber(getDailySafeSpendRaw(today), 0);
    const spentToday = getSpentForDay(dateKey(today));

    if (els.safeSpendValue) els.safeSpendValue.textContent = currency(dailyLimit);
    if (els.daysRemaining) els.daysRemaining.textContent = `${getDaysRemaining(today)} days left`;
    if (els.monthSpent) els.monthSpent.textContent = `${currency(spentToday)} spent today`;
    if (els.streakCount) els.streakCount.textContent = String(getStreak(today));

    if (els.incomeInput) els.incomeInput.value = state.monthlyIncome || "";
    if (els.fixedInput) els.fixedInput.value = state.fixedExpenses || "";
    if (els.savingsGoalName) els.savingsGoalName.value = state.savingsGoalName;
    if (els.savingsTotal) els.savingsTotal.textContent = currency(state.savingsTotal);

    renderStatusPills(dailyLimit, spentToday);
    applyTheme();
    const progress = dailyLimit > 0 ? Math.min(100, Math.round((spentToday / dailyLimit) * 100)) : 0;
    if (els.heroRingFill) els.heroRingFill.style.strokeDashoffset = `${326.7 - (326.7 * progress) / 100}`;
    if (els.heroRingPercent) els.heroRingPercent.textContent = `${progress}%`;
    if (els.statSpentMonth) els.statSpentMonth.textContent = currency(monthSpent);
    if (els.statSavedSoFar) els.statSavedSoFar.textContent = currency(Math.max(0, state.monthlyIncome - state.fixedExpenses - monthSpent));
    if (els.statAvgDay) els.statAvgDay.textContent = currency(monthSpent / Math.max(1, today.getDate()));
    const byCat = {}; monthTx.forEach((tx)=>byCat[tx.categoryId]=(byCat[tx.categoryId]||0)+tx.amount);
    const topCatId = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0]?.[0]; const topCat = state.categories.find((c)=>c.id===topCatId);
    if (els.statTopCategory) els.statTopCategory.textContent = topCat ? `${topCat.emoji} ${topCat.name}` : "—";
    renderForecast(monthSpent, dailyLimit);
    drawWeeklyChart();
    renderDonut(monthTx);
    renderRankAndBadges();
    renderStreakCalendar();
    renderChallenge();
    renderTip();
    renderSettingsBits();
    const rollover = qs(`input[name="rollover-mode"][value="${state.rolloverMode}"]`);
    if (rollover) rollover.checked = true;
    if (els.savingsGoalWrapper) els.savingsGoalWrapper.style.display = state.rolloverMode === "savings-goal" ? "block" : "none";

    renderQuickAddButtons();
    renderHistory(monthTx);
    renderLogPanel();
    renderGoals();
    renderInsights();
  } catch {
    showToast("Recovered from an app error.");
  }
}

function bindEvents() {
  els.themeToggle?.addEventListener("click", () => { state.theme = state.theme === "dark" ? "light" : "dark"; saveState(); applyTheme(); });
  els.planForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.monthlyIncome = clampNumber(els.incomeInput?.value, 0);
    state.fixedExpenses = clampNumber(els.fixedInput?.value, 0);
    state.semesterLumpSum = clampNumber(els.semesterLumpSum?.value, 0);
    state.semesterEndDate = sanitizeText(els.semesterEndDate?.value, "", 12);
    saveState();
    render();
    showToast("Plan updated");
  });

  els.openSettings?.addEventListener("click", () => openModal(els.settingsModal));
  els.closeSettings?.addEventListener("click", () => closeModal(els.settingsModal));
  els.settingsModal?.addEventListener("click", (e) => {
    if (e.target === els.settingsModal) closeModal(els.settingsModal);
  });

  qsa("input[name='rollover-mode']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.rolloverMode = e.target.value === "savings-goal" ? "savings-goal" : "next-day";
      state.carryForwardBalance = 0;
      state.settlementDayKey = "";
      saveState();
      settleYesterday();
      render();
      showToast("Rollover mode updated");
    });
  });

  els.savingsGoalName?.addEventListener("change", () => {
    state.savingsGoalName = sanitizeText(els.savingsGoalName.value, "Savings goal", 60);
    saveState();
    render();
  });

  els.editQuickAdds?.addEventListener("click", openQuickAddEditor);
  els.closeQuickAdds?.addEventListener("click", () => closeModal(els.quickAddModal));
  els.quickAddModal?.addEventListener("click", (e) => {
    if (e.target === els.quickAddModal) closeModal(els.quickAddModal);
  });
  els.quickAddForm?.addEventListener("submit", saveQuickAddEditor);

  els.undoLast?.addEventListener("click", undoLastTransaction);

  els.resetData?.addEventListener("click", () => {
    if (!window.confirm("Clear all Wallet Warden data from this browser?")) return;
    state = deepClone(DEFAULT_STATE);
    saveState();
    closeModal(els.settingsModal);
    render();
    showToast("All local data cleared");
  });

  els.startUsingApp?.addEventListener("click", () => {
    state.onboardingSeen = Boolean(els.dontShowOnboarding?.checked) || state.onboardingSeen;
    saveState();
    closeModal(els.onboardingModal);
  });
  let onboardingStep = 0;
  const onboardingViews = [
    `<div class="input-label">What's your monthly income source?</div><div class="chips mt8"><label class="option-row"><input type="radio" name="on-src" checked> Stipend</label><label class="option-row"><input type="radio" name="on-src"> Job</label><label class="option-row"><input type="radio" name="on-src"> Family</label><label class="option-row"><input type="radio" name="on-src"> Mixed</label></div><input id="on-income" class="text-input mt8" type="number" placeholder="Monthly income">`,
    `<div class="input-label">Fixed expenses (student template)</div><div class="row mt8"><input id="on-rent" class="text-input" type="number" placeholder="Rent"><input id="on-transport" class="text-input" type="number" placeholder="Transport"><input id="on-phone" class="text-input" type="number" placeholder="Phone"></div>`,
    `<div class="input-label">Set your first savings goal (optional)</div><div class="row mt8"><input id="on-goal-name" class="text-input" placeholder="Goal name"><input id="on-goal-target" class="text-input" type="number" placeholder="Target"></div>`
  ];
  function renderOnboardingStep() {
    if (!els.onboardingSteps) return;
    els.onboardingSteps.innerHTML = onboardingViews[onboardingStep];
    qsa(".on-dot").forEach((d, i) => d.classList.toggle("on-dot--active", i === onboardingStep));
    els.onboardingNext?.classList.toggle("hidden", onboardingStep >= 2);
    els.startUsingApp?.classList.toggle("hidden", onboardingStep < 2);
  }
  els.onboardingNext?.addEventListener("click", () => { onboardingStep = Math.min(2, onboardingStep + 1); renderOnboardingStep(); });
  renderOnboardingStep();
  els.startUsingApp?.addEventListener("click", () => {
    const income = clampNumber($("on-income")?.value, 0); const rent = clampNumber($("on-rent")?.value, 0);
    const transport = clampNumber($("on-transport")?.value, 0); const phone = clampNumber($("on-phone")?.value, 0);
    state.monthlyIncome = income || state.monthlyIncome; state.fixedExpenses = rent + transport + phone || state.fixedExpenses;
    const gName = sanitizeText($("on-goal-name")?.value, "", 40); const gTarget = clampNumber($("on-goal-target")?.value, 0);
    if (gName && gTarget > 0) state.goals.push(normalizeGoal({ id: safeRandomId(), name: gName, target: gTarget, saved: 0, emoji: "🎯", active: true }, state.goals.length));
    showToast(`You're all set! Daily limit ${currency(getDailySafeSpendRaw(now()))}`);
    saveState(); render();
  });

  els.tabButtons.forEach((btn) => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));
  els.tabLinks.forEach((btn) => btn.addEventListener("click", () => setActiveTab(btn.dataset.tabLink)));

  els.openAddTransaction?.addEventListener("click", openAddTransaction);
  els.closeAddTx?.addEventListener("click", () => closeModal(els.addTxModal));
  els.cancelTx?.addEventListener("click", () => closeModal(els.addTxModal));
  els.addTxModal?.addEventListener("click", (e) => {
    if (e.target === els.addTxModal) closeModal(els.addTxModal);
  });
  els.addTxForm?.addEventListener("submit", saveManualTransaction);
  els.txSplitToggle?.addEventListener("change", () => els.txSplitFields?.classList.toggle("hidden", !els.txSplitToggle.checked));

  els.searchQuery?.addEventListener("input", renderLogPanel);
  els.filterCategory?.addEventListener("change", renderLogPanel);
  els.filterMonth?.addEventListener("change", renderLogPanel);
  els.timeFilterChips?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-range]"); if (!btn) return;
    state.logRange = btn.dataset.range; saveState();
    qsa("#time-filter-chips .chip").forEach((c)=>c.classList.toggle("chip--active", c===btn));
    renderLogPanel();
  });

  els.goalsList?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-goal-action]");
    if (!btn) return;
    const id = btn.dataset.goalId;
    const action = btn.dataset.goalAction;
    const goal = state.goals.find((g) => g.id === id);
    if (!goal) return;
    const delta = 10;
    if (action === "add") goal.saved = clampNumber(goal.saved + delta, 0);
    if (action === "remove") goal.saved = clampNumber(goal.saved - delta, 0);
    saveState();
    renderGoals();
    showToast("Goal updated");
  });

  els.openGoalsEditor?.addEventListener("click", () => {
    const name = window.prompt("Goal name (e.g., Spring break trip):");
    if (!name) return;
    const target = clampNumber(window.prompt("Target amount (e.g., 500):"), 0, 999999);
    const emoji = sanitizeText(window.prompt("Emoji (optional):", "🎯"), "🎯", 4);
    state.goals.push(normalizeGoal({ id: safeRandomId(), name, target, saved: 0, emoji, active: true }, state.goals.length));
    saveState();
    renderGoals();
    showToast("Goal added");
  });

  els.modeMonth?.addEventListener("click", () => { state.semesterMode = false; saveState(); render(); });
  els.modeSem?.addEventListener("click", () => { state.semesterMode = true; saveState(); render(); });

  els.openDataModal?.addEventListener("click", () => openModal(els.dataModal));
  els.closeData?.addEventListener("click", () => closeModal(els.dataModal));
  els.dataModal?.addEventListener("click", (e) => {
    if (e.target === els.dataModal) closeModal(els.dataModal);
  });
  els.exportJson?.addEventListener("click", exportBackupJson);
  els.exportCsv?.addEventListener("click", exportTransactionsCsv);
  els.importJsonBtn?.addEventListener("click", importBackupJson);
  els.currencySelect?.addEventListener("change", () => { state.currencyCode = els.currencySelect.value; saveState(); render(); });
  els.dailyReminderToggle?.addEventListener("change", async () => {
    state.dailyReminderEnabled = !!els.dailyReminderToggle.checked;
    if (state.dailyReminderEnabled && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    saveState();
  });
  els.dailyReminderTime?.addEventListener("change", () => { state.dailyReminderTime = els.dailyReminderTime.value || "20:00"; saveState(); });

  window.addEventListener("resize", () => {
    document.documentElement.style.setProperty("--vw", `${window.innerWidth * 0.01}px`);
  });
}

function setupGlobalGuards() {
  window.addEventListener("error", () => {
    showToast("Handled an unexpected issue.");
    render();
  });
  window.addEventListener("unhandledrejection", () => {
    showToast("Recovered from async issue.");
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./service-worker.js");
  } catch {
    // Keep app resilient even if SW fails.
  }
}
function renderForecast(monthSpent, dailyLimit) {
  const daysElapsed = Math.max(1, now().getDate()); const avg = monthSpent / daysElapsed; const remDays = getDaysRemaining(now());
  const remaining = state.monthlyIncome - state.fixedExpenses - monthSpent;
  const projected = remaining - avg * remDays; const brokeIn = avg > 0 ? Math.floor(remaining / avg) : Infinity;
  if (!els.forecastBanner) return;
  if (projected >= 0) {
    els.forecastBanner.className = "bento forecast-banner forecast-ok";
    els.forecastBanner.textContent = `At your current pace, you'll have ${currency(projected)} left at month end.`;
  } else if (brokeIn > 0) {
    els.forecastBanner.className = "bento forecast-banner forecast-warn";
    els.forecastBanner.textContent = `⚠️ You may run out in ${brokeIn} days.`;
  } else {
    els.forecastBanner.className = "bento forecast-banner forecast-danger";
    els.forecastBanner.textContent = `🚨 Over pace. Reduce spending today to recover.`;
  }
}
function renderRankAndBadges() {
  const days = state.transactions.length ? Object.keys(buildDailyLimitMap(now())).filter((k)=>getSpentForDay(k) <= buildDailyLimitMap(now())[k]).length : 0;
  const ranks = [[10,"🐣 Broke Freshman"],[30,"📚 Savvy Sophomore"],[60,"💡 Budget Junior"],[100,"🎓 Senior Saver"],[99999,"🏆 Money Master"]];
  const idx = ranks.findIndex((r)=>days<=r[0]); const rank = ranks[idx] || ranks[ranks.length-1];
  els.rankBadge && (els.rankBadge.textContent = rank[1]);
  const prev = idx > 0 ? ranks[idx-1][0] : 0; const span = rank[0] - prev; const into = days - prev;
  if (els.rankProgress) els.rankProgress.style.width = `${Math.max(0, Math.min(100, (into / Math.max(1, span)) * 100))}%`;
  if (els.rankNextText) els.rankNextText.textContent = rank[0] > 1000 ? "Top rank reached" : `${Math.max(0, rank[0] - days)} days to next rank`;
  maybeEarnBadges(days);
}
function maybeEarnBadges(goodDays) {
  const set = new Set(state.badges);
  if (getStreak(now()) >= 7) set.add("🔥 On Fire");
  if (state.goals.length > 0) set.add("💰 First Goal");
  if (state.transactions.length >= 50) set.add("🧾 Log Master");
  if (state.goals.some((g)=>g.saved >= g.target && g.target > 0)) set.add("🏦 Saver");
  if (goodDays >= 30) set.add("📅 Full Month");
  state.badges = Array.from(set);
}
function renderStreakCalendar() {
  if (!els.streakCalendar) return; els.streakCalendar.innerHTML = "";
  const map = buildDailyLimitMap(now()); const keys = Object.keys(map).sort().slice(-30);
  keys.forEach((k)=>{ const d = document.createElement("div"); d.className = "streak-dot"; const spent = getSpentForDay(k); if (spent > 0 && spent <= map[k]) d.classList.add("good"); else if (spent > map[k]) d.classList.add("bad"); els.streakCalendar.appendChild(d); });
  if (els.longestStreak) els.longestStreak.textContent = `Longest streak: ${getLongestStreak(now())} days`;
}
function renderChallenge() {
  const wk = `${new Date().getFullYear()}-${Math.ceil((new Date().getDate()) / 7)}`;
  if (state.challengeWeekKey !== wk) { state.challengeWeekKey = wk; state.challengeCompleted = false; saveState(); }
  const challenges = ["Log every transaction for 7 days","Stay under your food budget this week","Spend $0 on entertainment for 3 days","Add $10 to a savings goal"];
  const idx = parseInt(wk.split("-")[1], 10) % challenges.length;
  if (els.challengeText) els.challengeText.textContent = challenges[idx];
  if (els.challengeStatus) { els.challengeStatus.textContent = state.challengeCompleted ? "Completed +50 XP" : "Active"; els.challengeStatus.className = `status-pill ${state.challengeCompleted ? "status-pill--ok" : "status-pill--neutral"}`; }
}
function renderTip() {
  if (!els.tipCard) return; const d = new Date(); const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d - start) / 86400000); const tip = TIPS[day % TIPS.length];
  els.tipCard.innerHTML = `<div class="row-between"><p class="label">Warden says</p><button id="dismiss-tip" class="subtle-btn" type="button">Skip</button></div><p class="hint mt8">🦉 ${tip}</p>`;
  $("dismiss-tip")?.addEventListener("click", () => { els.tipCard.style.display = "none"; });
}
function renderSettingsBits() {
  if (els.currencySelect && !els.currencySelect.options.length) {
    CURRENCIES.forEach((c)=>{ const o = document.createElement("option"); o.value = c; o.textContent = c; els.currencySelect.appendChild(o); });
  }
  if (els.currencySelect) els.currencySelect.value = state.currencyCode;
  if (els.dailyReminderToggle) els.dailyReminderToggle.checked = state.dailyReminderEnabled;
  if (els.dailyReminderTime) els.dailyReminderTime.value = state.dailyReminderTime || "20:00";
  if (els.lastBackupText) els.lastBackupText.textContent = state.lastBackupAt ? new Date(state.lastBackupAt).toLocaleString() : "Never";
  els.semesterFields?.classList.toggle("hidden", !state.semesterMode);
  els.modeMonth?.classList.toggle("chip--active", !state.semesterMode);
  els.modeSem?.classList.toggle("chip--active", state.semesterMode);
  if (els.semesterLumpSum) els.semesterLumpSum.value = state.semesterLumpSum || "";
  if (els.semesterEndDate) els.semesterEndDate.value = state.semesterEndDate || "";
}

function maybeShowOnboarding() {
  if (!state.onboardingSeen) {
    if (els.dontShowOnboarding) els.dontShowOnboarding.checked = false;
    openModal(els.onboardingModal);
  }
}

function init() {
  setupGlobalGuards();
  applyRecurringForMonthIfNeeded();
  settleYesterday();
  bindEvents();
  populateCategorySelect(els.txCategory, false);
  render();
  setActiveTab(state.activeTab || "home");
  maybeShowOnboarding();
  registerServiceWorker();
  const visits = clampNumber(localStorage.getItem("wallet-warden-visits"), 0, 999) + 1;
  localStorage.setItem("wallet-warden-visits", String(visits));
  if (visits >= 2 && !sessionStorage.getItem("install-hint-shown")) {
    showToast("Tip: Install Wallet Warden from your browser menu.");
    sessionStorage.setItem("install-hint-shown", "1");
  }
  if (state.lastBackupAt) {
    const days = Math.floor((Date.now() - new Date(state.lastBackupAt).getTime()) / 86400000);
    if (days >= 30) showToast("It's been 30 days since your last backup. Export your data?");
  }
}

init();
