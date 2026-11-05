import { useMemo } from "react";

const rand = (min, max) => Math.random() * (max - min) + min;

export default function Sky() {
  // useMemo = generate the random positions once, not on every re-render
  const stars = useMemo(
    () => Array.from({ length: 70 }, () => ({
      left: `${rand(0, 100)}%`, top: `${rand(0, 70)}%`,
      size: Math.round(rand(1, 3)), delay: `${rand(0, 5)}s`,
    })), []
  );
  const flies = useMemo(
    () => Array.from({ length: 14 }, () => ({
      left: `${rand(0, 100)}%`, top: `${rand(40, 100)}%`,
      delay: `${rand(0, 8)}s`, dur: `${rand(8, 16)}s`,
    })), []
  );

  return (
    <div className="sky" aria-hidden="true">
      <div className="aurora" />
      {stars.map((s, i) => (
        <span key={i} className="star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }} />
      ))}
      {flies.map((f, i) => (
        <span key={i} className="firefly"
          style={{ left: f.left, top: f.top, animationDelay: f.delay, animationDuration: f.dur }} />
      ))}
    </div>
  );
}