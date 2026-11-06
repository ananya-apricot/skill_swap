import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Sky from "./components/Sky";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Swaps from "./pages/Swaps";
import Chat from "./pages/Chat";

// Wraps a page so only logged-in users can see it (the frontend version of "protect")
function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center">Lighting the lanterns…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

function Journey() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user) return null;
  const steps = [{ to: "/profile", label: "Set up profile" }, { to: "/matches", label: "Discover people" }, { to: "/swaps", label: "Connect & chat" }];
  return <div className="journey" aria-label="How SkillSwap works"><span className="journey-label">YOUR JOURNEY</span>{steps.map((step, i) => <NavLink key={step.to} to={step.to} className={pathname.startsWith(step.to) || (i === 2 && pathname.startsWith("/chat")) ? "journey-step current" : "journey-step"}><span>{i + 1}</span>{step.label}</NavLink>)}</div>;
}

function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <nav className="nav">
      <span className="brand">🏮 SkillSwap</span>
      <div className="links">
        <NavLink to="/matches">Matches</NavLink>
        <NavLink to="/swaps">Swaps</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <button className="ghost" onClick={logout}>Log out</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Sky />
        <Navbar />
        <Journey />
        <main className="page">
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/matches" element={<Private><Matches /></Private>} />
            <Route path="/swaps" element={<Private><Swaps /></Private>} />
            <Route path="/chat/:swapId" element={<Private><Chat /></Private>} />
            <Route path="/profile" element={<Private><Profile /></Private>} />
            <Route path="*" element={<Navigate to="/matches" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
