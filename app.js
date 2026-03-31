/* Wallet Warden (offline-first, no backend) */

const STORAGE_KEY = "wallet-warden-v3";
const LEGACY_KEYS = ["wallet-warden-v2", "wallet-warden-v1"];

const DEFAULT_CATEGORIES = Object.freeze([
  { id: "cat_food", name: "Food", emoji: "🍕" },
  { id: "cat_coffee", name: "Coffee", emoji: "☕" },
  { id: "cat_transit", name: "Transit", emoji: "🚌" },
  { id: "cat_school", name: "School", emoji: "📚" },
  { id: "cat_rent", name: "Rent", emoji: "🏠" },
  { id: "cat_tuition", name: "Tuition", emoji: "🎓" },
  { id: "cat_subs", name: "Subscriptions", emoji: "📦" },
  { id: "cat_fun", name: "Fun", emoji: "🎮" },
  { id: "cat_other", name: "Other", emoji: "💸" }
]);

const DEFAULT_STATE = Object.freeze({
  schemaVersion: 3,
  monthlyIncome: 0,
  fixedExpenses: 0,
  incomeSources: [
    { id: "inc_stipend", name: "Stipend", type: "monthly", amount: 0 },
    { id: "inc_job", name: "Job", type: "monthly", amount: 0 }
  ],
  recurringItems: [
    { id: "rec_rent", name: "Rent", categoryId: "cat_rent", type: "expense", cadence: "monthly", amount: 0, dayOfMonth: 1, active: false },
    { id: "rec_tuition", name: "Tuition", categoryId: "cat_tuition", type: "expense", cadence: "monthly", amount: 0, dayOfMonth: 1, active: false }
  ],
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
  goals: [{ id: "goal_laptop", name: "New laptop", target: 900, saved: 0, emoji: "💻", active: true }],
  onboardingSeen: false,
  settlementDayKey: "",
  lastRecurringAppliedMonth: ""
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
  openSettings: $("open-settings"),
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

  tabButtons: qsa(".tabbar-btn"),
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
  txDate: $("tx-date"),

  searchQuery: $("search-query"),
  filterCategory: $("filter-category"),
  filterMonth: $("filter-month"),
  filteredTotal: $("filtered-total"),
  filteredList: $("filtered-transaction-list"),
  jumpToday: $("jump-today"),

  goalsList: $("goals-list"),
  openGoalsEditor: $("open-goals-editor"),

  insightSpent: $("insight-spent"),
  insightSafe: $("insight-safe"),
  insightTopCategory: $("insight-top-category"),
  insightAvgDay: $("insight-avg-day"),
  categoryBreakdown: $("category-breakdown"),

  openIncomeEditor: $("open-income-editor"),
  openRecurringEditor: $("open-recurring-editor"),
  openCategoriesEditor: $("open-categories-editor"),

  dataModal: $("data-modal"),
  closeData: $("close-data"),
  exportJson: $("export-json"),
  exportCsv: $("export-csv"),
  importJson: $("import-json"),
  importJsonBtn: $("import-json-btn")
};

let state = normalizeState(loadState());

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
    monthKey: sanitizeText(item?.monthKey, monthKey(d), 8)
  };
}

function normalizeGoal(item, idx) {
  return {
    id: sanitizeText(item?.id, `goal_${idx}`, 64),
    name: sanitizeText(item?.name, "Goal", 40),
    target: clampNumber(item?.target, 0, 999999),
    saved: clampNumber(item?.saved, 0, 999999),
    emoji: sanitizeText(item?.emoji, "🎯", 4),
    active: item?.active !== false
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
    schemaVersion: 3,
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
    lastRecurringAppliedMonth: sanitizeText(base.lastRecurringAppliedMonth, "", 8)
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

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(clampNumber(value, 0));
}

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

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => els.toast.classList.add("hidden"), 1900);
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
    btn.addEventListener("click", () => addQuickExpense(item));
    els.quickAddGrid.appendChild(btn);
  });
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
  sorted.forEach((tx) => {
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
      <div class="history-amount">-${currency(tx.amount)}</div>
    `;
    els.transactionList.appendChild(item);
  });
}

function renderStatusPills(dailyLimit, spentToday) {
  if (!els.budgetStatusPill || !els.savedTodayPill) return;
  const savedToday = Math.max(0, dailyLimit - spentToday);
  const overToday = Math.max(0, spentToday - dailyLimit);
  if (overToday > 0) {
    els.budgetStatusPill.textContent = `Over by ${currency(overToday)}`;
    els.budgetStatusPill.className = "status-pill status-pill--warn";
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
    monthKey: monthKey(new Date(createdAt))
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
    .filter((tx) => tx.monthKey === month)
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
    els.filteredList.appendChild(item);
  });
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
      <div class="grid grid-cols-2 gap-2 mt-2">
        <button class="subtle-btn" type="button" data-goal-action="add" data-goal-id="${g.id}">Add $10</button>
        <button class="subtle-btn" type="button" data-goal-action="remove" data-goal-id="${g.id}">Withdraw $10</button>
      </div>
    `;
    els.goalsList.appendChild(li);
  });
}

function renderInsights() {
  const today = now();
  const monthTx = getCurrentMonthTransactions(today);
  const monthSpent = sumAmounts(monthTx);
  const dailyLimit = clampNumber(getDailySafeSpendRaw(today), 0);

  if (els.insightSpent) els.insightSpent.textContent = `-${currency(monthSpent)}`;
  if (els.insightSafe) els.insightSafe.textContent = currency(dailyLimit);
  const daysSoFar = Math.max(1, today.getDate());
  if (els.insightAvgDay) els.insightAvgDay.textContent = currency(monthSpent / daysSoFar);

  const byCat = {};
  monthTx.forEach((tx) => (byCat[tx.categoryId] = (byCat[tx.categoryId] || 0) + tx.amount));
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const top = sortedCats[0];
  if (els.insightTopCategory) {
    if (top) {
      const catObj = state.categories.find((c) => c.id === top[0]);
      els.insightTopCategory.textContent = catObj ? `${catObj.emoji} ${catObj.name}` : "—";
    } else {
      els.insightTopCategory.textContent = "—";
    }
  }

  if (!els.categoryBreakdown) return;
  els.categoryBreakdown.innerHTML = "";
  if (!sortedCats.length) {
    const li = document.createElement("li");
    li.className = "text-sm text-zinc-500 py-2";
    li.textContent = "No spending yet this month.";
    els.categoryBreakdown.appendChild(li);
    return;
  }
  const max = sortedCats[0][1] || 1;
  sortedCats.slice(0, 12).forEach(([catId, total]) => {
    const catObj = state.categories.find((c) => c.id === catId) || { emoji: "🏷️", name: "Category" };
    const li = document.createElement("li");
    li.className = "breakdown-item";
    const pct = Math.max(2, Math.round((total / max) * 100));
    li.innerHTML = `
      <div class="goal-row">
        <div class="goal-title">${catObj.emoji} ${catObj.name}</div>
        <div class="goal-meta">-${currency(total)}</div>
      </div>
      <div class="progress"><div style="width:${pct}%"></div></div>
    `;
    els.categoryBreakdown.appendChild(li);
  });
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
    if (els.monthSpent) els.monthSpent.textContent = `${currency(monthSpent)} spent`;
    if (els.streakCount) els.streakCount.textContent = String(getStreak(today));
    if (els.historyTotal) els.historyTotal.textContent = `-${currency(monthSpent)}`;

    if (els.incomeInput) els.incomeInput.value = state.monthlyIncome || "";
    if (els.fixedInput) els.fixedInput.value = state.fixedExpenses || "";
    if (els.savingsGoalName) els.savingsGoalName.value = state.savingsGoalName;
    if (els.savingsTotal) els.savingsTotal.textContent = currency(state.savingsTotal);

    renderStatusPills(dailyLimit, spentToday);
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
  els.planForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.monthlyIncome = clampNumber(els.incomeInput?.value, 0);
    state.fixedExpenses = clampNumber(els.fixedInput?.value, 0);
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

  els.tabButtons.forEach((btn) => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));

  els.openAddTransaction?.addEventListener("click", openAddTransaction);
  els.closeAddTx?.addEventListener("click", () => closeModal(els.addTxModal));
  els.cancelTx?.addEventListener("click", () => closeModal(els.addTxModal));
  els.addTxModal?.addEventListener("click", (e) => {
    if (e.target === els.addTxModal) closeModal(els.addTxModal);
  });
  els.addTxForm?.addEventListener("submit", saveManualTransaction);

  els.searchQuery?.addEventListener("input", renderLogPanel);
  els.filterCategory?.addEventListener("change", renderLogPanel);
  els.filterMonth?.addEventListener("change", renderLogPanel);
  els.jumpToday?.addEventListener("click", () => {
    const d = now();
    if (els.filterMonth) els.filterMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (els.searchQuery) els.searchQuery.value = "";
    if (els.filterCategory) els.filterCategory.value = "";
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

  // Plan editors: fully offline, coming next pass (wired now so the app never breaks).
  els.openIncomeEditor?.addEventListener("click", () => showToast("Income editor coming next"));
  els.openRecurringEditor?.addEventListener("click", () => showToast("Recurring editor coming next"));
  els.openCategoriesEditor?.addEventListener("click", () => showToast("Categories editor coming next"));

  // Backups modal (open via settings double-click for now)
  els.openSettings?.addEventListener("dblclick", () => openModal(els.dataModal));
  els.closeData?.addEventListener("click", () => closeModal(els.dataModal));
  els.dataModal?.addEventListener("click", (e) => {
    if (e.target === els.dataModal) closeModal(els.dataModal);
  });
  els.exportJson?.addEventListener("click", exportBackupJson);
  els.exportCsv?.addEventListener("click", exportTransactionsCsv);
  els.importJsonBtn?.addEventListener("click", importBackupJson);

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
  maybeShowOnboarding();
  registerServiceWorker();
}

init();
