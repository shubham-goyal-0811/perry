import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnswerOverlay from "./AnswerOverlay";

export default function QuestionCard({ question, onAnswer, onCorrect, onWrong }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [overlayType, setOverlayType] = useState(null);

  const handleClick = (option) => {
    if (selected) return;
    setSelected(option);
    const correct = option === question.correct;
    setIsCorrect(correct);
    setFeedback(correct ? question.rightResponse : question.wrongResponse);
    setOverlayType(correct ? "correct" : "wrong");

    if (correct) {
      onCorrect?.();
    } else {
      onWrong?.();
    }

    setTimeout(() => {
      onAnswer(correct);
      setSelected(null);
      setFeedback(null);
      setIsCorrect(null);
      setOverlayType(null);
    }, 2500);
  };

  return (
    <motion.div
      className="question-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="question-text">{question.question}</h3>

      <div className="options-grid">
        {question.options.map((option) => {
          let btnClass = "option-btn";
          if (selected) {
            if (option === question.correct) btnClass += " correct";
            else if (option === selected) btnClass += " wrong shake";
          }
          return (
            <motion.button
              key={option}
              className={btnClass}
              onClick={() => handleClick(option)}
              whileHover={!selected ? { scale: 1.05 } : {}}
              whileTap={!selected ? { scale: 0.95 } : {}}
              disabled={!!selected}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Answer image — inline below options, not fixed overlay */}
      <AnimatePresence>
        {overlayType && (
          <AnswerOverlay key={overlayType + "-img"} type={overlayType} />
        )}
      </AnimatePresence>

      {/* Feedback text — below image */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`feedback-text ${isCorrect ? "correct-fb" : "wrong-fb"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
