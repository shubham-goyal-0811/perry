import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard({ perryPoints, ganduPoints }) {
  const [ganduClicks, setGanduClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const perryLeads = perryPoints > ganduPoints;
  const ganduLeads = ganduPoints > perryPoints;
  const tied = perryPoints === ganduPoints;

  const handleGanduClick = () => {
    const next = ganduClicks + 1;
    setGanduClicks(next);
    if (next >= 5) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 3000);
      setGanduClicks(0);
    }
  };

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">💘 LOVE POINTS BATTLE 💘</h2>

      <div className="leaderboard-row">
        <div className="player-card">
          <span className="crown">{perryLeads || tied ? "👑" : ""}</span>
          <span className="player-name">Perry</span>
          <span className="separator">—</span>
          <motion.span
            key={perryPoints}
            className="points"
            initial={{ scale: 1.6, color: "#ff4d6d" }}
            animate={{ scale: 1, color: "#ffffff" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {perryPoints} ❤️
          </motion.span>
        </div>

        <div className="player-card">
          <span className="crown">{ganduLeads ? "👑" : ""}</span>
          <span
            className="player-name gandu-name"
            onClick={handleGanduClick}
            title="Click me 😉"
          >
            Gandu
          </span>
          <span className="separator">—</span>
          <motion.span
            key={ganduPoints}
            className="points"
            initial={{ scale: 1.6, color: "#ff4d6d" }}
            animate={{ scale: 1, color: "#ffffff" }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {ganduPoints} ❤️
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            className="easter-egg-popup"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
          >
            PS: You always win in my heart. 💜
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
