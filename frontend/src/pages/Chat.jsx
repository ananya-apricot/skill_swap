import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Chat() {
  const { swapId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const load = useCallback(async () => {
    try {
      const data = await api(`/messages/${swapId}`);
      setMessages((current) => {
        const merged = new Map((current || []).map((message) => [message._id, message]));
        data.messages.forEach((message) => merged.set(message._id, message));
        return [...merged.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      setError("");
    } catch (err) { setError(err.message); }
  }, [swapId]);
  useEffect(() => {
    let active = true;
    const refresh = () => { if (active && document.visibilityState === "visible") load(); };
    refresh();
    const timer = setInterval(refresh, 3000);
    document.addEventListener("visibilitychange", refresh);
    return () => { active = false; clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages?.length]);
  const send = async (e) => {
    e.preventDefault();
    const draft = text.trim();
    if (!draft || sending) return;
    setSending(true);
    try {
      const result = await api(`/messages/${swapId}`, { method: "POST", body: { text: draft } });
      setMessages((list) => [...(list || []).filter((m) => m._id !== result.message._id), result.message]);
      setText(""); setError("");
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };
  return <>
    <div className="row"><div><p className="eyebrow">YOUR CONVERSATION</p><h1>Make a little magic together.</h1><p className="intro">Say hello, share your goals, and agree on a time to swap skills.</p></div><Link to="/swaps">? Back to swaps</Link></div>
    <p className="live-indicator"><span /> Messages update automatically</p>
    {error && <p className="error" role="alert">{error} <button className="link" onClick={load}>Try again</button></p>}
    <section className="card chat-messages" aria-label="Messages" aria-live="polite">
      {!messages && !error && <p className="muted">Loading your conversation?</p>}
      {messages?.length === 0 && <div className="empty-state"><span>?</span><h2>Start with hello</h2><p>Ask what they would like to learn and suggest a first session.</p></div>}
      {messages?.map((m) => <div className={`message ${m.sender?._id === user.id ? "mine" : "theirs"}`} key={m._id}><strong>{m.sender?._id === user.id ? "You" : m.sender?.name}</strong><p>{m.text}</p><time>{new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time></div>)}
      <div ref={endRef} />
    </section>
    <form className="chat-compose" onSubmit={send}><input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Write a message?" /><button className="btn" disabled={sending || !text.trim()}>{sending ? "Sending?" : "Send message ?"}</button></form>
  </>;
}
