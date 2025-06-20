// ---------------- src/store/expensesSlice.js ----------------
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

/* ───────────────────────── THUNK: fetchExpenses ───────────────────────── */
export const fetchExpenses = createAsyncThunk(
  "expenses/fetch",
  async ({ uid1, uid2, year, month = null }, { rejectWithValue }) => {
    try {
      const start = new Date(year, month !== null ? month : 0, 1);
      const end = month !== null
        ? new Date(year, month + 1, 1)
        : new Date(year + 1, 0, 1);

      const q = query(
        collection(db, "expenses"),
        where("timestamp", ">=", start),
        where("timestamp", "<", end)
      );

      const snap = await getDocs(q);
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((e) => e.uid === uid1 || e.uid === uid2);

      return { data, uid1, uid2 };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


/* ────────────────────────── HELPER: buildStats ────────────────────────── */
const buildStats = (raw, uid1, uid2) => {
  const monthlyExpenses = Array(12).fill(0);
  const monthlyIncome   = Array(12).fill(0);
  const annualExpenses  = {};
  const annualIncome    = {};
  const u1Cat = {}, u2Cat = {}, combCat = {};
  const u1Inc = {}, u2Inc = {}, combInc = {};

  raw.forEach((rec) => {
    const date = rec.timestamp.toDate();
    const m    = date.getMonth();
    const y    = date.getFullYear();
    const isU1 = rec.uid === uid1;
    const isU2 = uid2 && rec.uid === uid2;

    if (rec.type === "Spesa") {
      monthlyExpenses[m] += rec.amount;
      annualExpenses[y] = (annualExpenses[y] || 0) + rec.amount;
      if (isU1) u1Cat[rec.category]       = (u1Cat[rec.category] || 0) + rec.amount;
      if (isU2) u2Cat[rec.category]       = (u2Cat[rec.category] || 0) + rec.amount;
      if (rec.shared) combCat[rec.category] = (combCat[rec.category] || 0) + rec.amount;
    }

    if (rec.type === "Entrata") {
      monthlyIncome[m] += rec.amount;
      annualIncome[y] = (annualIncome[y] || 0) + rec.amount;
      if (isU1) u1Inc[rec.category]       = (u1Inc[rec.category] || 0) + rec.amount;
      if (isU2) u2Inc[rec.category]       = (u2Inc[rec.category] || 0) + rec.amount;
      if (rec.shared) combInc[rec.category] = (combInc[rec.category] || 0) + rec.amount;
    }
  });

  const u1Balance = raw.reduce(
    (a, r) => a + (r.uid === uid1 ? (r.type === "Entrata" ? r.amount : -r.amount) : 0),
    0
  );
  const u2Balance = raw.reduce(
    (a, r) => a + (r.uid === uid2 ? (r.type === "Entrata" ? r.amount : -r.amount) : 0),
    0
  );

  return {
    list: raw,
    balances: {
      utente1: u1Balance,
      utente2: u2Balance,
      combined: u1Balance + u2Balance,
    },
    monthlyData: { expenses: monthlyExpenses, income: monthlyIncome },
    annualData:  { expenses: Object.values(annualExpenses), income: Object.values(annualIncome) },
    categories:  {
      u1Expenses:       u1Cat,
      u2Expenses:       u2Cat,
      combinedExpenses: combCat,
      u1Income:         u1Inc,
      u2Income:         u2Inc,
      combinedIncome:   combInc,
    },
  };
};

/* ───────────────────────────── SLICE ───────────────────────────── */
const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    list: [],
    balances:     { utente1: 0, utente2: 0, combined: 0 },
    monthlyData:  { expenses: [], income: [] },
    annualData:   { expenses: [], income: [] },
    categories:   {},
    status: "idle",
    error:  null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending,   (state) => { state.status = "loading"; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        const { data, uid1, uid2 } = action.payload;
        Object.assign(state, buildStats(data, uid1, uid2));
        state.status = "succeeded";
      })
      .addCase(fetchExpenses.rejected,  (state, action) => {
        state.status = "failed";
        state.error  = action.payload;
      });
  },
});

export default expensesSlice.reducer;

/* ─────────────────────────── SELECTOR MEMO ─────────────────────────── */
const slice = (state) => state.expenses;

export const selectBalances     = createSelector(slice, (s) => s.balances);
export const selectMonthlyData  = createSelector(slice, (s) => s.monthlyData);
export const selectAnnualData   = createSelector(slice, (s) => s.annualData);
export const selectCategories   = createSelector(slice, (s) => s.categories);
export const selectExpensesList = createSelector(slice, (s) => s.list);
