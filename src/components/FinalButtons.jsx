import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function FinalButtons({ onYes }) {
  const [noPosition, setNoPosition] = useState(null);
  const noBtnRef = useRef(null);
  const originalPosRef = useRef(null);

  const moveNoButton = useCallback(() => {
    const btn = noBtnRef.current;
    if (!btn) return;

    // save original position on first hover
    if (!originalPosRef.current) {
      const rect = btn.getBoundingClientRect();
      originalPosRef.current = { x: rect.left, y: rect.top };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;

    const pad = 20;
    const maxX = vw - bw - pad;
    const maxY = vh - bh - pad;

    const newX = Math.max(pad, Math.random() * maxX);
    const newY = Math.max(pad, Math.random() * maxY);

    setNoPosition({ x: newX, y: newY });
  }, []);

  const resetNoButton = useCallback(() => {
    setNoPosition(null);
  }, []);

  return (
    <div className="final-buttons-container">
      <motion.button
        className="yes-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onYes}
        onMouseEnter={resetNoButton}
      >
        YES 💖
      </motion.button>

      <motion.button
        ref={noBtnRef}
        className="no-btn"
        onMouseEnter={moveNoButton}
        style={
          noPosition
            ? {
                position: "fixed",
                left: noPosition.x,
                top: noPosition.y,
                transition: "left 0.3s ease, top 0.3s ease",
                zIndex: 999,
              }
            : {}
        }
        whileHover={{ scale: 1.05 }}
      >
        NO 😈
      </motion.button>
    </div>
  );
}
