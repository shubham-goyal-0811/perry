import { useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import FinalButtons from "./FinalButtons";

export default function FinalReveal({ onAccept }) {
  const [accepted, setAccepted] = useState(false);

  const handleYes = () => {
    setAccepted(true);
    onAccept?.();
  };

  return (
    <motion.div
      className={`final-reveal ${accepted ? "accepted" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {accepted && (
        <Confetti
          numberOfPieces={350}
          recycle={true}
          gravity={0.08}
          colors={["#ff9a9e", "#fad0c4", "#fbc2eb", "#a18cd1", "#fff"]}
        />
      )}

      {!accepted ? (
        <>
          <motion.div
            className="infinite-scores"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="infinite-line">
              Perry's Love: <span className="infinite">Infinite ❤️</span>
            </p>
            <p className="infinite-line">
              Gandu's Love: <span className="infinite">Infinite ❤️</span>
            </p>
          </motion.div>

          <motion.div
            className="romantic-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="twist">Plot twist…</p>
            <p>This was never about winning.</p>
            <p>
              I made this because I love you more than points can ever measure.
            </p>
            <p>
              Thank you for being my favorite person, my peace, my chaos, and my
              home.
            </p>
          </motion.div>

          <motion.div
            className="valentine-question"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.5, type: "spring" }}
          >
            <p className="valentine-ask">
              Will you be my Valentine forever? 💖
            </p>
            <FinalButtons onYes={handleYes} />
          </motion.div>
        </>
      ) : (
        <motion.div
          className="forever-mode"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="forever-title">Unlocked: Forever Mode 💍</h1>
          <p className="forever-sub">You + Me = ∞</p>
        </motion.div>
      )}
    </motion.div>
  );
}
