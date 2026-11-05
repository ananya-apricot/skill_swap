import hashlib
import json
import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from groq import Groq
from pydantic import BaseModel

# ---------- Setup ----------
load_dotenv()
API_KEY = os.getenv("AI_SERVICE_KEY", "")
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

MAX_CANDIDATES = 20   # keeps requests small (free-tier friendly)
CACHE_SECONDS = 600   # remember answers for 10 minutes
cache: dict[str, tuple[float, list]] = {}


# ---------- Data shapes ----------
class Person(BaseModel):
    id: str
    offered: list[str]
    wanted: list[str]


class ScoreRequest(BaseModel):
    me: Person
    candidates: list[Person]


# ---------- The instructions for the AI ----------
SYSTEM_PROMPT = """You match people for a free skill-exchange platform.
Each person lists skills they can teach ("offered") and skills they want to learn ("wanted").
For each candidate, judge how good a swap with "me" would be:
- Can the candidate teach what I want? Related skills count (e.g. JavaScript helps with React).
- Can I teach what the candidate wants?
- A swap is "mutual" only if both directions have a real fit.
Return ONLY JSON in this exact shape:
{"results":[{"id":"<candidate id>","score":<integer 0-100>,"mutual":<true|false>,"explanation":"<one or two friendly sentences saying why>"}]}
Include every candidate exactly once. Use low scores when there is little overlap. Never invent skills that are not listed."""


# ---------- Helpers ----------
def cache_key(req: ScoreRequest) -> str:
    # Same input always produces the same fingerprint
    return hashlib.sha256(req.model_dump_json().encode()).hexdigest()


def clean(raw: dict, valid_ids: set[str]) -> list[dict]:
    """Never trust AI output blindly: fix types, clamp scores, drop unknown ids."""
    out, seen = [], set()
    for r in raw.get("results", []):
        cid = str(r.get("id", ""))
        if cid not in valid_ids or cid in seen:
            continue
        seen.add(cid)
        try:
            score = max(0, min(100, int(r.get("score", 0))))
        except (TypeError, ValueError):
            score = 0
        out.append({
            "id": cid,
            "score": score,
            "mutual": bool(r.get("mutual", False)),
            "explanation": str(r.get("explanation", ""))[:300],
        })
    return out


# ---------- The endpoint ----------
@app.post("/score")
def score(req: ScoreRequest, x_api_key: str = Header(default="")):
    # 1. Security: only callers who know the shared key get in
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Bad API key")

    # 2. Limit the work
    req.candidates = req.candidates[:MAX_CANDIDATES]
    if not req.candidates:
        return {"results": []}

    # 3. Cache: same request recently? Reuse the answer
    key = cache_key(req)
    hit = cache.get(key)
    if hit and time.time() - hit[0] < CACHE_SECONDS:
        return {"results": hit[1], "cached": True}

    # 4. Ask the AI
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": req.model_dump_json()},
            ],
        )
        raw = json.loads(resp.choices[0].message.content)
        results = clean(raw, {c.id for c in req.candidates})
    except Exception as e:
        # Express sees this error and falls back to basic matching
        raise HTTPException(status_code=502, detail=f"Groq error: {e}")

    # 5. Save and return
    cache[key] = (time.time(), results)
    return {"results": results}