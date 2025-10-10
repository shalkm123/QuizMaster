"use client";
import { useEffect, useState } from "react";

const QuestionTimer = ({ onTimeUp, setTimePerQuestion, isAnswered, resetTimer }) => {
  const [seconds, setSeconds] = useState(20); // 20 seconds for each question

  useEffect(() => {
    if (!isAnswered && seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds((prev) => prev - 1);
        setTimePerQuestion(20 - seconds);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (seconds === 0 && !isAnswered) {
      onTimeUp();
    }
  }, [seconds, isAnswered]);

  // Reset the timer whenever a new question is loaded
  useEffect(() => {
    setSeconds(20); // Reset the timer to 20 seconds
  }, [resetTimer]); // `resetTimer` is a prop that changes when a new question is loaded

  //return <div className="text-lg">Time Left: {seconds}s</div>;
   const progressPercentage = ((20 - seconds) / 20) * 100;

    return (
    <div className="text-center mb-4">
      {/* Timer Display */}
      <div className={`text-2xl font-bold mb-2 ${
        seconds <= 5 ? 'text-red-500 animate-pulse' : 
        seconds <= 10 ? 'text-orange-500' : 'text-green-500'
      }`}>
        Time Left: {seconds}s
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            seconds <= 5 ? 'bg-red-500' : 
            seconds <= 10 ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Status Text */}
      <div className="text-sm text-gray-600">
        {isAnswered ? 'Question Answered' : 
         seconds <= 5 ? 'Hurry up!' : 
         'Choose your answer'}
      </div>
    </div>
  );
};

export default QuestionTimer;

