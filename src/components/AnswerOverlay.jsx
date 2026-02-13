import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnswerOverlay({ type }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const src =
    type === "correct"
      ? "/images/correct-trans.png"
      : "/images/wrong-trans.png";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="answer-overlay-inline"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <img src={src} alt={type} className="answer-overlay-img" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
