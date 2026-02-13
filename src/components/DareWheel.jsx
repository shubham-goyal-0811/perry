import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dares } from "../data/dares";

const SPIN_DURATION = 2000;
const MESSAGES_COMPLETE = [
  "Okay fine, you're kinda cute 😏💖",
  "That's what I'm talking about! 🔥",
  "Love level: UNMATCHED 👑",
];
const MESSAGES_SKIP = [
  "Scared? Thought so 😂",
  "Skipping? That's -10 vibes 💀",
  "Weak move but okay 😤",
];

export default function DareWheel({
  onDareComplete,
  daresCompleted,
  onSpinStart,
  onSpinEnd,
  onDareCorrect,
  onDareWrong,
}) {
  const [spinning, setSpinning] = useState(false);
  const [currentDare, setCurrentDare] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [responseMsg, setResponseMsg] = useState(null);
  const [usedIndices] = useState(() => new Set());

  const spin = useCallback(() => {
    if (spinning) return;
    setResponseMsg(null);
    setSpinning(true);
    setRotation((r) => r + 720 + Math.random() * 360);
    onSpinStart?.();

    setTimeout(() => {
      const availableIdxs = dares
        .map((_, i) => i)
        .filter((i) => !usedIndices.has(i));
      const pick =
        availableIdxs[Math.floor(Math.random() * availableIdxs.length)];
      usedIndices.add(pick);
      setCurrentDare(dares[pick]);
      setSpinning(false);
      onSpinEnd?.();
    }, SPIN_DURATION);
  }, [spinning, usedIndices, onSpinStart, onSpinEnd]);

  const handleAction = (completed) => {
    // play correct/wrong sound
    if (completed) {
      onDareCorrect?.();
    } else {
      onDareWrong?.();
    }

    const msgs = completed ? MESSAGES_COMPLETE : MESSAGES_SKIP;
    setResponseMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => {
      setCurrentDare(null);
      setResponseMsg(null);
      onDareComplete(completed);
    }, 1800);
  };

  return (
    <motion.div
      className="dare-wheel-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="round-title">🔥 Round 2 — Dare Mode 🔥</h2>
      <p className="dare-progress">Dares completed: {daresCompleted} / 3</p>

      <div className="wheel-wrapper">
        <motion.div
          className="wheel"
          animate={{ rotate: rotation }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          {dares.map((d, i) => (
            <div
              key={i}
              className="wheel-segment"
              style={{ transform: `rotate(${i * 60}deg)` }}
            >
              <span>{d.slice(0, 20)}…</span>
            </div>
          ))}
        </motion.div>
        <div className="wheel-pointer">▼</div>
      </div>

      {!currentDare && !spinning && (
        <motion.button
          className="spin-btn"
          onClick={spin}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          🎰 SPIN THE WHEEL
        </motion.button>
      )}

      {spinning && <p className="spinning-text">Spinning…</p>}

      <AnimatePresence>
        {currentDare && !spinning && (
          <motion.div
            className="dare-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <p className="dare-text">{currentDare}</p>
            {!responseMsg && (
              <div className="dare-actions">
                <motion.button
                  className="dare-btn complete"
                  onClick={() => handleAction(true)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                >
                  ✅ Completed (+20)
                </motion.button>
                <motion.button
                  className="dare-btn skip"
                  onClick={() => handleAction(false)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                >
                  ❌ Skip (-10)
                </motion.button>
              </div>
            )}
            {responseMsg && (
              <motion.p
                className="dare-response"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {responseMsg}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
