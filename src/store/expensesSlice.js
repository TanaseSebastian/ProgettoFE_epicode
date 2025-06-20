import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const fetchExpenses = createAsyncThunk("expenses/fetch", async () => {
  const snap = await getDocs(collection(db, "expenses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

const expensesSlice = createSlice({
  name: "expenses",
  initialState: { list: [] },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchExpenses.fulfilled, (s, a) => {
      s.list = a.payload;
    });
  },
});
export default expensesSlice.reducer;
