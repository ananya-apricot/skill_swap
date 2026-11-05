import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// login returns "id" but /auth/me returns "_id", so we make them consistent
const normalize = (u) => ({ ...u, id: u.id ?? u._id });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  // On page load, if a token exists, ask the backend who it belongs to
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api("/auth/me")
      .then((d) => setUser(normalize(d.user)))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // mode is "login" or "register"
  const authenticate = async (mode, form) => {
    const data = await api(`/auth/${mode}`, { method: "POST", body: form });
    localStorage.setItem("token", data.token);
    setUser(normalize(data.user));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}