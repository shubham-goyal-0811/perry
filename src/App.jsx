import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingHearts from "./components/FloatingHearts";
import Leaderboard from "./components/Leaderboard";
import QuestionCard from "./components/QuestionCard";
import DareWheel from "./components/DareWheel";
import FinalReveal from "./components/FinalReveal";
import { questions } from "./data/questions";
import useSoundManager from "./hooks/useSoundManager";

/* ---------- Loading screen lines ---------- */
const LOADING_LINES = [
  "Initializing Love System...",
  "Scanning Emotional Database...",
  "Analyzing Relationship...",
  "Result: Dangerously in Love.",
];

export default function App() {
  /* ---- sound manager ---- */
  const sound = useSoundManager();

  /* ---- state ---- */
  /* "intro" = splash, "start" = typing, then game phases */
  const [gamePhase, setGamePhase] = useState("intro");
  const [perryPoints, setPerryPoints] = useState(100);
  const [ganduPoints, setGanduPoints] = useState(100);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [daresCompleted, setDaresCompleted] = useState(0);

  /* loading animation */
  const [loadingLine, setLoadingLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showStartBtn, setShowStartBtn] = useState(false);

  /* chaos state */
  const [chaosAnswer, setChaosAnswer] = useState(null);
  const [glitching, setGlitching] = useState(false);
  const [chaosText, setChaosText] = useState(null);

  /* mute UI */
  const [musicPlaying, setMusicPlaying] = useState(false);

  /* sound ref for effects (avoids stale closures without re-triggering effects) */
  const soundRef = useRef(sound);
  soundRef.current = sound;

  /* ---------- intro → start (user click unlocks audio) ---------- */
  const handleEnter = useCallback(() => {
    setGamePhase("start");
  }, []);

  /* ---------- typing effect + typing sound ---------- */
  useEffect(() => {
    if (gamePhase !== "start") return;
    if (loadingLine >= LOADING_LINES.length) {
      setShowStartBtn(true);
      soundRef.current.stopTyping();
      return;
    }

    // start typing sound on first line (audio is now unlocked)
    if (loadingLine === 0) {
      soundRef.current.playTyping();
    }

    const line = LOADING_LINES[loadingLine];
    let charIdx = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      charIdx++;
      setDisplayedText(line.slice(0, charIdx));
      if (charIdx >= line.length) {
        clearInterval(interval);
        setTimeout(() => setLoadingLine((l) => l + 1), 600);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [loadingLine, gamePhase]);

  /* (toast removed — intro click now unlocks audio) */

  /* ---------- handlers ---------- */
  const handleStart = useCallback(() => {
    sound.startMusic();
    setMusicPlaying(true);
    setGamePhase("round1");
  }, [sound]);

  const handleQuizAnswer = useCallback(
    (correct) => {
      if (correct) {
        setPerryPoints((p) => p + 10);
      } else {
        setPerryPoints((p) => Math.max(0, p - 5));
      }
      const next = questionIndex + 1;
      if (next >= questions.length) {
        setTimeout(() => setGamePhase("round2"), 600);
      } else {
        setQuestionIndex(next);
      }
    },
    [questionIndex]
  );

  const handleCorrectSound = useCallback(() => {
    sound.playCorrect();
  }, [sound]);

  const handleWrongSound = useCallback(() => {
    sound.playRandomWrong();
  }, [sound]);

  const handleDareComplete = useCallback(
    (completed) => {
      if (completed) {
        setGanduPoints((p) => p + 20);
      } else {
        setGanduPoints((p) => Math.max(0, p - 10));
      }
      const next = daresCompleted + 1;
      setDaresCompleted(next);
      if (next >= 3) {
        setTimeout(() => setGamePhase("chaos"), 600);
      }
    },
    [daresCompleted]
  );

  const handleSpinStart = useCallback(() => {
    sound.playWheel();
  }, [sound]);

  const handleSpinEnd = useCallback(() => {
    sound.stopWheel();
  }, [sound]);

  const handleDareCorrect = useCallback(() => {
    sound.playCorrect();
  }, [sound]);

  const handleDareWrong = useCallback(() => {
    sound.playRandomWrong();
  }, [sound]);

  const handleChaosAnswer = useCallback(() => {
    setChaosAnswer(true);
    setGlitching(true);
    sound.playGlitch();

    const flickerInterval = setInterval(() => {
      setPerryPoints(Math.floor(Math.random() * 500));
      setGanduPoints(Math.floor(Math.random() * 500));
    }, 100);

    setTimeout(() => {
      clearInterval(flickerInterval);
      setGlitching(false);
      setChaosText("error");
    }, 2000);

    setTimeout(() => setChaosText("cannot"), 3500);
    setTimeout(() => setChaosText("disabled"), 5000);
    setTimeout(() => {
      setGamePhase("final");
    }, 7000);
  }, [sound]);

  const handleToggleMusic = useCallback(() => {
    const playing = sound.toggleMusic();
    setMusicPlaying(playing);
  }, [sound]);

  const handleFinalAccept = useCallback(() => {
    sound.setMusicVolume(0.35);
    sound.playYay();
  }, [sound]);

  /* ---------- render ---------- */
  const showLeaderboard =
    gamePhase === "round1" ||
    gamePhase === "round2" ||
    (gamePhase === "chaos" && !chaosText);

  return (
    <div className={`app ${glitching ? "glitch-mode" : ""}`}>
      <FloatingHearts />

      {/* Mute toggle — only show after intro */}
      {gamePhase !== "intro" && (
        <button
          className="mute-btn"
          onClick={handleToggleMusic}
          title="Toggle Music"
        >
          {musicPlaying ? "🎵" : "🔇"}
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* ===== INTRO SPLASH (unlocks audio) ===== */}
        {gamePhase === "intro" && (
          <motion.div
            key="intro"
            className="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <motion.button
              className="start-btn intro-enter"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleEnter}
            >
              💘 Tap to Enter
            </motion.button>
          </motion.div>
        )}

        {/* ===== LOADING SCREEN (typing) ===== */}
        {gamePhase === "start" && (
          <motion.div
            key="start"
            className="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <div className="terminal">
              {LOADING_LINES.slice(0, loadingLine).map((l, i) => (
                <p key={i} className="terminal-line done">
                  {l}
                </p>
              ))}
              {loadingLine < LOADING_LINES.length && (
                <p className="terminal-line typing">
                  {displayedText}
                  <span className="cursor">|</span>
                </p>
              )}
            </div>

            {showStartBtn && (
              <motion.button
                className="start-btn"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleStart}
              >
                💖 START THE CHAOS
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ===== LEADERBOARD (persistent in game phases) ===== */}
        {showLeaderboard && (
          <div className="game-layout" key="game">
            <Leaderboard
              perryPoints={perryPoints}
              ganduPoints={ganduPoints}
            />

            {/* ===== ROUND 1 ===== */}
            {gamePhase === "round1" && (
              <motion.div
                key="r1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="round-title">
                  🧠 Round 1 — "Do You Even Know Me?"
                </h2>
                <p className="question-progress">
                  Question {questionIndex + 1} / {questions.length}
                </p>
                <AnimatePresence mode="wait">
                  <QuestionCard
                    key={questionIndex}
                    question={questions[questionIndex]}
                    onAnswer={handleQuizAnswer}
                    onCorrect={handleCorrectSound}
                    onWrong={handleWrongSound}
                  />
                </AnimatePresence>
              </motion.div>
            )}

            {/* ===== ROUND 2 ===== */}
            {gamePhase === "round2" && (
              <DareWheel
                key="r2"
                onDareComplete={handleDareComplete}
                daresCompleted={daresCompleted}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
                onDareCorrect={handleDareCorrect}
                onDareWrong={handleDareWrong}
              />
            )}

            {/* ===== CHAOS ROUND ===== */}
            {gamePhase === "chaos" && !chaosAnswer && (
              <motion.div
                key="chaos-q"
                className="chaos-question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="round-title">🧨 Chaos Round 🧨</h2>
                <h3 className="question-text">"Who loves more?"</h3>
                <div className="options-grid">
                  {["Perry", "Gandu", "Equal", "It cannot be measured"].map(
                    (opt) => (
                      <motion.button
                        key={opt}
                        className="option-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleChaosAnswer}
                      >
                        {opt}
                      </motion.button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ===== CHAOS TEXT (after glitch) ===== */}
        {gamePhase === "chaos" && chaosText && (
          <motion.div
            key="chaos-text"
            className="chaos-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {chaosText === "error" && (
              <motion.p
                className="chaos-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Error.
              </motion.p>
            )}
            {chaosText === "cannot" && (
              <motion.p
                className="chaos-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Love cannot be calculated.
              </motion.p>
            )}
            {chaosText === "disabled" && (
              <motion.p
                className="chaos-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Competition mode disabled.
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ===== FINAL REVEAL ===== */}
        {gamePhase === "final" && (
          <FinalReveal key="final" onAccept={handleFinalAccept} />
        )}
      </AnimatePresence>
    </div>
  );
}
