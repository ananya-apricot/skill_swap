import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";

export default function Swaps() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    api("/swaps").then((d) => setSwaps(d.swaps)).catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  // action is one of: accept, reject, cancel, complete
  const act = async (id, action) => {
    setError("");
    try {
      await api(`/swaps/${id}/${action}`, { method: "PATCH" });
      load(); // refresh the list
    } catch (e) {
      setError(e.message);
    }
  };

  if (!swaps) return <p className="center">Loading swaps…</p>;

  return (
    <>
      <header className="page-heading"><p className="eyebrow">STEP 03 ? CONNECT</p><h1>Good things start here.</h1><p className="intro">Accept incoming requests, or wait for your request to be accepted. Then open chat to plan your first swap.</p></header>
      {error && <p className="error">{error}</p>}
      {swaps.length === 0 && <div className="card muted">No swaps yet. <Link to="/matches">Discover your matches ?</Link></div>}

      {swaps.map((s) => {
        const incoming = s.to._id === user.id; // did someone send this TO me?
        const other = incoming ? s.from : s.to;

        return (
          <article className="card" key={s._id}>
            <div className="row">
              <h2>{incoming ? `${other.name} wants to swap` : `You → ${other.name}`}</h2>
              <span className={`status ${s.status}`}>{s.status}</span>
            </div>
            {s.message && <p className="muted">“{s.message}”</p>}

            <div className="actions">
              {s.status === "pending" && incoming && (
                <>
                  <button className="btn" onClick={() => act(s._id, "accept")}>Accept</button>
                  <button className="btn danger" onClick={() => act(s._id, "reject")}>Decline</button>
                </>
              )}
              {s.status === "pending" && !incoming && (
                <button className="btn danger" onClick={() => act(s._id, "cancel")}>Cancel request</button>
              )}
              {s.status === "accepted" && (
                <>
                  <Link className="btn" to={`/chat/${s._id}`}>Open chat</Link>
                  <button className="btn" onClick={() => act(s._id, "complete")}>Mark as completed</button>
                </>
              )}
            </div>
          </article>
        );
      })}
    </>
  );
}
