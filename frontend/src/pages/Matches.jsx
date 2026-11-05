import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Matches() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState({}); // remembers which requests we sent

  useEffect(() => {
    api("/matches").then(setData).catch((e) => setError(e.message));
  }, []);

  const request = async (id) => {
    try {
      await api("/swaps", {
        method: "POST",
        body: { to: id, message: "Hi! I think we'd make a great skill swap." },
      });
      setSent((s) => ({ ...s, [id]: "Request sent ✓" }));
    } catch (e) {
      setSent((s) => ({ ...s, [id]: e.message }));
    }
  };

  if (error) {
    return (
      <div className="card">
        <p className="error">{error}</p>
        <Link to="/profile" className="muted">Go to your profile →</Link>
      </div>
    );
  }
  if (!data) return <p className="center">Searching the village for matches…</p>;

  return (
    <>
      <h1>Your matches</h1>
      {data.source === "basic" && (
        <p className="muted">The AI is resting, so these are simple exact-skill matches.</p>
      )}
      {data.matches.length === 0 && (
        <div className="card muted">No matches yet. Invite friends or add more skills to your profile.</div>
      )}

      {data.matches.map((m) => (
        <article className="card" key={m.user._id}>
          <div className="row">
            <h2>{m.user.name}</h2>
            {m.mutual && <span className="badge">✦ MUTUAL MATCH</span>}
          </div>
          {m.user.location && <p className="muted">📍 {m.user.location}</p>}

          <div className="meter"><div style={{ width: `${m.score}%` }} /></div>
          <p className="muted">{m.score}% compatible</p>

          <p style={{ margin: "0.6rem 0" }}>{m.explanation}</p>

          <div>
            {m.user.skillsOffered.map((e) => (
              <span className="tag" key={e.skill._id}>{e.skill.name}</span>
            ))}
          </div>

          <div className="actions">
            <button className="btn" disabled={!!sent[m.user._id]} onClick={() => request(m.user._id)}>
              {sent[m.user._id] || "Request swap"}
            </button>
          </div>
        </article>
      ))}
    </>
  );
}