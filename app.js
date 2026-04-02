/* Wallet Warden — main application */
const STORAGE_KEY = "wallet-warden-v3";
const LEGACY_KEYS = ["wallet-warden-v2", "wallet-warden-v1"];

const DEFAULT_CATEGORIES = Object.freeze([
  { id: "cat_food", name: "Food", emoji: "🍕", color: "#6C63FF" },
  { id: "cat_coffee", name: "Coffee", emoji: "☕", color: "#00D4AA" },
  { id: "cat_transit", name: "Transit", emoji: "🚌", color: "#FF6B6B" },
  { id: "cat_school", name: "School", emoji: "📚", color: "#FFB347" },
  { id: "cat_rent", name: "Rent", emoji: "🏠", color: "#4ECDC4" },
  { id: "cat_tuition", name: "Tuition", emoji: "🎓", color: "#45B7D1" },
  { id: "cat_subs", name: "Subscriptions", emoji: "📦", color: "#96CEB4" },
  { id: "cat_fun", name: "Fun", emoji: "🎮", color: "#DDA0DD" },
  { id: "cat_delivery", name: "Food delivery", emoji: "🍔", color: "#FFB347" },
  { id: "cat_grocery", name: "Groceries", emoji: "🛒", color: "#00D4AA" },
  { id: "cat_ent", name: "Entertainment", emoji: "🎬", color: "#6C63FF" },
  { id: "cat_other", name: "Other", emoji: "💸", color: "#A0A0C0" }
]);

const CURRENCY_OPTIONS = [
  { symbol: "$", code: "USD", name: "USD" },
  { symbol: "€", code: "EUR", name: "EUR" },
  { symbol: "£", code: "GBP", name: "GBP" },
  { symbol: "₺", code: "TRY", name: "TRY" },
  { symbol: "₸", code: "KZT", name: "KZT" },
  { symbol: "₴", code: "UAH", name: "UAH" },
  { symbol: "₹", code: "INR", name: "INR" },
  { symbol: "¥", code: "JPY", name: "JPY" },
  { symbol: "¥", code: "CNY", name: "CNY" },
  { symbol: "₩", code: "KRW", name: "KRW" },
  { symbol: "A$", code: "AUD", name: "AUD" },
  { symbol: "C$", code: "CAD", name: "CAD" },
  { symbol: "Fr", code: "CHF", name: "CHF" },
  { symbol: "kr", code: "SEK", name: "SEK" },
  { symbol: "kr", code: "NOK", name: "NOK" },
  { symbol: "zł", code: "PLN", name: "PLN" },
  { symbol: "RM", code: "MYR", name: "MYR" },
  { symbol: "₱", code: "PHP", name: "PHP" },
  { symbol: "฿", code: "THB", name: "THB" },
  { symbol: "R", code: "ZAR", name: "ZAR" }
];

const LEGACY_CURRENCIES = ["USD", "EUR", "GBP", "TRY", "KZT", "UAH", "INR", "CAD", "AUD", "JPY", "CNY", "KRW", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "BRL", "MXN", "SGD"];

const TIPS = [
  "The 50/30/20 rule: spend 50% on needs, 30% on wants, and save 20% of your income.",
  "Making coffee at home just 3 days a week instead of buying it can save you over $400 a year.",
  "Your emergency fund goal: save enough to cover 3 months of your fixed expenses.",
  "Before buying something, wait 24 hours. If you still want it tomorrow, it's probably worth it.",
  "Unsubscribe from one service you haven't used this month. Check your bank statement now.",
  "Paying yourself first means moving money to savings the moment your income arrives — before spending anything.",
  "Student discounts are often never advertised. Always ask before you pay full price.",
  "The difference between a want and a need: a need keeps you alive or enrolled. Everything else is a want.",
  "Tracking your spending is not about restriction. It's about making intentional choices.",
  "One impulse purchase a week adds up to over $1,500 a year. Pause before you tap.",
  "A budget isn't a punishment. It's a plan that lets you spend without guilt.",
  "Your biggest financial asset right now is time. Even small savings grow significantly over 10 years.",
  "Never lend money you can't afford to lose. Gift it instead — it saves the friendship.",
  "Meal planning for even 3 days a week can cut your food spending by up to 30%."
];

const CHALLENGES = [
  { id: 0, title: "Log every transaction", desc: "Log at least one transaction every day this week.", check: "daily_log_streak_7" },
  { id: 1, title: "Zero food delivery", desc: "Don't log any food delivery expenses for 7 days.", check: "no_delivery_7_days" },
  { id: 2, title: "Stay under limit 5 days", desc: "End 5 days this week under your daily limit.", check: "under_limit_5_of_7" },
  { id: 3, title: "Add to a savings goal", desc: "Contribute to any savings goal this week.", check: "goal_contribution" },
  { id: 4, title: "Entertainment freeze", desc: "Spend $0 on entertainment for 3 days this week.", check: "no_entertainment_3_days" },
  { id: 5, title: "Grocery budget", desc: "Keep grocery spending under $40 this week.", check: "groceries_under_40" },
  { id: 6, title: "Track a shared expense", desc: "Log at least one split/shared expense.", check: "split_expense" }
];

const GOAL_TYPES = [
  { id: "trip", label: "Trip ✈️", edge: "linear-gradient(90deg,#6C63FF,#00D4AA)" },
  { id: "tech", label: "Tech 💻", edge: "linear-gradient(90deg,#45B7D1,#6C63FF)" },
  { id: "emergency", label: "Emergency 🛡️", edge: "linear-gradient(90deg,#00D4AA,#4ECDC4)" },
  { id: "books", label: "Books 📚", edge: "linear-gradient(90deg,#FFB347,#FF6B6B)" },
  { id: "social", label: "Social 🎉", edge: "linear-gradient(90deg,#DDA0DD,#6C63FF)" },
  { id: "other", label: "Other ⭐", edge: "linear-gradient(90deg,#A0A0C0,#606080)" }
];

const DONUT_COLORS = ["#6C63FF", "#00D4AA", "#FF6B6B", "#FFB347", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA0DD"];

const DEFAULT_STATE = Object.freeze({
  schemaVersion: 5,
  monthlyIncome: 0,
  fixedExpenses: 0,
  incomeSources: [],
  recurringItems: [],
  categories: [...DEFAULT_CATEGORIES],
  transactions: [],
  quickAdds: [
    { id: "q1", emoji: "☕", label: "Coffee", amount: 5, categoryId: "cat_coffee" },
    { id: "q2", emoji: "🚌", label: "Transit", amount: 3, categoryId: "cat_transit" },
    { id: "q3", emoji: "🍕", label: "Food", amount: 10, categoryId: "cat_food" },
    { id: "q4", emoji: "📚", label: "School", amount: 8, categoryId: "cat_school" }
  ],
  rolloverMode: "next-day",
  carryForwardBalance: 0,
  savingsGoalName: "New laptop",
  savingsTotal: 0,
  goals: [
    {
      id: "goal_laptop",
      name: "New laptop",
      target: 900,
      saved: 0,
      emoji: "💻",
      active: true,
      type: "Tech",
      deadline: ""
    }
  ],
  onboardingSeen: false,
  settlementDayKey: "",
  lastRecurringAppliedMonth: "",
  theme: "dark",
  currencyCode: "USD",
  activeTab: "home",
  logRange: "all",
  semesterMode: false,
  semesterLumpSum: 0,
  semesterEndDate: "",
  semesterStartDate: "",
  badges: [],
  dailyReminderEnabled: false,
  dailyReminderTime: "20:00",
  lastBackupAt: "",
  challengeWeekKey: "",
  challengeCompleted: false,
  installPromptSeenCount: 0,
  lastUpdated: 0
});

const $ = (id) => document.getElementById(id);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

function deepClone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

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

function daysBetweenInclusive(a, b) {
  const t0 = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const t1 = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.max(1, Math.round((t1 - t0) / 86400000) + 1);
}

function getMonthBounds(dateObj) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { start, end, totalDays: end.getDate() };
}

function loadWwCurrency() {
  try {
    const raw = localStorage.getItem("ww_currency");
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.code && p.symbol) return { symbol: p.symbol, code: p.code };
    }
  } catch (_) {}
  return null;
}

function saveWwCurrency(sym, code) {
  try {
    localStorage.setItem("ww_currency", JSON.stringify({ symbol: sym, code }));
  } catch (_) {}
}

function getCurrencyMeta() {
  const fromLs = loadWwCurrency();
  const code = state.currencyCode || "USD";
  const opt = CURRENCY_OPTIONS.find((c) => c.code === code);
  if (fromLs && fromLs.code === code) return fromLs;
  if (opt) return opt;
  return { symbol: "$", code, name: code };
}

function fmtMoney(value) {
  const n = clampNumber(value, -999999999, 999999999);
  const sym = getCurrencyMeta().symbol || "$";
  const abs = Math.abs(n);
  const str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n < 0 ? "-" : ""}${sym}${str}`;
}

function isExpenseTx(tx) {
  return tx.txType !== "income";
}

function isIncomeTx(tx) {
  return tx.txType === "income";
}

function normalizeCategory(item, idx) {
  const id = sanitizeText(item?.id, `cat_${idx}`, 32).replace(/\s+/g, "_");
  const base = DEFAULT_CATEGORIES.find((c) => c.id === id);
  return {
    id,
    name: sanitizeText(item?.name, "Category", 28),
    emoji: sanitizeText(item?.emoji, "🏷️", 4),
    color: sanitizeText(item?.color, base?.color || DONUT_COLORS[idx % DONUT_COLORS.length], 16)
  };
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
    settled: Boolean(item?.settled),
    txType: item?.txType === "income" ? "income" : "expense"
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
    deadline: sanitizeText(item?.deadline, "", 12),
    monthlyContribution: clampNumber(item?.monthlyContribution, 0, 999999)
  };
}

function normalizeState(raw) {
  const base = { ...deepClone(DEFAULT_STATE), ...(raw && typeof raw === "object" ? raw : {}) };

  const categories = (Array.isArray(base.categories) ? base.categories : [...DEFAULT_CATEGORIES]).map(normalizeCategory).slice(0, 50);
  const catIds = new Set(categories.map((c) => c.id));
  if (!catIds.has("cat_other")) categories.push({ id: "cat_other", name: "Other", emoji: "💸", color: "#A0A0C0" });

  const txs = (Array.isArray(base.transactions) ? base.transactions : []).map(normalizeTransaction).filter(Boolean).slice(-3000);
  const quickAdds = (Array.isArray(base.quickAdds) ? base.quickAdds : deepClone(DEFAULT_STATE.quickAdds)).map(normalizeQuickAdd).slice(0, 8);
  const goals = (Array.isArray(base.goals) ? base.goals : deepClone(DEFAULT_STATE.goals)).map(normalizeGoal).slice(0, 25);

  const normalized = {
    schemaVersion: 5,
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
    currencyCode: [...CURRENCY_OPTIONS.map((c) => c.code), ...LEGACY_CURRENCIES].includes(base.currencyCode) ? base.currencyCode : "USD",
    activeTab: sanitizeText(base.activeTab, "home", 12),
    logRange: ["all", "today", "week", "month"].includes(base.logRange) ? base.logRange : "all",
    semesterMode: Boolean(base.semesterMode),
    semesterLumpSum: clampNumber(base.semesterLumpSum, 0),
    semesterEndDate: sanitizeText(base.semesterEndDate, "", 12),
    semesterStartDate: sanitizeText(base.semesterStartDate, "", 12),
    badges: Array.isArray(base.badges) ? base.badges.slice(0, 40) : [],
    dailyReminderEnabled: Boolean(base.dailyReminderEnabled),
    dailyReminderTime: sanitizeText(base.dailyReminderTime, "20:00", 5),
    lastBackupAt: sanitizeText(base.lastBackupAt, "", 32),
    challengeWeekKey: sanitizeText(base.challengeWeekKey, "", 16),
    challengeCompleted: Boolean(base.challengeCompleted),
    installPromptSeenCount: clampNumber(base.installPromptSeenCount, 0, 99),
    lastUpdated: clampNumber(base.lastUpdated, 0, Number.MAX_SAFE_INTEGER)
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

let state = normalizeState(loadState());

function saveState() {
  try {
    state = normalizeState(state);
    state.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    try {
      localStorage.setItem("ww_budget_mode", state.semesterMode ? "semester" : "monthly");
    } catch (_) {}
    syncAfterSave();
  } catch {
    toast("Storage is full. Export a backup first.", "danger");
  }
}

function getAppDataForSync() {
  return deepClone(state);
}

async function syncAfterSave() {
  if (typeof window.syncToCloud !== "function" || !window.wwSupabaseClient) return;
  try {
    await window.syncToCloud(getAppDataForSync());
    localStorage.removeItem("ww_sync_pending");
    localStorage.setItem("ww_last_sync_ok", String(Date.now()));
  } catch (_) {
    try {
      localStorage.setItem("ww_sync_pending", "true");
    } catch (__) {}
  }
}

function sumExpenseAmount(entries) {
  return entries.reduce((acc, item) => acc + (isExpenseTx(item) ? clampNumber(item.amount, 0) : 0), 0);
}

function sumIncomeAmount(entries) {
  return entries.reduce((acc, item) => acc + (isIncomeTx(item) ? clampNumber(item.amount, 0) : 0), 0);
}

function getCurrentMonthTransactions(dateObj = now()) {
  const key = monthKey(dateObj);
  return state.transactions.filter((tx) => tx.monthKey === key);
}

function getDaysRemainingInMonth(dateObj = now()) {
  const { totalDays } = getMonthBounds(dateObj);
  return Math.max(1, totalDays - dateObj.getDate() + 1);
}

function getSemesterBounds(today = now()) {
  const end = state.semesterEndDate ? new Date(state.semesterEndDate + "T12:00:00") : null;
  let start = state.semesterStartDate ? new Date(state.semesterStartDate + "T12:00:00") : null;
  if (!start || Number.isNaN(start.getTime())) {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
  }
  if (!end || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

function getSemesterSpent(today = now()) {
  const b = getSemesterBounds(today);
  if (!b) return 0;
  const t0 = b.start.getTime();
  const t1 = b.end.getTime();
  return sumExpenseAmount(
    state.transactions.filter((tx) => {
      const ct = new Date(tx.createdAt).getTime();
      return ct >= t0 && ct <= t1 + 86400000;
    })
  );
}

function getDailySafeSpendRaw(dateObj = now()) {
  if (state.semesterMode && state.semesterEndDate) {
    const b = getSemesterBounds(dateObj);
    if (!b) return 0;
    const end = b.end;
    const todayStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
    const endStart = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    const remainingDays = Math.max(1, Math.round((endStart - todayStart) / 86400000) + 1);
    const totalDaysInSem = Math.max(1, daysBetweenInclusive(b.start, end));
    const totalFixedForSem = (clampNumber(state.fixedExpenses, 0) / 30) * totalDaysInSem;
    const spent = getSemesterSpent(dateObj);
    const remainingMoney = clampNumber(state.semesterLumpSum, 0) - totalFixedForSem - spent;
    return remainingMoney / remainingDays;
  }
  const monthSpent = sumExpenseAmount(getCurrentMonthTransactions(dateObj));
  const daysRemaining = getDaysRemainingInMonth(dateObj);
  const available =
    clampNumber(state.monthlyIncome, 0) -
    clampNumber(state.fixedExpenses, 0) -
    monthSpent +
    clampNumber(state.carryForwardBalance, 0);
  return available / daysRemaining;
}

function getSpentForDay(targetDateKey) {
  return sumExpenseAmount(state.transactions.filter((tx) => tx.date === targetDateKey));
}

function buildDailyLimitMap(dateObj = now()) {
  const map = {};
  if (state.semesterMode && state.semesterEndDate) {
    const b = getSemesterBounds(dateObj);
    if (!b) return map;
    const cursor = new Date(b.start);
    while (cursor <= b.end && cursor <= dateObj) {
      const k = dateKey(cursor);
      const raw = getDailySafeSpendRaw(cursor);
      map[k] = clampNumber(raw, 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    return map;
  }
  const { totalDays } = getMonthBounds(dateObj);
  const txs = getCurrentMonthTransactions(dateObj).sort((a, b) => a.createdAt - b.createdAt);
  let carry = clampNumber(state.carryForwardBalance, 0);
  for (let day = 1; day <= dateObj.getDate(); day += 1) {
    const thisDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), day);
    const thisDateKey = dateKey(thisDate);
    const spentToDate = sumExpenseAmount(
      txs.filter((tx) => new Date(tx.createdAt).getDate() <= day && isExpenseTx(tx))
    );
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
  const map = buildDailyLimitMap(dateObj);
  const keys = Object.keys(map).sort();
  let best = 0;
  let run = 0;
  keys.forEach((k) => {
    const ok = getSpentForDay(k) <= map[k];
    run = ok ? run + 1 : 0;
    best = Math.max(best, run);
  });
  return best;
}

function loadGamification() {
  const def = {
    totalDaysUnderLimit: 0,
    totalTransactionsLogged: 0,
    goalsCompleted: 0,
    weeklyChallenge: { id: 0, startDate: "", completed: false },
    earnedBadges: [],
    longestStreak: 0,
    currencyChangedOnce: false,
    lastRankToast: -1,
    lastStreakMilestone: -1
  };
  try {
    const raw = localStorage.getItem("ww_gamification");
    if (!raw) return def;
    return { ...def, ...JSON.parse(raw) };
  } catch {
    return def;
  }
}

function saveGamification(g) {
  try {
    localStorage.setItem("ww_gamification", JSON.stringify(g));
  } catch (_) {}
}

function reconcileGamification() {
  const g = loadGamification();
  g.totalTransactionsLogged = state.transactions.length;
  g.longestStreak = Math.max(g.longestStreak || 0, getLongestStreak(now()));
  const map = buildDailyLimitMap(now());
  const keys = Object.keys(map).sort();
  let under = 0;
  keys.forEach((k) => {
    if (getSpentForDay(k) <= map[k]) under += 1;
  });
  g.totalDaysUnderLimit = Math.max(g.totalDaysUnderLimit || 0, under);
  g.goalsCompleted = state.goals.filter((x) => x.saved >= x.target && x.target > 0).length;
  saveGamification(g);
  return g;
}

const RANKS = [
  { max: 10, emoji: "🐣", name: "Broke Freshman" },
  { max: 30, emoji: "📚", name: "Savvy Sophomore" },
  { max: 60, emoji: "💡", name: "Budget Junior" },
  { max: 100, emoji: "🎓", name: "Senior Saver" },
  { max: 1e9, emoji: "🏆", name: "Money Master" }
];

function getRankForDays(days) {
  let prev = 0;
  for (let i = 0; i < RANKS.length; i += 1) {
    if (days <= RANKS[i].max) {
      return { ...RANKS[i], prev, idx: i };
    }
    prev = RANKS[i].max;
  }
  return { ...RANKS[RANKS.length - 1], prev: 0, idx: RANKS.length - 1 };
}

function toast(message, type = "info") {
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = message;
  t.style.cssText =
    "position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--surface2);color:var(--text-primary);padding:12px 20px;border-radius:var(--r-full);font-size:14px;font-family:Inter,sans-serif;z-index:10000;opacity:0;transition:opacity 0.3s ease, transform 0.3s ease;border:1px solid var(--border);max-width:min(320px,92vw);text-align:center;pointer-events:none;";
  const host = $("app-toast-host");
  if (host) host.appendChild(t);
  else document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
  });
  window.setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(20px)";
    window.setTimeout(() => t.remove(), 300);
  }, 3000);
}

function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 6 + 4,
    d: Math.random() * 60 + 10,
    color: ["#6C63FF", "#00D4AA", "#FFB347", "#FF6B6B", "#FFFFFF"][Math.floor(Math.random() * 5)],
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.05
  }));
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.tiltAngle += p.tiltSpeed;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) * 0.8;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      p.x += Math.sin(frame * 0.01) * 0.5;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });
    frame += 1;
    if (frame < 200) requestAnimationFrame(animate);
    else canvas.remove();
  };
  requestAnimationFrame(animate);
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function animateCount(el, from, to, duration = 600, formatter) {
  if (!el) return;
  const start = performance.now();
  const fmt = formatter || ((v) => v);
  const diff = to - from;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const v = from + diff * easeOutCubic(p);
    el.textContent = fmt(v);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderEmptyState(container, iconSvgOrEl, title, subtitle, btnText, btnAction) {
  if (!container) return;
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "empty-state card";
  if (typeof iconSvgOrEl === "string") {
    wrap.innerHTML = iconSvgOrEl;
  } else if (iconSvgOrEl) {
    wrap.appendChild(iconSvgOrEl);
  }
  const h = document.createElement("h3");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = subtitle;
  wrap.appendChild(h);
  wrap.appendChild(p);
  if (btnText) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn-primary";
    b.textContent = btnText;
    b.addEventListener("click", btnAction);
    wrap.appendChild(b);
  }
  container.appendChild(wrap);
}

function setActiveTab(tab) {
  qsa("[data-tab-panel]").forEach((panel) => {
    const on = panel.dataset.tabPanel === tab;
    panel.classList.toggle("hidden", !on);
    panel.classList.toggle("is-visible", on);
  });
  qsa(".nav-tab").forEach((btn) => {
    const is = btn.dataset.tab === tab;
    btn.classList.toggle("nav-tab--active", is);
    if (is) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  qsa(".mob-tab").forEach((btn) => {
    const is = btn.dataset.tab === tab;
    btn.classList.toggle("mob-tab--active", is);
    if (is) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  state.activeTab = tab;
  saveState();
  if (tab === "log") renderLogPanel();
  if (tab === "goals") window.setTimeout(() => animateGoalBars(), 80);
  if (tab === "insights") renderInsights();
}

function animateGoalBars() {
  qsa(".goal-progress-bar > div").forEach((bar, i) => {
    const w = bar.dataset.width || "0";
    bar.style.width = "0%";
    window.setTimeout(() => {
      bar.style.width = `${w}%`;
    }, 100 + i * 100);
  });
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

let logCategoryFilter = "";

function renderCategoryChips() {
  const host = $("category-filter-chips");
  if (!host) return;
  host.innerHTML = "";
  const all = document.createElement("button");
  all.type = "button";
  all.className = `chip ${!logCategoryFilter ? "chip--active" : ""}`;
  all.textContent = "All categories";
  all.setAttribute("aria-label", "All categories");
  all.addEventListener("click", () => {
    logCategoryFilter = "";
    qsa("#category-filter-chips .chip").forEach((c) => c.classList.remove("chip--active"));
    all.classList.add("chip--active");
    renderLogPanel();
  });
  host.appendChild(all);
  state.categories.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `chip ${logCategoryFilter === c.id ? "chip--active" : ""}`;
    b.textContent = `${c.emoji} ${c.name}`;
    b.setAttribute("aria-label", `Filter ${c.name}`);
    b.addEventListener("click", () => {
      logCategoryFilter = c.id;
      qsa("#category-filter-chips .chip").forEach((x) => x.classList.remove("chip--active"));
      b.classList.add("chip--active");
      renderLogPanel();
    });
    host.appendChild(b);
  });
}

let weeklyChartHover = null;

function drawWeeklyChart() {
  const canvas = $("weekly-chart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, rect.width) * dpr;
  canvas.height = 160 * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = canvas.width / dpr;
  const h = 160;
  ctx.clearRect(0, 0, w, h);
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const values = days.map((d) => getSpentForDay(dateKey(d)));
  const max = Math.max(1, ...values);
  const padL = 36;
  const padR = 12;
  const padB = 28;
  const padT = 12;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const lim = clampNumber(buildDailyLimitMap(now())[dateKey(now())] || getDailySafeSpendRaw(now()), 0);
  const yLim = padT + innerH - (lim / max) * innerH;
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#6C63FF";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, yLim);
  ctx.lineTo(padL + innerW, yLim);
  ctx.stroke();
  ctx.setLineDash([]);
  const n = 7;
  const gap = 6;
  const barW = (innerW - gap * (n - 1)) / n;
  days.forEach((d, i) => {
    const val = values[i];
    const ratio = val / max;
    const bh = Math.max(4, ratio * innerH);
    const x = padL + i * (barW + gap);
    const y = padT + innerH - bh;
    const dk = dateKey(d);
    const dayLim = clampNumber(buildDailyLimitMap(now())[dk] ?? getDailySafeSpendRaw(d), 0);
    const over = val > dayLim && dayLim >= 0;
    ctx.fillStyle = over
      ? getComputedStyle(document.documentElement).getPropertyValue("--danger").trim() || "#FF6B6B"
      : getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00D4AA";
    const bw = dk === dateKey(now()) ? barW * 1.08 : barW;
    const ox = dk === dateKey(now()) ? x - (bw - barW) / 2 : x;
    if (dk === dateKey(now())) {
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 10;
    }
    ctx.fillRect(ox, y, bw, bh);
    ctx.shadowBlur = 0;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-muted").trim() || "#606080";
    ctx.font = "11px Inter,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(dayNames[d.getDay()], x + barW / 2, h - 8);
  });
  weeklyChartHover = { days, values, padL, barW, gap, innerW, h, w };
}

function arcPath(cx, cy, r, a0, a1) {
  const rad = (a) => ((a - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

let donutHighlight = null;

function renderDonut(monthTx) {
  const wrap = $("donut-wrap");
  const legend = $("donut-legend");
  if (!wrap || !legend) return;
  const byCat = {};
  monthTx.filter(isExpenseTx).forEach((tx) => {
    byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount;
  });
  const rows = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  if (!rows.length) {
    wrap.innerHTML =
      '<p class="hint" style="text-align:center;padding:24px">No transactions yet this month.</p>';
    legend.innerHTML = "";
    return;
  }
  const total = rows.reduce((a, [, v]) => a + v, 0);
  let start = 0;
  const segs = rows
    .map(([id, v], i) => {
      const pct = v / total;
      const end = start + pct * 360;
      const col = state.categories.find((c) => c.id === id)?.color || DONUT_COLORS[i % DONUT_COLORS.length];
      const op = donutHighlight && donutHighlight !== id ? 0.3 : 1;
      const s = `<path class="donut-seg" data-cat="${id}" d="${arcPath(
        90,
        90,
        58,
        start,
        end
      )}" stroke="${col}" stroke-opacity="${op}" stroke-width="22" fill="none" style="cursor:pointer"></path>`;
      start = end;
      return s;
    })
    .join("");
  wrap.innerHTML = `<svg viewBox="0 0 180 180" width="200" height="200" aria-label="Category donut"><circle cx="90" cy="90" r="58" stroke="var(--border)" stroke-width="22" fill="none"></circle><text x="90" y="88" text-anchor="middle" class="font-space" font-size="14" fill="currentColor">${fmtMoney(
    total
  )}</text><text x="90" y="104" text-anchor="middle" font-size="11" fill="var(--text-muted)">total</text>${segs}</svg>`;
  legend.innerHTML = "";
  rows.forEach(([catId, amt], i) => {
    const cat = state.categories.find((c) => c.id === catId) || { name: "Other", emoji: "🏷️", color: DONUT_COLORS[i] };
    const pct = Math.round((amt / total) * 100);
    const li = document.createElement("li");
    li.dataset.cat = catId;
    li.innerHTML = `<span class="donut-dot" style="background:${cat.color}"></span><span class="flex-1">${cat.emoji} ${
      cat.name
    }</span><span class="font-space">${fmtMoney(amt)}</span><span class="hint">${pct}%</span>`;
    li.addEventListener("click", () => {
      donutHighlight = donutHighlight === catId ? null : catId;
      renderDonut(monthTx);
      logCategoryFilter = catId;
      renderCategoryChips();
      setActiveTab("log");
      renderLogPanel();
      const el = document.getElementById("tab-log");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    legend.appendChild(li);
  });
  wrap.querySelectorAll(".donut-seg").forEach((path) => {
    path.addEventListener("click", () => {
      const id = path.dataset.cat;
      donutHighlight = donutHighlight === id ? null : id;
      renderDonut(monthTx);
      logCategoryFilter = id || "";
      renderCategoryChips();
      setActiveTab("log");
      renderLogPanel();
    });
  });
}

function renderForecast(monthSpent) {
  const el = $("forecast-banner");
  if (!el) return;
  const t = now();
  const daysElapsed = Math.max(1, t.getDate());
  const totalSpent = monthSpent;
  const avgDailySpend = totalSpent / daysElapsed;
  const remainingBudget = state.monthlyIncome - state.fixedExpenses - totalSpent;
  const daysUntilBroke = Math.floor(remainingBudget / Math.max(avgDailySpend, 0.01));
  const daysLeftInMonth = getMonthBounds(t).totalDays - t.getDate();
  const projectedSurplus = remainingBudget - avgDailySpend * daysLeftInMonth;
  el.className = "forecast-pill";
  if (daysUntilBroke < daysLeftInMonth && avgDailySpend > 0 && remainingBudget > 0) {
    el.classList.add("forecast-pill--danger");
    el.textContent = `⚠️ At this pace, you'll run out of money in ${daysUntilBroke} days`;
  } else if (projectedSurplus > 0 && totalSpent > 0) {
    el.classList.add("forecast-pill--accent");
    el.textContent = `✓ On track to have ${fmtMoney(projectedSurplus)} left at month end`;
  } else {
    el.classList.add("forecast-pill--muted");
    el.textContent = "📊 Log some transactions to see your forecast";
  }
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return "Yesterday";
  return `${Math.floor(s / 86400)} days ago`;
}

function renderHistoryPreview(monthTx) {
  const list = $("transaction-list");
  if (!list) return;
  list.innerHTML = "";
  const sorted = [...monthTx].sort((a, b) => b.createdAt - a.createdAt);
  if (!sorted.length) {
    const wrap = document.createElement("li");
    wrap.style.listStyle = "none";
    renderEmptyState(
      wrap,
      '<svg width="48" height="48" aria-hidden="true"><use href="#warden-owl"/></svg>',
      "No transactions yet",
      "Tap + to log your first expense",
      "+ Add Transaction",
      () => openAddTransaction()
    );
    list.appendChild(wrap);
    return;
  }
  sorted.slice(0, 5).forEach((tx) => {
    const catObj = state.categories.find((c) => c.id === tx.categoryId);
    const li = document.createElement("li");
    li.className = "tx-card tx-card--new";
    const dot = catObj?.color || "#6C63FF";
    li.innerHTML = `
      <div class="tx-card__emoji" style="background:${dot}33">${tx.emoji}</div>
      <div class="tx-card__mid">
        <p class="tx-card__title">${tx.label}</p>
        <p class="tx-card__cat">${catObj ? `${catObj.emoji} ${catObj.name}` : ""}</p>
        <p class="tx-card__time">${timeAgo(tx.createdAt)}</p>
      </div>
      <div class="tx-card__amt ${isIncomeTx(tx) ? "tx-card__amt--inc" : "tx-card__amt--exp"}">${isIncomeTx(tx) ? "+" : "-"}${fmtMoney(
        tx.amount
      )}</div>`;
    list.appendChild(li);
  });
}

function renderQuickAddButtons() {
  const grid = $("quick-add-grid");
  if (!grid) return;
  grid.innerHTML = "";
  state.quickAdds.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quick-add-btn";
    btn.setAttribute("aria-label", `Add ${item.label} ${fmtMoney(item.amount)}`);
    btn.innerHTML = `<div class="quick-title">${item.emoji} ${item.label}</div><div class="quick-price">${fmtMoney(item.amount)}</div>`;
    btn.addEventListener("click", () => addQuickExpense(item));
    grid.appendChild(btn);
  });
  if (state.quickAdds.length < 8) {
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "quick-add-btn";
    plus.innerHTML = `<div class="quick-title">➕ Add slot</div><div class="quick-price">Up to 8</div>`;
    plus.addEventListener("click", () => openQuickAddEditor());
    grid.appendChild(plus);
  }
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
      monthKey: monthKey(d),
      txType: "expense"
    });
    if (!tx) return;
    state.transactions.push(tx);
    if (state.transactions.length > 3000) state.transactions = state.transactions.slice(-3000);
    saveState();
    render();
    toast(`${entry.emoji} ${entry.label} logged`, "info");
  } catch {
    toast("Could not add transaction.", "danger");
  }
}

function getEditingTx() {
  return $("tx-edit-id")?.value || "";
}

function openAddTransaction(editTx) {
  populateCategorySelect($("tx-category"), false);
  const d = now();
  $("tx-edit-id").value = editTx ? editTx.id : "";
  $("add-transaction-title").textContent = editTx ? "Edit Transaction" : "Add Transaction";
  $("delete-tx").classList.toggle("hidden", !editTx);
  $("tx-emoji").value = editTx?.emoji || "💸";
  $("tx-amount").value = editTx ? String(editTx.amount) : "";
  $("tx-label").value = editTx?.label || "";
  $("tx-note").value = editTx?.note || "";
  $("tx-date").value = editTx ? editTx.date : dateKey(d);
  $("tx-category").value = editTx?.categoryId || "cat_other";
  $("tx-type").value = editTx?.txType === "income" ? "income" : "expense";
  $("tx-split-toggle").checked = Boolean(editTx?.split);
  $("tx-split-fields").classList.toggle("hidden", !editTx?.split);
  $("tx-split-count").value = String(editTx?.splitCount || 2);
  $("tx-split-names").value = editTx?.splitNames || "";
  openModal($("add-transaction-modal"));
  $("tx-amount")?.focus();
}

function saveManualTransaction(event) {
  event.preventDefault();
  const createdAtDate = new Date($("tx-date")?.value || dateKey(now()));
  const createdAt = Number.isFinite(createdAtDate.getTime()) ? createdAtDate.getTime() : Date.now();
  let amount = clampNumber($("tx-amount")?.value, 0, 999999);
  const split = Boolean($("tx-split-toggle")?.checked);
  const splitCount = clampNumber($("tx-split-count")?.value || 2, 2, 6);
  if (split && $("tx-type")) {
    if ($("tx-type").value === "expense") amount = amount / splitCount;
  }
  const payload = {
    id: getEditingTx() || safeRandomId(),
    emoji: sanitizeText($("tx-emoji")?.value, "💸", 4),
    label: sanitizeText($("tx-label")?.value, "Expense", 40),
    amount,
    categoryId: sanitizeText($("tx-category")?.value, "cat_other", 32),
    note: sanitizeText($("tx-note")?.value, "", 120),
    createdAt,
    date: dateKey(new Date(createdAt)),
    monthKey: monthKey(new Date(createdAt)),
    split,
    splitCount,
    splitNames: sanitizeText($("tx-split-names")?.value, "", 120),
    settled: false,
    txType: $("tx-type")?.value === "income" ? "income" : "expense"
  };
  const tx = normalizeTransaction(payload);
  if (!tx || tx.amount <= 0) return toast("Enter an amount > 0", "danger");
  if (getEditingTx()) {
    const idx = state.transactions.findIndex((t) => t.id === tx.id);
    if (idx >= 0) state.transactions[idx] = tx;
  } else {
    state.transactions.push(tx);
  }
  saveState();
  closeModal($("add-transaction-modal"));
  render();
  toast("Transaction saved", "info");
}

function deleteEditingTx() {
  const id = getEditingTx();
  if (!id) return;
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveState();
  closeModal($("add-transaction-modal"));
  render();
  toast("Transaction deleted", "info");
}

function deleteTxById(id) {
  if (!window.confirm("Delete this transaction?")) return;
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveState();
  render();
  toast("Deleted", "info");
}

function renderLogPanel() {
  const list = $("filtered-transaction-list");
  if (!list) return;
  if (!$("filter-month")?.value) {
    const d = now();
    $("filter-month").value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  const q = sanitizeText($("search-query")?.value, "", 80).toLowerCase();
  const month = $("filter-month")?.value || monthKey(now());

  const filtered = state.transactions
    .filter((tx) =>
      state.logRange === "month" || state.logRange === "all" ? tx.monthKey === month || state.logRange === "all" : true
    )
    .filter((tx) => {
      const n = now();
      const d = new Date(tx.createdAt);
      if (state.logRange === "today") return tx.date === dateKey(n);
      if (state.logRange === "week") return d >= new Date(n.getFullYear(), n.getMonth(), n.getDate() - 6);
      return true;
    })
    .filter((tx) => (logCategoryFilter ? tx.categoryId === logCategoryFilter : true))
    .filter((tx) => {
      if (!q) return true;
      const catName = state.categories.find((c) => c.id === tx.categoryId)?.name || "";
      return `${tx.label} ${tx.note} ${catName}`.toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 400);

  const expenseTotal = sumExpenseAmount(filtered);
  const incomeTotal = sumIncomeAmount(filtered);
  if ($("filtered-total"))
    $("filtered-total").textContent =
      incomeTotal > expenseTotal ? `+${fmtMoney(incomeTotal - expenseTotal)}` : `-${fmtMoney(expenseTotal - incomeTotal)}`;

  list.innerHTML = "";
  if (!filtered.length) {
    const wrap = document.createElement("li");
    wrap.style.listStyle = "none";
    renderEmptyState(
      wrap,
      '<svg width="48" height="48"><use href="#warden-owl"/></svg>',
      "No transactions yet",
      "Tap + to log your first expense",
      "+ Add Transaction",
      () => openAddTransaction()
    );
    list.appendChild(wrap);
    renderSharedExpenses(filtered);
    return;
  }
  filtered.forEach((tx) => {
    const catObj = state.categories.find((c) => c.id === tx.categoryId);
    const li = document.createElement("li");
    li.className = "tx-card tx-card--new";
    const dot = catObj?.color || "#6C63FF";
    li.innerHTML = `
      <div class="tx-card__emoji" style="background:${dot}33">${tx.emoji}</div>
      <div class="tx-card__mid">
        <p class="tx-card__title">${tx.label}${tx.split ? ' <span class="split-badge" title="Split">👥</span>' : ""}</p>
        <p class="tx-card__cat">${catObj ? `${catObj.emoji} ${catObj.name}` : ""}</p>
        <p class="tx-card__time">${timeAgo(tx.createdAt)}</p>
      </div>
      <div class="tx-card__amt ${isIncomeTx(tx) ? "tx-card__amt--inc" : "tx-card__amt--exp"}">${isIncomeTx(tx) ? "+" : "-"}${fmtMoney(
        tx.amount
      )}</div>
      <button type="button" class="tx-card__del" aria-label="Delete transaction">×</button>`;
    li.querySelector(".tx-card__del").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTxById(tx.id);
    });
    li.addEventListener("click", () => openAddTransaction(tx));
    let sx = 0;
    li.addEventListener(
      "touchstart",
      (e) => {
        sx = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    li.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (dx < -80) {
        li.style.transform = "translateX(-120%)";
        li.style.opacity = "0";
        window.setTimeout(() => {
          if (window.confirm("Delete this transaction?")) deleteTxById(tx.id);
          else {
            li.style.transform = "";
            li.style.opacity = "";
          }
        }, 200);
      }
    });
    list.appendChild(li);
  });
  renderSharedExpenses(filtered);
}

function renderSharedExpenses(allFiltered) {
  const ul = $("shared-expense-list");
  const bal = $("shared-balance");
  const cnt = $("shared-exp-summary-count");
  if (!ul || !bal) return;
  const shared = allFiltered.filter((t) => t.split);
  if (cnt) cnt.textContent = shared.length ? `(${shared.length})` : "";
  ul.innerHTML = "";
  let owed = 0;
  shared.forEach((tx) => {
    const your = tx.amount;
    const others = tx.amount * (Math.max(2, tx.splitCount || 2) - 1);
    if (!tx.settled) owed += others;
    const li = document.createElement("li");
    li.className = "tx-card";
    li.innerHTML = `<div class="tx-card__emoji" style="background:#6C63FF22">👥</div>
      <div class="tx-card__mid"><p class="tx-card__title">${tx.label}</p><p class="tx-card__cat">${tx.splitCount} people</p></div>
      <div class="tx-card__amt tx-card__amt--exp">${fmtMoney(tx.amount)}</div>`;
    ul.appendChild(li);
  });
  if (!shared.length) ul.innerHTML = `<li class="hint">No shared expenses in this view.</li>`;
  bal.textContent = `Outstanding share from others: ${fmtMoney(owed)}`;
}

function renderGoals() {
  const list = $("goals-list");
  const empty = $("goals-empty");
  if (!list) return;
  list.innerHTML = "";
  const goals = (state.goals || []).filter((g) => g.active);
  if (!goals.length) {
    if (empty)
      renderEmptyState(
        empty,
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        "No goals yet",
        "What are you saving for?",
        "Create First Goal",
        () => openGoalModal()
      );
    return;
  }
  if (empty) empty.innerHTML = "";
  goals.forEach((g, idx) => {
    const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
    const contrib = g.monthlyContribution || Math.max(0, state.monthlyIncome * 0.05);
    const monthsLeft = contrib > 0 ? Math.ceil((g.target - g.saved) / contrib) : Infinity;
    const typeMeta = GOAL_TYPES.find((t) => g.type?.includes(t.label.split(" ")[0])) || GOAL_TYPES[5];
    const li = document.createElement("li");
    li.className = `goal-card ${g.saved >= g.target && g.target > 0 ? "goal-card--done" : ""}`;
    li.style.setProperty("--goal-edge", typeMeta.edge);
    li.innerHTML = `
      <div class="goal-card__head">
        <div>
          <div class="goal-card__emoji">${g.emoji}</div>
          <p class="goal-card__name">${g.name}</p>
          <span class="goal-badge-type">${typeMeta.label}</span>
      </div>
        <div class="goal-card__menu">
          <button type="button" class="goal-menu-btn" aria-label="Goal menu">⋯</button>
          <div class="goal-menu-pop">
            <button type="button" data-a="edit">Edit</button>
            <button type="button" data-a="del">Delete</button>
            <button type="button" data-a="done">Mark complete</button>
          </div>
        </div>
      </div>
      <div class="goal-progress-wrap">
        <div class="goal-progress-bar"><div data-width="${pct}" style="width:0%"></div></div>
        <p class="hint">${fmtMoney(g.saved)} of ${fmtMoney(g.target)} · ${pct}% complete</p>
      </div>
      <p class="goal-card__forecast">Contributing ${fmtMoney(contrib)} this month — goal reached in ${
        monthsLeft === Infinity ? "—" : `${monthsLeft} months`
      }</p>
      <div class="goal-quick-add">
        <button type="button" class="btn-ghost btn-sm" data-quick-add="${g.id}">+ Add $</button>
        <input type="number" class="text-input" min="0" step="0.01" placeholder="Amount" aria-label="Quick add amount">
      </div>`;
    const menuBtn = li.querySelector(".goal-menu-btn");
    const pop = li.querySelector(".goal-menu-pop");
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      pop.classList.toggle("is-open");
    });
    pop.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        pop.classList.remove("is-open");
        const a = b.dataset.a;
        if (a === "edit") openGoalModal(g);
        if (a === "del") {
          state.goals = state.goals.filter((x) => x.id !== g.id);
          saveState();
          render();
        }
        if (a === "done") {
          g.active = false;
          saveState();
          render();
          toast("Goal marked complete", "info");
        }
      });
    });
    li.querySelector("[data-quick-add]")?.addEventListener("click", () => {
      const inp = li.querySelector(".goal-quick-add input");
      const v = clampNumber(inp?.value, 0);
      if (v <= 0) return;
      g.saved = clampNumber(g.saved + v, 0, 999999);
      saveState();
      render();
      if (g.saved >= g.target && g.target > 0) showGoalCelebrate(g);
    });
    list.appendChild(li);
  });
  window.setTimeout(() => animateGoalBars(), 50);
}

function showGoalCelebrate(g) {
  try {
    launchConfetti();
    $("celebrate-body").textContent = `${g.name} — ${fmtMoney(g.target)}`;
    openModal($("goal-celebrate-modal"));
  } catch (_) {}
}

function openGoalModal(goal) {
  const grid = $("goal-emoji-grid");
  grid.innerHTML = "";
  const emojis = ["🎯", "✈️", "💻", "🛡️", "📚", "🎉", "💰", "🏖️", "🚗", "🎓", "🎮", "🍕", "☕", "🏠", "🎧", "🎁", "💳", "🧳", "🧸", "⭐️"];
  let picked = goal?.emoji || "🎯";
  emojis.forEach((e) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = e;
    b.className = e === picked ? "selected" : "";
    b.addEventListener("click", () => {
      picked = e;
      $("goal-emoji-picked").value = picked;
      grid.querySelectorAll("button").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    });
    grid.appendChild(b);
  });
  $("goal-emoji-picked").value = picked;
  $("goal-edit-id").value = goal?.id || "";
  $("goal-modal-title").textContent = goal ? "Edit goal" : "New goal";
  $("goal-name-input").value = goal?.name || "";
  $("goal-target-input").value = goal ? String(goal.target) : "";
  $("goal-deadline").value = goal?.deadline || "";
  const sel = $("goal-type-select");
  sel.innerHTML = "";
  GOAL_TYPES.forEach((t) => {
    const o = document.createElement("option");
    o.value = t.label;
    o.textContent = t.label;
    sel.appendChild(o);
  });
  sel.value = goal?.type || GOAL_TYPES[5].label;
  openModal($("goal-modal"));
}

function saveGoalForm(e) {
  e.preventDefault();
  const id = $("goal-edit-id").value || safeRandomId();
  const g = normalizeGoal(
    {
      id,
      name: $("goal-name-input").value,
      target: $("goal-target-input").value,
      saved: state.goals.find((x) => x.id === id)?.saved || 0,
      emoji: $("goal-emoji-picked").value,
      active: true,
      type: $("goal-type-select").value,
      deadline: $("goal-deadline").value
    },
    state.goals.length
  );
  const ix = state.goals.findIndex((x) => x.id === id);
  if (ix >= 0) state.goals[ix] = g;
  else state.goals.push(g);
  saveState();
  closeModal($("goal-modal"));
  render();
}

function renderInsights() {
  const empty = $("insights-empty");
  const content = $("insights-content");
  if (state.transactions.length < 5) {
    content?.classList.add("hidden");
    if (empty) {
      renderEmptyState(
        empty,
        '<svg width="64" height="48" viewBox="0 0 64 48" fill="none" stroke="var(--text-muted)"><path d="M4 40V8l8-4h40l8 4v32l-8-4H12L4 40z"/><path d="M12 20h20M12 28h28M12 36h8"/></svg>',
        "Not enough data yet",
        "Log a few transactions to unlock your insights",
        "Go to Log →",
        () => setActiveTab("log")
      );
    }
    return;
  }
  empty && (empty.innerHTML = "");
  content?.classList.remove("hidden");
  const t = now();
  const monthTx = getCurrentMonthTransactions(t);
  const prevMonthDate = new Date(t.getFullYear(), t.getMonth() - 1, 15);
  const prevMonthTx = state.transactions.filter((tx) => tx.monthKey === monthKey(prevMonthDate));
  const expenseMonth = sumExpenseAmount(monthTx);
  const { totalDays } = getMonthBounds(t);
  const daysElapsed = Math.max(1, t.getDate());
  const earned =
    sumIncomeAmount(monthTx) + (clampNumber(state.monthlyIncome, 0) * daysElapsed) / Math.max(1, totalDays);
  const insEarned = $("ins-earned");
  const insSpent = $("ins-spent");
  const insSaved = $("ins-saved");
  if (insEarned) insEarned.textContent = fmtMoney(earned);
  if (insSpent) insSpent.textContent = fmtMoney(expenseMonth);
  const netSaved = earned - expenseMonth;
  if (insSaved) {
    insSaved.textContent = fmtMoney(netSaved);
    insSaved.style.color = netSaved >= 0 ? "var(--accent)" : "var(--danger)";
  }
  const seg = $("monthly-segments");
  if (seg) {
    const total = Math.max(1, earned + expenseMonth);
    const a = (earned / total) * 100;
    const b = (expenseMonth / total) * 100;
    const c = Math.max(0, 100 - a - b);
    seg.innerHTML = `<div style="width:${a}%;background:var(--accent)"></div><div style="width:${b}%;background:var(--danger)"></div><div style="width:${c}%;background:var(--primary)"></div>`;
  }
  drawInsightsTrend();
  renderCategoryRank(monthTx);
  renderMom(monthTx, prevMonthTx);
  renderSmartInsights(monthTx, prevMonthTx);
}

function drawInsightsTrend() {
  const svg = $("trend-svg");
  if (!svg) return;
  const days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });
  const vals = days.map((d) => getSpentForDay(dateKey(d)));
  const max = Math.max(1, ...vals);
  const w = 360;
  const h = 200;
  const pad = 24;
  const lim = clampNumber(getDailySafeSpendRaw(now()), 0);
  const yLim = pad + (h - 2 * pad) * (1 - lim / max);
  let d = `M ${pad} ${pad + (h - 2 * pad) * (1 - vals[0] / max)}`;
  vals.forEach((v, i) => {
    const x = pad + (i / 29) * (w - 2 * pad);
    const y = pad + (h - 2 * pad) * (1 - v / max);
    d += ` L ${x} ${y}`;
  });
  const area = `${d} L ${pad + (w - 2 * pad)} ${h - pad} L ${pad} ${h - pad} Z`;
  const dots = vals
    .map((v, i) => {
      const x = pad + (i / 29) * (w - 2 * pad);
      const y = pad + (h - 2 * pad) * (1 - v / max);
      const over = v > lim;
      return over ? `<circle cx="${x}" cy="${y}" r="3" fill="var(--danger)"/>` : "";
    })
    .join("");
  svg.innerHTML = `
    <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#g)" stroke="none"/>
    <line x1="${pad}" y1="${yLim}" x2="${w - pad}" y2="${yLim}" stroke="var(--warning)" stroke-dasharray="4 4" stroke-width="1"/>
    <path d="${d}" fill="none" stroke="var(--primary)" stroke-width="2"/>
    ${dots}`;
}

function renderCategoryRank(monthTx) {
  const ul = $("category-breakdown");
  if (!ul) return;
  const byCat = {};
  monthTx.filter(isExpenseTx).forEach((tx) => {
    byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount;
  });
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((a, [, v]) => a + v, 0) || 1;
  ul.innerHTML = "";
  let topId = sorted[0]?.[0];
  sorted.forEach(([catId, amt], i) => {
    const cat = state.categories.find((c) => c.id === catId) || { name: "Other", emoji: "🏷️", color: DONUT_COLORS[i] };
    const pct = (amt / total) * 100;
    const li = document.createElement("li");
    li.className = "cat-rank-row";
    li.innerHTML = `<div>${cat.emoji} ${cat.name}${catId === topId ? ' <span class="hint" style="color:var(--warning)">Top</span>' : ""}</div><div class="font-space">${fmtMoney(
      amt
    )}</div>
      <div class="cat-rank-bar-wrap"><div class="cat-rank-bar" style="width:${pct}%;background:${cat.color}"></div></div>`;
    ul.appendChild(li);
  });
}

function renderMom(monthTx, prevMonthTx) {
  const card = $("mom-card");
  const body = $("mom-body");
  if (!card || !body) return;
  if (prevMonthTx.length === 0) {
    card.classList.add("hidden");
    return;
  }
  card.classList.remove("hidden");
  const cur = {};
  monthTx.filter(isExpenseTx).forEach((tx) => {
    cur[tx.categoryId] = (cur[tx.categoryId] || 0) + tx.amount;
  });
  const prev = {};
  prevMonthTx.filter(isExpenseTx).forEach((tx) => {
    prev[tx.categoryId] = (prev[tx.categoryId] || 0) + tx.amount;
  });
  const deltas = Object.keys({ ...cur, ...prev })
    .map((id) => {
      const a = cur[id] || 0;
      const b = prev[id] || 0;
      const pct = b > 0 ? Math.round(((a - b) / b) * 100) : a > 0 ? 100 : 0;
      return { id, a, b, pct };
    })
    .sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b))
    .slice(0, 3);
  body.innerHTML = deltas
    .map((d) => {
      const cat = state.categories.find((c) => c.id === d.id);
      const name = cat ? `${cat.emoji} ${cat.name}` : d.id;
      const up = d.a > d.b;
      return `<p>${name}: ${fmtMoney(d.a)} vs ${fmtMoney(d.b)} — ${d.pct >= 0 ? "+" : ""}${d.pct}% ${
        up ? '<span style="color:var(--danger)">↑</span>' : '<span style="color:var(--accent)">↓</span>'
      }</p>`;
    })
    .join("");
}

function renderSmartInsights(monthTx, prevMonthTx) {
  const host = $("smart-insights");
  if (!host) return;
  host.innerHTML = "";
  const byWeekday = Array(7).fill(0);
  const cnt = Array(7).fill(0);
  monthTx.filter(isExpenseTx).forEach((t) => {
    const w = new Date(t.createdAt).getDay();
    cnt[w] += 1;
    byWeekday[w] += t.amount;
  });
  const avg = byWeekday.map((v, i) => (cnt[i] ? v / cnt[i] : 0));
  let minIdx = 0;
  let minVal = Infinity;
  for (let i = 0; i < 7; i += 1) {
    if (cnt[i] > 0 && avg[i] < minVal) {
      minVal = avg[i];
      minIdx = i;
    }
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const minDay = cnt.some((c) => c > 0) ? dayNames[minIdx] : "—";
  const card1 = document.createElement("div");
  card1.className = "insight-card";
  card1.style.borderLeftColor = "var(--accent)";
  card1.innerHTML = `<div class="insight-card__emoji">📊</div><div><div class="insight-card__title">Best spending day</div><p class="insight-card__body">Your cheapest day is usually ${minDay}. You spend an average of ${fmtMoney(
    minVal === Infinity ? 0 : avg[minIdx]
  )} on ${minDay}s.</p></div>`;
  host.appendChild(card1);
  const byCat = {};
  monthTx.filter(isExpenseTx).forEach((tx) => {
    byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount;
  });
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const prevCat = {};
  prevMonthTx.filter(isExpenseTx).forEach((tx) => {
    prevCat[tx.categoryId] = (prevCat[tx.categoryId] || 0) + tx.amount;
  });
  const card2 = document.createElement("div");
  card2.className = "insight-card";
  card2.style.borderLeftColor = "var(--primary)";
  if (top && prevMonthTx.length) {
    const p0 = prevCat[top[0]] || 0;
    const pct = p0 > 0 ? Math.round(((top[1] - p0) / p0) * 100) : 100;
    const cat = state.categories.find((c) => c.id === top[0]);
    card2.innerHTML = `<div class="insight-card__emoji">📈</div><div><div class="insight-card__title">Category trend</div><p class="insight-card__body">You've spent ${Math.abs(
      pct
    )}% ${pct >= 0 ? "more" : "less"} on ${cat?.name || "a category"} compared to last month.</p></div>`;
  } else if (top) {
    const cat = state.categories.find((c) => c.id === top[0]);
    card2.innerHTML = `<div class="insight-card__emoji">📈</div><div><div class="insight-card__title">Top category</div><p class="insight-card__body">Your biggest spending category is ${
      cat?.name || "—"
    } at ${fmtMoney(top[1])} this month.</p></div>`;
  }
  host.appendChild(card2);
  const map = buildDailyLimitMap(now());
  const keys = Object.keys(map).sort();
  let under = 0;
  keys.forEach((k) => {
    if (getSpentForDay(k) <= map[k]) under += 1;
  });
  const total = keys.length || 1;
  const z = Math.round((under / total) * 100);
  const card3 = document.createElement("div");
  card3.className = "insight-card";
  card3.style.borderLeftColor = "var(--warning)";
  card3.innerHTML = `<div class="insight-card__emoji">💪</div><div><div class="insight-card__title">Discipline</div><p class="insight-card__body">You've stayed under your daily limit ${under} out of ${total} days this month — that's ${z}%. ${
    z > 70 ? "Great discipline! 💪" : z < 40 ? "Try to hit 5 days in a row to build the habit." : ""
  }</p></div>`;
  host.appendChild(card3);
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

function openModal(el) {
  if (!el) return;
  el.classList.remove("hidden");
}

function closeModal(el) {
  if (!el) return;
  el.classList.add("hidden");
}

function openQuickAddEditor() {
  const list = $("quick-add-editor-list");
  const tpl = $("quick-add-editor-template");
  if (!list || !tpl) return;
  list.innerHTML = "";
  state.quickAdds.forEach((item) => {
    const frag = tpl.content.cloneNode(true);
    const row = frag.querySelector(".quick-edit-row");
    row.querySelector(".quick-emoji").value = item.emoji;
    row.querySelector(".quick-label").value = item.label;
    row.querySelector(".quick-amount").value = item.amount;
    list.appendChild(frag);
  });
  openModal($("quick-add-modal"));
}

function saveQuickAddEditor(event) {
  event.preventDefault();
  const rows = Array.from(document.querySelectorAll("#quick-add-editor-list .quick-edit-row"));
  const next = rows.map((row, idx) => {
    const emoji = sanitizeText(row.querySelector(".quick-emoji").value, "💸", 4);
    const label = sanitizeText(row.querySelector(".quick-label").value, "Expense", 24);
    const amount = clampNumber(row.querySelector(".quick-amount").value, 0, 99999);
    const guessCategory = state.categories.find((c) => c.name.toLowerCase() === label.toLowerCase())?.id || "cat_other";
    return normalizeQuickAdd({ id: `q${idx + 1}`, emoji, label, amount, categoryId: guessCategory }, idx);
  });
  state.quickAdds = next;
  saveState();
  closeModal($("quick-add-modal"));
  render();
  toast("Quick add buttons updated", "info");
}

function exportBackupJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wallet-warden-backup-${dateKey(now())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  state.lastBackupAt = new Date().toISOString();
  saveState();
  toast("Backup exported", "info");
}

function exportTransactionsCsv() {
  const header = ["date", "label", "amount", "category", "note", "type"].join(",");
  const rows = state.transactions
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((tx) => {
      const catName = state.categories.find((c) => c.id === tx.categoryId)?.name || "Other";
      const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
      return [tx.date, tx.label, tx.amount.toFixed(2), catName, tx.note, tx.txType || "expense"].map(escape).join(",");
    });
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wallet-warden-transactions-${dateKey(now())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast("CSV exported", "info");
}

async function importBackupJson() {
  const file = $("import-json")?.files?.[0];
  if (!file) return toast("Choose a JSON file", "danger");
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return toast("Invalid JSON", "danger");
  }
  if (!window.confirm("Import will replace your current data. Continue?")) return;
  state = normalizeState(parsed);
  saveState();
  render();
  toast("Backup imported", "info");
}

function applyTheme() {
  const light = localStorage.getItem("ww_theme") === "light" || state.theme === "light";
  document.body.classList.toggle("light-mode", light);
  const moon = document.querySelector(".theme-icon-moon");
  const sun = document.querySelector(".theme-icon-sun");
  if (moon && sun) {
    moon.classList.toggle("hidden", light);
    sun.classList.toggle("hidden", !light);
  }
}

function renderRankAndBadges() {
  const g = reconcileGamification();
  const rank = getRankForDays(g.totalDaysUnderLimit);
  const nextTier = rank.idx < RANKS.length - 1 ? RANKS[rank.idx + 1] : null;
  const tierSpan = Math.max(1, rank.max - rank.prev);
  const tierPct = Math.min(100, ((g.totalDaysUnderLimit - rank.prev) / tierSpan) * 100);
  const moreToNext =
    rank.idx < RANKS.length - 1 ? Math.max(0, RANKS[rank.idx].max + 1 - g.totalDaysUnderLimit) : 0;
  const line = $("rank-line-subtle");
  if (line)
    line.textContent = `${rank.emoji} ${rank.name} · ${g.totalDaysUnderLimit} days under limit · ${moreToNext} more to reach ${
      nextTier ? nextTier.name : "top"
    }`;
  const block = $("settings-rank-block");
  if (block) {
    block.innerHTML = `<p class="settings-p">${rank.emoji} ${rank.name}</p><div class="progress"><div style="width:${tierPct}%"></div></div><p class="hint">${g.totalDaysUnderLimit} days under limit · ${moreToNext} more to reach ${
      nextTier ? nextTier.name : "top rank"
    }</p>`;
  }
  checkBadges(g);
  renderBadgeGrid(g);
}

function monthHasFullUnderLimit(mk) {
  const wasSem = state.semesterMode;
  state.semesterMode = false;
  try {
    const [y, m] = mk.split("-").map(Number);
    const lastDay = new Date(y, m, 0);
    const map = buildDailyLimitMap(lastDay);
    const bounds = getMonthBounds(lastDay);
    for (let day = 1; day <= bounds.totalDays; day += 1) {
      const dk = dateKey(new Date(y, m - 1, day));
      if (!(dk in map)) return false;
      if (getSpentForDay(dk) > map[dk]) return false;
    }
    return Object.keys(map).length > 0;
  } finally {
    state.semesterMode = wasSem;
  }
}

function hasAnyFullMonthBadge() {
  const months = [...new Set(state.transactions.map((t) => t.monthKey))];
  return months.some((mk) => monthHasFullUnderLimit(mk));
}

function hasSuperSaverBadge() {
  const months = [...new Set(state.transactions.map((t) => t.monthKey))];
  return months.some((mk) => {
    const [y, m] = mk.split("-").map(Number);
    const d = new Date(y, m - 1, 15);
    const txs = state.transactions.filter((t) => t.monthKey === mk);
    const exp = sumExpenseAmount(txs);
    const extraInc = sumIncomeAmount(txs);
    const income = clampNumber(state.monthlyIncome, 0) + extraInc;
    if (income <= 0) return false;
    const net = income - clampNumber(state.fixedExpenses, 0) - exp;
    return net / income >= 0.2;
  });
}

function checkBadges(g) {
  const earned = new Map((g.earnedBadges || []).map((b) => [b.id, b]));
  const streak = getStreak(now());
  const tryUnlock = (id, emoji, name, cond) => {
    if (!cond || earned.has(id)) return;
    earned.set(id, { id, emoji, name, at: new Date().toISOString() });
    toast(`${emoji} Badge unlocked: ${name}!`, "info");
  };
  tryUnlock("fire", "🔥", "On Fire", streak >= 7);
  tryUnlock("ice", "❄️", "Ice Cold", streak >= 30);
  tryUnlock("firstgoal", "💰", "First Goal", g.goalsCompleted >= 1);
  tryUnlock("crush", "🎯", "Goal Crusher", state.goals.filter((x) => x.saved >= x.target && x.target > 0).length >= 3);
  tryUnlock("log", "🧾", "Log Master", state.transactions.length >= 50);
  tryUnlock("fullmonth", "📅", "Full Month", hasAnyFullMonthBadge());
  tryUnlock("saver", "🏦", "Super Saver", hasSuperSaverBadge());
  tryUnlock("globe", "🌍", "Globetrotter", g.currencyChangedOnce);
  g.earnedBadges = Array.from(earned.values());
  saveGamification(g);
}

function renderBadgeGrid(g) {
  const grid = $("badges-grid");
  if (!grid) return;
  const defs = [
    { id: "fire", emoji: "🔥", name: "On Fire", desc: "7-day streak" },
    { id: "ice", emoji: "❄️", name: "Ice Cold", desc: "30-day streak" },
    { id: "firstgoal", emoji: "💰", name: "First Goal", desc: "First goal progress" },
    { id: "crush", emoji: "🎯", name: "Goal Crusher", desc: "3 goals completed" },
    { id: "log", emoji: "🧾", name: "Log Master", desc: "50 transactions" },
    { id: "fullmonth", emoji: "📅", name: "Full Month", desc: "Under limit all month" },
    { id: "saver", emoji: "🏦", name: "Super Saver", desc: "Save 20% in a month" },
    { id: "globe", emoji: "🌍", name: "Globetrotter", desc: "Change currency" }
  ];
  grid.innerHTML = "";
  const have = new Set((g.earnedBadges || []).map((b) => b.id));
  defs.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = `badge-cell ${have.has(d.id) ? "" : "locked"}`;
    cell.innerHTML = `<span class="badge-cell__emoji">${have.has(d.id) ? d.emoji : "🔒"}</span><strong>${d.name}</strong><p class="hint">${
      d.desc
    }</p>`;
    grid.appendChild(cell);
  });
}

function renderStreakCalendar() {
  const host = $("streak-calendar");
  const meta = $("streak-calendar-meta");
  const setHost = $("settings-streak-calendar");
  const setMeta = $("settings-streak-meta");
  const map = buildDailyLimitMap(now());
  const keys = Object.keys(map).sort();
  const last60 = keys.slice(-60);
  const render = (h) => {
    if (!h) return;
    h.innerHTML = "";
    last60.forEach((k) => {
      const spent = getSpentForDay(k);
      const lim = map[k] ?? 0;
      const cell = document.createElement("div");
      cell.className = "streak-cell";
      if (lim <= 0 && spent === 0) cell.classList.add("streak-cell");
      else if (spent <= lim) cell.classList.add("streak-cell--under");
      else cell.classList.add("streak-cell--over");
      h.appendChild(cell);
    });
  };
  render(host);
  render(setHost);
  const txt = `Current streak ${getStreak(now())} days · Longest ${getLongestStreak(now())} days`;
  if (meta) meta.textContent = txt;
  if (setMeta) setMeta.textContent = txt;
}

function renderChallenge() {
  const wk = Math.floor(Date.now() / 604800000) % CHALLENGES.length;
  const ch = CHALLENGES[wk];
  const g = loadGamification();
  if (!g.weeklyChallenge || g.weeklyChallenge.id !== wk) {
    g.weeklyChallenge = { id: wk, startDate: dateKey(now()), completed: false };
    saveGamification(g);
  }
  $("challenge-title").textContent = ch.title;
  $("challenge-desc").textContent = ch.desc;
  const prog = evaluateChallenge(ch);
  $("challenge-progress").textContent = prog.done ? "✓ Completed!" : prog.text;
  $("challenge-status").textContent = prog.done ? "Done" : "Active";
  const card = $("weekly-challenge-card");
  if (card) card.classList.toggle("challenge-card--done", prog.done);
}

function evaluateChallenge(ch) {
  const n = now();
  const weekStart = new Date(n);
  weekStart.setDate(n.getDate() - n.getDay());
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return dateKey(d);
  });
  if (ch.check === "split_expense") {
    const ok = state.transactions.some((t) => t.split);
    return { done: ok, text: ok ? "✓ Logged a split expense" : "Log a split expense" };
  }
  if (ch.check === "goal_contribution") {
    const ok = state.goals.some((g) => g.saved > 0);
    return { done: ok, text: ok ? "✓ Contributed" : "Add to a goal" };
  }
  if (ch.check === "under_limit_5_of_7") {
    const map = buildDailyLimitMap(n);
    let c = 0;
    days.forEach((k) => {
      if (getSpentForDay(k) <= (map[k] || 0)) c += 1;
    });
    return { done: c >= 5, text: `${c} of 7 days under limit` };
  }
  if (ch.check === "daily_log_streak_7") {
    let c = 0;
    days.forEach((k) => {
      if (state.transactions.some((t) => t.date === k)) c += 1;
    });
    return { done: c >= 7, text: `${c} of 7 days with logs` };
  }
  if (ch.check === "no_delivery_7_days") {
    let bad = false;
    days.forEach((k) => {
      state.transactions.forEach((t) => {
        if (t.date === k && t.categoryId === "cat_delivery") bad = true;
      });
    });
    return { done: !bad, text: bad ? "Delivery logged this week" : "No delivery logs" };
  }
  if (ch.check === "no_entertainment_3_days") {
    let z = 0;
    state.transactions.forEach((t) => {
      if (t.categoryId === "cat_ent" && days.includes(t.date)) z += 1;
    });
    return { done: z === 0, text: z === 0 ? "No entertainment spend" : "Entertainment logged" };
  }
  if (ch.check === "groceries_under_40") {
    let s = 0;
    state.transactions.forEach((t) => {
      if (t.categoryId === "cat_grocery" && days.includes(t.date)) s += t.amount;
    });
    return { done: s <= 40, text: `${fmtMoney(s)} / ${fmtMoney(40)} groceries` };
  }
  return { done: false, text: "In progress" };
}

function renderWardenTip() {
  const idx = Math.floor(Date.now() / 86400000) % TIPS.length;
  let dismissed = [];
  try {
    dismissed = JSON.parse(localStorage.getItem("ww_dismissed_tips") || "[]");
  } catch (_) {}
  const card = $("warden-says-card");
  if (dismissed.includes(idx)) {
    if (card) card.classList.add("hidden");
    return;
  }
  if (card) card.classList.remove("hidden");
  $("warden-tip-text").textContent = TIPS[idx];
}

function renderHero(today, monthSpent, dailyLimit, spentToday) {
  const hero = $("hero-card");
  const amt = $("safe-spend-value");
  const ring = $("hero-ring-fill");
  const pct = $("hero-ring-percent");
  const streakEl = $("hero-streak-wrap");
  const daysLeft = state.semesterMode
    ? Math.max(0, Math.ceil((new Date(state.semesterEndDate) - today) / 86400000))
    : getDaysRemainingInMonth(today);
  $("days-remaining").textContent = state.semesterMode
    ? `${daysLeft} days left in period`
    : `${daysLeft} days left this month`;
  $("month-spent").textContent = `${fmtMoney(spentToday)} spent today`;
    const progress = dailyLimit > 0 ? Math.min(100, Math.round((spentToday / dailyLimit) * 100)) : 0;
  const over = spentToday > dailyLimit;
  const warn = !over && dailyLimit > 0 && spentToday / dailyLimit > 0.8;
  let status = "You're on track. Keep it up! 🎯";
  let heroCls = "";
  let amtCls = "";
  if (over) {
    status = "You've exceeded today's limit.";
    heroCls = "hero-card--danger";
    amtCls = "hero-amount--danger";
  } else if (warn) {
    status = "Careful — you're close to today's limit.";
    heroCls = "hero-card--warn";
    amtCls = "hero-amount--warn";
  } else if (dailyLimit < 0) {
    status = "You've exceeded today's limit.";
    heroCls = "hero-card--danger";
    amtCls = "hero-amount--danger";
  }
  $("hero-status-msg").textContent = status;
  if (hero) {
    hero.className = `card hero-card ${heroCls}`;
    if (dailyLimit < 0) {
      hero.style.animation = "shake 0.5s ease";
      hero.style.borderColor = "var(--danger)";
    }
  }
  if (amt) {
    amt.className = `hero-amount font-space ${amtCls}`;
    amt.textContent = fmtMoney(Math.max(0, dailyLimit));
  }
  if (ring) {
    const stroke = over || dailyLimit < 0 ? "var(--danger)" : warn ? "var(--warning)" : "var(--accent)";
    ring.style.stroke = stroke;
    ring.style.strokeDashoffset = `${326.7 - (326.7 * progress) / 100}`;
  }
  if (pct) pct.textContent = `${progress}%`;
  const streak = getStreak(today);
  $("streak-count").textContent = String(streak);
  if (streakEl) {
    streakEl.classList.toggle("hero-streak--glow", streak > 0);
    streakEl.title = `${streak} days under daily limit`;
  }
  if (streak > 0 && ([7, 14, 21, 30].includes(streak) || streak % 10 === 0)) {
    const g = loadGamification();
    if (g.lastStreakMilestone !== streak) {
      g.lastStreakMilestone = streak;
      saveGamification(g);
      launchConfetti();
    }
  }
}

function render() {
  try {
    window.wwCurrency = { symbol: getCurrencyMeta().symbol, code: state.currencyCode };
    const today = now();
    const monthTx = getCurrentMonthTransactions(today);
    const monthSpent = sumExpenseAmount(monthTx);
    const dailyLimit = clampNumber(getDailySafeSpendRaw(today), -999999, 999999);
    const spentToday = getSpentForDay(dateKey(today));
    renderHero(today, monthSpent, dailyLimit, spentToday);
    $("stat-spent-month").textContent = fmtMoney(monthSpent);
    const savedGoals = state.goals.reduce((a, g) => a + clampNumber(g.saved, 0), 0);
    $("stat-saved-so-far").textContent = fmtMoney(savedGoals);
    const avg = monthSpent / Math.max(1, today.getDate());
    if ($("stat-avg-day")) $("stat-avg-day").textContent = fmtMoney(avg);
    const byCat = {};
    monthTx.filter(isExpenseTx).forEach((tx) => {
      byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount;
    });
    const topCatId = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCat = state.categories.find((c) => c.id === topCatId);
    $("stat-top-category").textContent = topCat ? `${topCat.emoji} ${topCat.name}` : "—";
    renderForecast(monthSpent);
    drawWeeklyChart();
    renderDonut(monthTx);
    renderRankAndBadges();
    renderStreakCalendar();
    renderChallenge();
    renderWardenTip();
    $("dismiss-tip")?.addEventListener(
      "click",
      () => {
        const idx = Math.floor(Date.now() / 86400000) % TIPS.length;
        let d = [];
        try {
          d = JSON.parse(localStorage.getItem("ww_dismissed_tips") || "[]");
        } catch (_) {}
        d.push(idx);
        localStorage.setItem("ww_dismissed_tips", JSON.stringify(d));
        $("warden-says-card")?.classList.add("hidden");
      },
      { once: true }
    );
    populateCurrencySelect();
    $("income") && ($("income").value = state.monthlyIncome || "");
    $("fixed-expenses") && ($("fixed-expenses").value = state.fixedExpenses || "");
    $("semester-lump-sum") && ($("semester-lump-sum").value = state.semesterLumpSum || "");
    $("semester-end-date") && ($("semester-end-date").value = state.semesterEndDate || "");
    $("semester-start-date") && ($("semester-start-date").value = state.semesterStartDate || "");
    $("monthly-income-row")?.classList.toggle("hidden", state.semesterMode);
    $("semester-budget-row")?.classList.toggle("hidden", !state.semesterMode);
    $("semester-end-row")?.classList.toggle("hidden", !state.semesterMode);
    $("semester-start-row")?.classList.toggle("hidden", !state.semesterMode);
    $("semester-summary")?.classList.toggle("hidden", !state.semesterMode);
    $("mode-monthly")?.classList.toggle("mode-toggle__btn--active", !state.semesterMode);
    $("mode-semester")?.classList.toggle("mode-toggle__btn--active", state.semesterMode);
    if (state.semesterMode && state.semesterEndDate) {
      const b = getSemesterBounds(today);
      if (b) {
        const totalDays = Math.max(1, daysBetweenInclusive(b.start, b.end));
        const totalFixed = (state.fixedExpenses / 30) * totalDays;
        const spendable = state.semesterLumpSum - totalFixed - getSemesterSpent(today);
        const remDays = Math.max(1, Math.round((b.end - today) / 86400000) + 1);
        const daily = spendable / remDays;
        $("semester-daily").textContent = `Your daily allowance: ${fmtMoney(daily)}`;
        $("semester-meta").textContent = `${remDays} days remaining · ${fmtMoney(spendable)} total spendable`;
      }
    }
    $("savings-goal-name") && ($("savings-goal-name").value = state.savingsGoalName);
    $("savings-total") && ($("savings-total").textContent = fmtMoney(state.savingsTotal));
    if ($("last-backup-text")) $("last-backup-text").textContent = state.lastBackupAt ? new Date(state.lastBackupAt).toLocaleString() : "Never";
    if ($("backup-reminder-toggle")) $("backup-reminder-toggle").checked = localStorage.getItem("ww_backup_reminder") === "true";
    if ($("daily-reminder-toggle")) $("daily-reminder-toggle").checked = state.dailyReminderEnabled;
    if ($("daily-reminder-time")) $("daily-reminder-time").value = state.dailyReminderTime || "20:00";
    const sgw = $("savings-goal-wrapper");
    if (sgw) sgw.style.display = state.rolloverMode === "savings-goal" ? "block" : "none";
    const r = document.querySelector(`input[name="rollover-mode"][value="${state.rolloverMode}"]`);
    if (r) r.checked = true;
    renderQuickAddButtons();
    renderHistoryPreview(monthTx);
    renderCategoryChips();
    renderLogPanel();
    renderGoals();
    renderInsights();
    applyTheme();
    updateAuthUI();
  } catch (e) {
    toast("Recovered from an app error.", "danger");
  }
}

function populateCurrencySelect() {
  const sel = $("currency-select");
  if (!sel) return;
  sel.innerHTML = "";
  CURRENCY_OPTIONS.forEach((c) => {
    const o = document.createElement("option");
    o.value = c.code;
    o.textContent = `${c.symbol} ${c.code} — ${c.name}`;
    sel.appendChild(o);
  });
  sel.value = state.currencyCode;
  saveWwCurrency(getCurrencyMeta().symbol, state.currencyCode);
}

/** After OAuth redirect, session is parsed from the URL hash asynchronously — wait before first getSession. */
/** Strip OAuth error query params and hash after session is stored (avoids broken reload UX). */
function stripOAuthFromBrowserUrl() {
  try {
    const u = new URL(window.location.href);
    u.hash = "";
    u.searchParams.delete("error");
    u.searchParams.delete("error_code");
    u.searchParams.delete("error_description");
    const q = u.searchParams.toString();
    history.replaceState(null, "", u.pathname + (q ? `?${q}` : ""));
  } catch (_) {}
}

/**
 * Google/Supabase sometimes redirect with ?error=bad_oauth_state while tokens still appear in the
 * URL hash (e.g. PKCE state lost across tabs or SW). Parse the hash and call setSession so login still works.
 */
async function recoverOAuthFromUrl(supabase) {
  if (!supabase) return false;
  const raw = window.location.hash?.replace(/^#/, "") || "";
  if (!raw.includes("access_token")) return false;
  let params;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return false;
  }
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token") || "";
  if (!access_token) return false;
  try {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return false;
    stripOAuthFromBrowserUrl();
    return true;
  } catch {
    return false;
  }
}

async function ensureAuthSessionReady(supabase) {
  if (!supabase) return;
  await recoverOAuthFromUrl(supabase);
  try {
    if (typeof supabase.auth.initialize === "function") {
      await supabase.auth.initialize();
    }
  } catch (_) {
    /* older clients without initialize() */
  }
  const h = window.location.hash;
  if (h && (h.includes("access_token") || h.includes("error"))) {
    await new Promise((r) => setTimeout(r, 80));
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

function getUserDisplayParts(user) {
  if (!user) return { email: "", name: "", avatar: "", initials: "?" };
  const meta = user.user_metadata || {};
  const idData = user.identities?.[0]?.identity_data || {};
  const email = user.email || meta.email || idData.email || "";
  const name = (meta.full_name || meta.name || meta.preferred_username || idData.name || email.split("@")[0] || "?").trim();
  const avatar =
    meta.avatar_url || meta.picture || idData.avatar_url || idData.picture || "";
  const parts = name.split(/\s+/).filter(Boolean);
  let initials = "?";
  if (parts.length >= 2) initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  else if (parts.length === 1 && parts[0].length) initials = parts[0].slice(0, 2).toUpperCase();
  else if (email) initials = email.slice(0, 2).toUpperCase();
  return { email, name, avatar, initials };
}

function applyProfileAvatar(avatar, initials, altLabel) {
  const img = $("auth-avatar-img");
  const ini = $("auth-avatar-initials");
  if (!img || !ini) return;
  ini.textContent = initials || "?";
  const showInitials = () => {
    img.classList.add("hidden");
    ini.classList.remove("hidden");
  };
  const showPhoto = () => {
    img.classList.remove("hidden");
    ini.classList.add("hidden");
  };
  img.onload = showPhoto;
  img.onerror = showInitials;
  if (avatar) {
    img.alt = altLabel || "Profile";
    if (img.src !== avatar) img.src = avatar;
    if (img.complete && img.naturalWidth) showPhoto();
    else showInitials();
  } else {
    img.removeAttribute("src");
    showInitials();
  }
}

async function updateAuthUI() {
  const supabase = window.wwSupabaseClient;
  const label = $("auth-nav-label");
  const openAuth = $("open-auth");
  const navOut = $("nav-auth-out");
  const navIn = $("nav-auth-in");
  const syncDot = $("nav-auth-sync");
  if (!supabase) {
    openAuth?.classList.remove("nav-auth--signed-in");
    navOut?.classList.remove("hidden");
    navIn?.classList.add("hidden");
    syncDot?.classList.add("hidden");
    if (label) label.textContent = "Sign in";
    openAuth?.setAttribute("aria-label", "Sign in with Google to sync");
    return;
  }
  await ensureAuthSessionReady(supabase);
  const {
    data: { session }
  } = await supabase.auth.getSession();
  let user = session?.user ?? null;
  try {
    const { data: userData, error: guErr } = await supabase.auth.getUser();
    if (!guErr && userData?.user) user = userData.user;
  } catch (_) {
    /* offline — keep session user */
  }
  if (user) {
    const { email, name, avatar, initials } = getUserDisplayParts(user);
    const shortName = name.length > 20 ? `${name.slice(0, 18)}…` : name;
    const navName = shortName || (email.length > 22 ? `${email.slice(0, 12)}…` : email);
    if (label) label.textContent = "Sign in";
    applyProfileAvatar(avatar, initials, navName);
    openAuth?.classList.add("nav-auth--signed-in");
    navOut?.classList.add("hidden");
    navIn?.classList.remove("hidden");
    syncDot?.classList.remove("hidden");
    openAuth?.setAttribute("aria-label", `Account: ${name || email || "signed in"}. Open settings.`);
    $("settings-auth-status").textContent = `Signed in with Google · ${email || name}`;
    $("settings-sign-in")?.classList.add("hidden");
    $("settings-log-out")?.classList.remove("hidden");
    try {
      if (window.location.hash && /access_token|refresh_token/.test(window.location.hash)) {
        stripOAuthFromBrowserUrl();
      }
    } catch (_) {}
  } else {
    openAuth?.classList.remove("nav-auth--signed-in");
    navOut?.classList.remove("hidden");
    navIn?.classList.add("hidden");
    syncDot?.classList.add("hidden");
    if (label) label.textContent = "Sign in";
    openAuth?.setAttribute("aria-label", "Sign in with Google to sync");
    const img = $("auth-avatar-img");
    const ini = $("auth-avatar-initials");
    if (img) {
      img.removeAttribute("src");
      img.classList.add("hidden");
    }
    if (ini) {
      ini.textContent = "";
      ini.classList.add("hidden");
    }
    $("settings-auth-status").textContent = "Not signed in — your data is local only";
    $("settings-sign-in")?.classList.remove("hidden");
    $("settings-log-out")?.classList.add("hidden");
  }
  const last = localStorage.getItem("ww_last_sync_ok");
  $("settings-sync-time").textContent = last
    ? `Synced ${Math.round((Date.now() - Number(last)) / 60000)} minutes ago`
    : "Never synced";
}

/**
 * Return URL after Google → must exactly match an allowed Supabase Redirect URL.
 * Use the current origin (apex vs www) so PKCE/state in localStorage matches the callback origin.
 */
function getOAuthRedirectTo() {
  const host = window.location.hostname;
  const path = window.location.pathname || "/";
  const search = window.location.search || "";
  if (host === "wallet-warden.one" || host === "www.wallet-warden.one") {
    return `${window.location.origin}${path}${search}`;
  }
  return window.location.href.replace(/#.*$/, "");
}

/**
 * Google OAuth — first-time Google users are registered automatically.
 * Session is persisted in localStorage (same device stays signed in until sign-out).
 */
async function loginWithGoogle() {
  const supabase = window.wwSupabaseClient;
  const err = $("auth-error");
  const btn = $("auth-google");
  err?.classList.add("hidden");
  if (!supabase) {
    const msg = "Cloud sync is not available right now.";
    if (err) {
      err.textContent = msg;
      err.classList.remove("hidden");
    }
    toast(msg, "danger");
    return;
  }
  if (btn) btn.disabled = true;
  try {
    const redirectTo = getOAuthRedirectTo();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    if (error) throw error;
    if (data?.url) {
      window.location.assign(data.url);
    }
  } catch (e) {
    const msg = e?.message || "Could not start Google sign-in.";
    if (err) {
      err.textContent = msg;
      err.classList.remove("hidden");
    }
    toast(msg, "danger");
  } finally {
    if (btn) btn.disabled = false;
  }
}

window.loginWithGoogle = loginWithGoogle;

async function mergeCloudOnLogin() {
  const cloud = await window.loadFromCloud();
  if (!cloud) {
    try {
      await syncAfterSave();
    } catch (_) {
      /* offline */
    }
    return;
  }
  const localTs = state.lastUpdated || 0;
  const remoteTs = cloud.lastUpdated || 0;
  if (remoteTs > localTs) {
    state = normalizeState(cloud);
    saveState();
    toast("Loaded data from cloud", "info");
  } else {
    try {
      await syncAfterSave();
      if (localTs > remoteTs) toast("Your local data has been saved to the cloud ☁️", "info");
    } catch (_) {}
  }
}

function bindEvents() {
  $("theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    localStorage.setItem("ww_theme", light ? "light" : "dark");
    state.theme = light ? "light" : "dark";
    saveState();
    applyTheme();
  });
  $("settings-theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    localStorage.setItem("ww_theme", light ? "light" : "dark");
    state.theme = light ? "light" : "dark";
    saveState();
    applyTheme();
  });
  $("open-settings")?.addEventListener("click", () => openModal($("settings-modal")));
  $("close-settings")?.addEventListener("click", () => closeModal($("settings-modal")));
  $("settings-modal")?.addEventListener("click", (e) => {
    if (e.target === $("settings-modal")) closeModal($("settings-modal"));
  });
  $("open-auth")?.addEventListener("click", () => {
    if ($("open-auth")?.classList.contains("nav-auth--signed-in")) openModal($("settings-modal"));
    else openModal($("auth-modal"));
  });
  $("guest-sync-banner-cta")?.addEventListener("click", () => openModal($("auth-modal")));
  $("auth-google")?.addEventListener("click", () => loginWithGoogle());
  $("auth-skip")?.addEventListener("click", () => closeModal($("auth-modal")));
  $("settings-sign-in")?.addEventListener("click", () => openModal($("auth-modal")));
  $("settings-log-out")?.addEventListener("click", async () => {
    try {
      await window.wwSupabaseClient?.auth.signOut();
    } catch (_) {}
    location.reload();
  });
  $("plan-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.monthlyIncome = clampNumber($("income")?.value, 0);
    state.fixedExpenses = clampNumber($("fixed-expenses")?.value, 0);
    state.semesterLumpSum = clampNumber($("semester-lump-sum")?.value, 0);
    state.semesterEndDate = sanitizeText($("semester-end-date")?.value, "", 12);
    state.semesterStartDate = sanitizeText($("semester-start-date")?.value, "", 12);
    saveState();
    render();
    toast("Plan updated", "info");
  });
  $("mode-monthly")?.addEventListener("click", () => {
    state.semesterMode = false;
    saveState();
    render();
  });
  $("mode-semester")?.addEventListener("click", () => {
    state.semesterMode = true;
    if (!state.semesterStartDate) state.semesterStartDate = dateKey(new Date(now().getFullYear(), now().getMonth(), 1));
    saveState();
    render();
  });
  qsa(".nav-tab").forEach((b) => b.addEventListener("click", () => setActiveTab(b.dataset.tab)));
  qsa(".mob-tab").forEach((b) => b.addEventListener("click", () => setActiveTab(b.dataset.tab)));
  qsa("[data-tab-link]").forEach((b) => b.addEventListener("click", () => setActiveTab(b.dataset.tabLink)));
  $("open-add-transaction")?.addEventListener("click", () => openAddTransaction());
  $("fab-add-tx")?.addEventListener("click", () => openAddTransaction());
  $("close-add-transaction")?.addEventListener("click", () => closeModal($("add-transaction-modal")));
  $("cancel-tx")?.addEventListener("click", () => closeModal($("add-transaction-modal")));
  $("add-transaction-modal")?.addEventListener("click", (e) => {
    if (e.target === $("add-transaction-modal")) closeModal($("add-transaction-modal"));
  });
  $("add-transaction-form")?.addEventListener("submit", saveManualTransaction);
  $("delete-tx")?.addEventListener("click", deleteEditingTx);
  $("tx-split-toggle")?.addEventListener("change", () => {
    $("tx-split-fields")?.classList.toggle("hidden", !$("tx-split-toggle").checked);
  });
  $("search-query")?.addEventListener("input", renderLogPanel);
  $("filter-month")?.addEventListener("change", renderLogPanel);
  $("time-filter-chips")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-range]");
    if (!btn) return;
    state.logRange = btn.dataset.range;
    saveState();
    qsa("#time-filter-chips .chip").forEach((c) => c.classList.toggle("chip--active", c === btn));
    renderLogPanel();
  });
  $("settings-goto-plan")?.addEventListener("click", () => {
    closeModal($("settings-modal"));
    setActiveTab("plan");
  });
  $("currency-select")?.addEventListener("change", () => {
    state.currencyCode = $("currency-select").value;
    saveWwCurrency(getCurrencyMeta().symbol, state.currencyCode);
    const g = loadGamification();
    g.currencyChangedOnce = true;
    saveGamification(g);
    saveState();
    render();
  });
  $("backup-reminder-toggle")?.addEventListener("change", () => {
    localStorage.setItem("ww_backup_reminder", $("backup-reminder-toggle").checked ? "true" : "false");
  });
  $("daily-reminder-toggle")?.addEventListener("change", async () => {
    state.dailyReminderEnabled = !!$("daily-reminder-toggle").checked;
    if (state.dailyReminderEnabled && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    saveState();
  });
  $("daily-reminder-time")?.addEventListener("change", () => {
    state.dailyReminderTime = $("daily-reminder-time").value || "20:00";
    saveState();
  });
  qsa("input[name='rollover-mode']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.rolloverMode = e.target.value === "savings-goal" ? "savings-goal" : "next-day";
      state.carryForwardBalance = 0;
      state.settlementDayKey = "";
      saveState();
      settleYesterday();
      render();
      toast("Rollover mode updated", "info");
    });
  });
  $("savings-goal-name")?.addEventListener("change", () => {
    state.savingsGoalName = sanitizeText($("savings-goal-name").value, "Savings goal", 60);
    saveState();
    render();
  });
  $("edit-quick-adds")?.addEventListener("click", openQuickAddEditor);
  $("close-quick-adds")?.addEventListener("click", () => closeModal($("quick-add-modal")));
  $("quick-add-form")?.addEventListener("submit", saveQuickAddEditor);
  $("reset-data")?.addEventListener("click", () => $("clear-confirm")?.classList.remove("hidden"));
  $("clear-confirm-btn")?.addEventListener("click", () => {
    if ($("clear-confirm-input")?.value !== "DELETE") return toast("Type DELETE to confirm", "danger");
    state = deepClone(DEFAULT_STATE);
    saveState();
    closeModal($("settings-modal"));
    render();
    toast("All local data cleared", "info");
  });
  $("open-data-modal")?.addEventListener("click", () => openModal($("data-modal")));
  $("close-data")?.addEventListener("click", () => closeModal($("data-modal")));
  $("export-json")?.addEventListener("click", exportBackupJson);
  $("export-csv")?.addEventListener("click", exportTransactionsCsv);
  $("import-json-btn")?.addEventListener("click", importBackupJson);
  $("open-goals-editor")?.addEventListener("click", () => openGoalModal());
  $("goal-form")?.addEventListener("submit", saveGoalForm);
  $("close-goal-modal")?.addEventListener("click", () => closeModal($("goal-modal")));
  $("celebrate-close")?.addEventListener("click", () => closeModal($("goal-celebrate-modal")));
  $("finish-setup-ok")?.addEventListener("click", () => closeModal($("finish-setup-modal")));
  window.addEventListener("resize", () => drawWeeklyChart());
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function maybeInstallBanner() {
  const n = Number(localStorage.getItem("ww_visit_count") || 0) + 1;
  localStorage.setItem("ww_visit_count", String(n));
  if (n < 2 || localStorage.getItem("ww_install_dismissed") === "true") return;
  $("install-banner")?.classList.remove("hidden");
  $("install-banner-dismiss")?.addEventListener("click", () => {
    localStorage.setItem("ww_install_dismissed", "true");
    $("install-banner")?.classList.add("hidden");
  });
  $("install-banner-btn")?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
}

function guestBanner() {
  if (!localStorage.getItem("ww_first_visit_date")) localStorage.setItem("ww_first_visit_date", String(Date.now()));
  const start = Number(localStorage.getItem("ww_first_visit_date"));
  const days = (Date.now() - start) / 86400000;
  if (days < 3) return;
  const show = () => $("guest-sync-banner")?.classList.remove("hidden");
  if (!window.wwSupabaseClient) {
    show();
    return;
  }
  window.wwSupabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (!session) show();
  });
}

async function init() {
  if (!localStorage.getItem("ww_first_visit_date")) localStorage.setItem("ww_first_visit_date", String(Date.now()));
  if (localStorage.getItem("ww_theme") === "light" || state.theme === "light") document.body.classList.add("light-mode");
  if (localStorage.getItem("ww_budget_mode") === "semester") state.semesterMode = true;
  try {
    const cur = JSON.parse(localStorage.getItem("ww_currency") || "{}");
    if (cur.code) state.currencyCode = cur.code;
  } catch (_) {}
  if (!localStorage.getItem("ww_onboarded") && state.onboardingSeen) localStorage.setItem("ww_onboarded", "true");
  settleYesterday();
  bindEvents();
  populateCategorySelect($("tx-category"), false);

  if (window.wwSupabaseClient) {
    try {
      const sb = window.wwSupabaseClient;
      await recoverOAuthFromUrl(sb);
      sb.auth.onAuthStateChange(async (event, session) => {
        if (
          session &&
          (event === "SIGNED_IN" ||
            event === "TOKEN_REFRESHED" ||
            event === "INITIAL_SESSION" ||
            event === "USER_UPDATED")
        ) {
          try {
            await mergeCloudOnLogin();
          } catch (_) {}
          render();
        }
        await updateAuthUI();
      });
      await ensureAuthSessionReady(sb);
      const {
        data: { session }
      } = await sb.auth.getSession();
      if (session) {
        try {
          await mergeCloudOnLogin();
        } catch (_) {}
      }
    } catch (_) {}
  }

  render();
  setActiveTab(state.activeTab || "home");
  maybeInstallBanner();
  guestBanner();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
  if (localStorage.getItem("ww_sync_pending") === "true") {
    try {
      await syncAfterSave();
    } catch (_) {}
  }
  await updateAuthUI();
  if (localStorage.getItem("ww_onboarded") !== "true") {
    openOnboarding();
  }
}

function openOnboarding() {
  let step = 0;
  const data = { income: 0, fixed: 0, goalName: "", goalTarget: 0 };
  const dots = $("onboarding-dots");
  const body = $("onboarding-steps");
  const next = $("onboarding-next");
  const finish = $("onboarding-finish");
  const skipGoal = $("onboarding-skip-goal");
  const renderDots = () => {
    if (!dots) return;
    dots.innerHTML = "";
    [0, 1, 2].forEach((i) => {
      const s = document.createElement("span");
      s.className = `on-dot ${i === step ? "on-dot--active" : ""}`;
      dots.appendChild(s);
    });
  };
  const renderStep = () => {
    renderDots();
    if (next) next.classList.toggle("hidden", step >= 2);
    if (finish) finish.classList.toggle("hidden", step < 2);
    if (skipGoal) skipGoal.classList.toggle("hidden", step !== 2);
    if (step === 0) {
      $("onboarding-title").textContent = "Let's set up your budget";
      body.innerHTML = `<p class="input-label">How do you receive money?</p>
        <div class="stack">
          <label class="option-row"><input type="radio" name="on-src" checked> 📚 Monthly stipend</label>
          <label class="option-row"><input type="radio" name="on-src"> 💼 Part-time job</label>
          <label class="option-row"><input type="radio" name="on-src"> 👨‍👩‍👧 Family allowance</label>
          <label class="option-row"><input type="radio" name="on-src"> 🎓 Student loan</label>
          <label class="option-row"><input type="radio" name="on-src"> 🔀 Multiple sources</label>
        </div>
        <label class="input-label" for="on-income">Monthly amount</label>
        <input id="on-income" class="text-input" type="number" min="0" step="0.01" value="${data.income || ""}" placeholder="0.00" aria-label="Monthly amount">`;
    }
    if (step === 1) {
      $("onboarding-title").textContent = "Set your fixed expenses";
      const chips = ["Rent", "Transport", "Phone", "Subscriptions", "Utilities", "Gym", "Insurance"];
      body.innerHTML = `<p class="input-label">What bills do you pay each month?</p>
        <div id="onboarding-chips" class="chips-row">${chips
          .map(
            (c) =>
              `<button type="button" class="chip" data-chip="${c}" aria-label="${c}">${c}</button>`
          )
          .join("")}</div>
        <button type="button" id="on-add-custom" class="btn-ghost btn-sm">Add custom expense +</button>
        <div id="on-custom-rows" class="stack"></div>
        <p class="hint" id="on-fixed-total">Fixed costs: ${fmtMoney(data.fixed)}/month</p>`;
      body.querySelectorAll("[data-chip]").forEach((b) => {
        b.addEventListener("click", () => {
          const v = window.prompt(`Amount for ${b.dataset.chip}`, "0");
          data.fixed += clampNumber(v, 0);
          $("on-fixed-total").textContent = `Fixed costs: ${fmtMoney(data.fixed)}/month`;
        });
      });
      $("on-add-custom")?.addEventListener("click", () => {
        const name = window.prompt("Expense name");
        const v = window.prompt("Amount", "0");
        if (name) data.fixed += clampNumber(v, 0);
        $("on-fixed-total").textContent = `Fixed costs: ${fmtMoney(data.fixed)}/month`;
      });
    }
    if (step === 2) {
      $("onboarding-title").textContent = "Your first savings goal (optional)";
      body.innerHTML = `<p class="input-label">What are you saving for?</p>
        <div class="chips-row">
          <button type="button" class="chip" data-gt="trip">✈️ Trip</button>
          <button type="button" class="chip" data-gt="tech">💻 Tech</button>
          <button type="button" class="chip" data-gt="em">🛡️ Emergency</button>
          <button type="button" class="chip" data-gt="books">📚 Books</button>
          <button type="button" class="chip" data-gt="soc">🎉 Social</button>
          <button type="button" class="chip" data-gt="skip">Skip →</button>
        </div>
        <div id="goal-fields" class="hidden stack">
          <input id="on-goal-name" class="text-input" placeholder="Goal name" aria-label="Goal name">
          <input id="on-goal-target" class="text-input" type="number" placeholder="Target" aria-label="Target amount">
        </div>`;
      body.querySelectorAll("[data-gt]").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.gt === "skip") {
            data.goalName = "";
            return;
          }
          $("goal-fields")?.classList.remove("hidden");
        });
      });
    }
  };
  next?.addEventListener("click", () => {
    if (step === 0) data.income = clampNumber($("on-income")?.value, 0);
    if (step === 1) {
      /* fixed accumulated in data.fixed */
    }
    step += 1;
    renderStep();
  });
  skipGoal?.addEventListener("click", () => finishOnboarding(data, true));
  finish?.addEventListener("click", () => finishOnboarding(data, false));

  function finishOnboarding(d, skippedGoal) {
    state.monthlyIncome = d.income || state.monthlyIncome;
    state.fixedExpenses = d.fixed || state.fixedExpenses;
    if (!skippedGoal && $("on-goal-name")?.value) {
      const g = normalizeGoal(
        {
          id: safeRandomId(),
          name: $("on-goal-name").value,
          target: $("on-goal-target")?.value,
          saved: 0,
          emoji: "🎯",
          active: true,
          type: "Other",
          deadline: ""
        },
        state.goals.length
      );
      if (g.target > 0) state.goals.push(g);
    }
    localStorage.setItem("ww_onboarded", "true");
    state.onboardingSeen = true;
    saveState();
    launchConfetti();
    $("finish-setup-text").textContent = `You're all set! Your daily limit is ${fmtMoney(getDailySafeSpendRaw(now()))}`;
    openModal($("finish-setup-modal"));
    closeModal($("onboarding-modal"));
  }

  $("onboarding-modal")?.classList.remove("hidden");
  renderStep();
}

init();

