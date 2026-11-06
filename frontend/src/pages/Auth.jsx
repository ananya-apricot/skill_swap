import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Auth() {
  const { authenticate } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Returns a function that updates just one field of the form
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); // stop the browser's default page reload
    setError("");
    setBusy(true);
    try {
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      await authenticate(mode, payload);
      nav(mode === "register" ? "/profile" : "/matches");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card auth">
      <h1>🏮 SkillSwap</h1>
      <p className="muted" style={{ margin: "0.4rem 0 1.2rem" }}>
        Share what you know, discover what you love, and meet someone new along the way.
      </p>

      <form onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>Name</label>
            <input value={form.name} onChange={set("name")} required />
          </>
        )}
        <label>Email</label>
        <input type="email" value={form.email} onChange={set("email")} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={set("password")} required />

        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy} style={{ width: "100%" }}>
          {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
        {mode === "login" ? "New here? " : "Already have an account? "}
        <button className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
    </div>
  );
}