import React, { useState, useEffect } from 'react';
import type { Question } from '../types';
import { useGame } from '../contexts/GameContext.tsx';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { submitAnswer, gameState, playerId } = useGame(); // ✅ chỉ gọi hook 1 lần
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

const me = gameState.players.find(p => p.id === playerId);

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setTimeLeft(15);
  }, [question.id]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, submitted]);

  const handleAnswer = (answer: string) => {
    if (submitted) return;
    setSelectedAnswer(answer);
    submitAnswer(answer);
    setSubmitted(true);
  };

  const isDisabled = submitted || me?.answered || me?.status === 'out';

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-squid-gray p-6 rounded-lg border-2 border-squid-pink shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-squid-light">{question.text}</h2>
        <div
          className={`text-4xl font-pixel ${
            timeLeft < 6 ? 'text-red-500 animate-pulse' : 'text-squid-green'
          }`}
        >
          {timeLeft}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = submitted && option === question.answer;

          let buttonClass = 'bg-squid-dark hover:bg-opacity-80';
          if (submitted) {
            if (isCorrect) buttonClass = 'bg-green-700';
            else if (isSelected) buttonClass = 'bg-red-700';
            else buttonClass = 'bg-gray-700';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={isDisabled}
              className={`p-4 rounded-md text-lg font-bold text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {submitted && <p className="text-center mt-4 text-squid-green">Answer Submitted!</p>}
    </motion.div>
  );
};

export default QuestionCard;
