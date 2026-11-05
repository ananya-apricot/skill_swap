// Asks the Python service to score candidates. Throws if it's down or too slow.
const scoreCandidates = async (me, candidates) => {
  const res = await fetch(`${process.env.AI_SERVICE_URL}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AI_SERVICE_KEY,
    },
    body: JSON.stringify({ me, candidates }),
    signal: AbortSignal.timeout(15000), // give up after 15 seconds
  });
  if (!res.ok) throw new Error(`AI service returned ${res.status}`);
  const data = await res.json();
  return data.results; // [{ id, score, mutual, explanation }]
};

// Backup: simple exact-overlap scoring, used if the AI service is unavailable
const basicScore = (me, c) => {
  const theyTeach = c.offered.filter((s) => me.wanted.includes(s));
  const iTeach = c.wanted.filter((s) => me.offered.includes(s));
  return {
    id: c.id,
    score: Math.min(100, (theyTeach.length + iTeach.length) * 25),
    mutual: theyTeach.length > 0 && iTeach.length > 0,
    explanation: `Exact skill overlap: ${[...theyTeach, ...iTeach].join(", ") || "none"}`,
  };
};

module.exports = { scoreCandidates, basicScore };