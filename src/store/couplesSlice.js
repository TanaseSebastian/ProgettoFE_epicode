import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* FETCH */
export const fetchCouples = createAsyncThunk("couples/fetch", async () => {
  const snap = await getDocs(collection(db, "coppie"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

/* ADD */
export const addCouple = createAsyncThunk("couples/add", async (c) => {
  const ref = await addDoc(collection(db, "coppie"), {
    ...c,
    createdAt: Timestamp.now(),
  });
  return { id: ref.id, ...c };
});

/* UPDATE */
export const updateCouple = createAsyncThunk("couples/update", async (c) => {
  await updateDoc(doc(db, "coppie", c.id), c);
  return c;
});

/* DELETE */
export const deleteCouple = createAsyncThunk("couples/delete", async (id) => {
  await deleteDoc(doc(db, "coppie", id));
  return id;
});

const couplesSlice = createSlice({
  name: "couples",
  initialState: { list: [] },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCouples.fulfilled, (s, a) => { s.list = a.payload; })
     .addCase(addCouple.fulfilled,   (s, a) => { s.list.push(a.payload); })
     .addCase(updateCouple.fulfilled,(s, a) => { s.list = s.list.map(x => x.id === a.payload.id ? a.payload : x); })
     .addCase(deleteCouple.fulfilled,(s, a) => { s.list = s.list.filter(x => x.id !== a.payload); });
  },
});
export default couplesSlice.reducer;
