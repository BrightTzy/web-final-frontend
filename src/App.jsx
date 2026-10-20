// src/App.jsx

import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Home";
import LoginPage from "./Login";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
