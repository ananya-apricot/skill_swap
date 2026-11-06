import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function SkillPicker({ title, hint, skills, picked, blocked, onToggle, tone, onCreate }) {
  const [query, setQuery] = useState("");
  const visibleSkills = useMemo(() => skills.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())), [skills, query]);
  const canCreate = query.trim().length >= 2 && !skills.some((s) => s.name.toLowerCase() === query.trim().toLowerCase());
  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="muted">{hint}</p>
      <input aria-label={`Search ${title}`} placeholder="Search or add any skill" value={query} onChange={(e) => setQuery(e.target.value)} />
      {canCreate && <button type="button" className="link" onClick={async () => { const skill = await onCreate(query.trim()); onToggle(skill._id); setQuery(""); }}>+ Add “{query.trim()}”</button>}
      <div className="chips">
        {visibleSkills.map((s) => (
          <button
            key={s._id}
            type="button"
            className={`chip ${tone} ${picked.includes(s._id) ? "on" : ""}`}
            disabled={blocked.includes(s._id)}
            onClick={() => onToggle(s._id)}
          >
            {s.name}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Profile() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ bio: "", location: "", preferredMode: "online" });
  const [offered, setOffered] = useState([]); // list of skill ids
  const [wanted, setWanted] = useState([]);
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState(false);

  // Load all skills and my current profile when the page opens
  useEffect(() => {
    Promise.all([api("/skills"), api("/users/me")]).then(([s, me]) => {
      const u = me.user;
      setSkills(s.skills);
      setForm({ bio: u.bio || "", location: u.location || "", preferredMode: u.preferredMode });
      setOffered(u.skillsOffered.map((e) => e.skill._id));
      setWanted(u.skillsWanted.map((e) => e.skill._id));
    }).catch((error) => setMsg(error.message));
  }, []);

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const save = async () => {
    setMsg("");
    setSaved(false);
    try {
      await api("/users/me", {
        method: "PUT",
        body: {
          ...form,
          skillsOffered: offered.map((skill) => ({ skill })),
          skillsWanted: wanted.map((skill) => ({ skill })),
        },
      });
      setMsg("Profile saved successfully!");
      setSaved(true);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const createSkill = async (name) => {
    const result = await api("/skills", { method: "POST", body: { name } });
    setSkills((all) => all.some((s) => s._id === result.skill._id) ? all : [...all, result.skill].sort((a, b) => a.name.localeCompare(b.name)));
    return result.skill;
  };

  return (
    <>
      <header className="page-heading"><p className="eyebrow">STEP 01 ? INTRODUCE YOURSELF</p><h1>Every skill has a story.</h1><p className="intro">Tell us a little about yourself, choose what you can teach and what you want to learn, then save your profile to find matches.</p></header>

      <section className="card">
        <label>About you</label>
        <textarea rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <label>Location</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <label>How do you want to meet?</label>
        <select value={form.preferredMode} onChange={(e) => setForm({ ...form, preferredMode: e.target.value })}>
          <option value="online">Online</option>
          <option value="in-person">In person</option>
          <option value="both">Both</option>
        </select>
      </section>

      <SkillPicker
        title="🌿 I can teach"
        hint="Pick the skills you could help someone with."
        skills={skills} picked={offered} blocked={wanted} tone="teach"
        onToggle={(id) => toggle(offered, setOffered, id)} onCreate={createSkill}
      />
      <SkillPicker
        title="🌸 I want to learn"
        hint="Pick the skills you'd love to pick up."
        skills={skills} picked={wanted} blocked={offered} tone="learn"
        onToggle={(id) => toggle(wanted, setWanted, id)} onCreate={createSkill}
      />

      <div className="row">
        <button className="btn" onClick={save}>Save profile</button>
        {msg && !saved && <span className="error">{msg}</span>}
      </div>
      {saved && (
        <section className="profile-complete" role="status" aria-live="polite">
          <span className="profile-complete__lantern" aria-hidden="true">✦</span>
          <div className="profile-complete__copy">
            <h2>Profile saved!</h2>
            <p>Your next chapter starts with a match. Find someone to trade skills with.</p>
          </div>
          <Link className="btn profile-complete__link" to="/matches">Explore matches <span aria-hidden="true">→</span></Link>
        </section>
      )}
    </>
  );
}
