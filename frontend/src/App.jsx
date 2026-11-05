import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
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
