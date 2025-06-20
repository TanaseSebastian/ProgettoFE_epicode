// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";

// Importa i reducer dei tuoi slice.
// Assicurati che questi file si trovino in src/store/
import usersReducer        from "./usersSlice";
import couplesReducer      from "./couplesSlice";
import expensesReducer from "./expensesSlice";
import authReducer         from "./authSlice";

export const store = configureStore({
    reducer: {
      users:        usersReducer,
      couples:      couplesReducer,
      expenses:     expensesReducer, 
      auth:         authReducer,
    },
  });
