import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Chat() {
  const { swapId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const load = () => api(`/messages/${swapId}`).then((d) => setMessages(d.messages)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [swapId]);
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const result = await api(`/messages/${swapId}`, { method: "POST", body: { text } });
      setMessages((list) => [...list, result.message]); setText(""); setError("");
    } catch (e2) { setError(e2.message); }
  };
  if (!messages) return <p className="center">Loading chat…</p>;
  return <>
    <div className="row"><h1>Swap chat</h1><Link to="/swaps">Back to swaps</Link></div>
    {error && <p className="error">{error}</p>}
    <section className="card chat-messages" aria-live="polite">
      {messages.length === 0 && <p className="muted">Say hello and start planning your skill swap.</p>}
      {messages.map((m) => <p key={m._id}><strong>{m.sender._id === user.id ? "You" : m.sender.name}:</strong> {m.text}</p>)}
    </section>
    <form className="row" onSubmit={send}><input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Write a message…" /><button className="btn">Send</button></form>
  </>;
}
