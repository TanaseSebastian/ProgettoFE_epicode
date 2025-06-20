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

/* ---------- thunks ---------- */
export const fetchUsers = createAsyncThunk("users/fetch", async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

export const addUser = createAsyncThunk("users/add", async (user) => {
  const ref = await addDoc(collection(db, "users"), {
    ...user,
    createdAt: Timestamp.now(),
  });
  return { id: ref.id, ...user };
});

export const updateUser = createAsyncThunk("users/update", async (user) => {
  await updateDoc(doc(db, "users", user.id), user);
  return user;
});

export const deleteUser = createAsyncThunk("users/delete", async (id) => {
  await deleteDoc(doc(db, "users", id));
  return id;
});

/* ---------- slice ---------- */
const usersSlice = createSlice({
  name: "users",
  initialState: { list: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.list = state.list.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
