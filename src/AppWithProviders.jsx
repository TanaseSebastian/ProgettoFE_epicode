// src/AppWithProviders.js
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider } from "./AdminPanelContext";
import App from "./App";

export default function AppWithProviders() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  );
}
