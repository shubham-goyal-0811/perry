import { useMemo } from "react";

const HEART_COUNT = 18;

export default function FloatingHearts() {
  const hearts = useMemo(() => {
    return Array.from({ length: HEART_COUNT }, (_, i) => {
      const size = Math.random() * 20 + 10;
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = Math.random() * 6 + 8;
      const opacity = Math.random() * 0.4 + 0.15;
      return { id: i, size, left, delay, duration, opacity };
    });
  }, []);

  return (
    <div className="floating-hearts-container">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            opacity: h.opacity,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
