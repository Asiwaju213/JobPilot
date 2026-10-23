/**
 * JobPilot frontend — Phase 0 root component.
 *
 * Sets up React Router with the top-level routes. For Phase 0 these are
 * placeholder pages (Home, Sign In, Sign Up) stubbed with minimal content.
 * Real pages will be implemented in later steps.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
