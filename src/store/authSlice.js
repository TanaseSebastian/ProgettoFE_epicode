import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

/* --- logout thunk --- */
export const logout = createAsyncThunk("auth/logout", async () => {
  await signOut(auth);
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
    });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
