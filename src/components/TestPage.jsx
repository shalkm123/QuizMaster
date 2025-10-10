"use client";
import QuestionTimer from "@/components/ui/QuestionTimer";
import Results from "@/components/ui/Results";
import { usePoints } from "@/context/PointContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestPage() {
  const [mcqs, setMcqs] = useState([]);
  const { points, setPoints } = usePoints();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [unattemptedQuestions, setUnattemptedQuestions] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(0);

  // Save test state to localStorage
  const saveTestState = () => {
    const testState = {
      currentQuestionIndex,
      selectedOption,
      isAnswered,
      showResults,
      correctAnswers,
      wrongAnswers,
      unattemptedQuestions,
      totalTimeSpent,
      timePerQuestion
    };
    localStorage.setItem("testState", JSON.stringify(testState));
  };

  // Load test state from localStorage
  const loadTestState = () => {
    const stored = localStorage.getItem("testState");
    if (stored) {
      const testState = JSON.parse(stored);
      setCurrentQuestionIndex(testState.currentQuestionIndex || 0);
      setSelectedOption(testState.selectedOption || null);
      setIsAnswered(testState.isAnswered || false);
      setShowResults(testState.showResults || false);
      setCorrectAnswers(testState.correctAnswers || 0);
      setWrongAnswers(testState.wrongAnswers || 0);
      setUnattemptedQuestions(testState.unattemptedQuestions || 0);
      setTotalTimeSpent(testState.totalTimeSpent || 0);
      setTimePerQuestion(testState.timePerQuestion || 0);
    }
  };

  useEffect(() => {
    const xx = localStorage.getItem("mcqs");
    if(!xx){
      alert("Unfair means detected.. closing the test");
      router.replace("/dashboard");
      return;
    }
    const decryptedBytes = CryptoJS.AES.decrypt(localStorage.getItem("mcqs"),  process.env.NEXT_PUBLIC_MCQSECRET);
    const stored = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
    if(!stored){
      alert("No questions found. Please start a new test.");
      router.replace("/dashboard");
      return;
    }
    if (stored) {
      //setQuestions(JSON.parse(stored));
      setQuestions(stored);
      // Load test state after setting questions
      loadTestState();
    }
  }, []);

  // Save test state whenever it changes
  useEffect(() => {
    if (questions.length > 0) {
      saveTestState();
    }
  }, [currentQuestionIndex, selectedOption, isAnswered, showResults, correctAnswers, wrongAnswers, unattemptedQuestions, totalTimeSpent, timePerQuestion]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handleBackButton = () => {
      window.history.pushState(null, null, window.location.pathname);
    };
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    setTotalTimeSpent(totalTimeSpent + timePerQuestion);

    if (option === questions[currentQuestionIndex].answer) {
      setPoints(points + 4);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }
  };

  const handleTimeUp = () => {
    setIsAnswered(true);
    setUnattemptedQuestions(unattemptedQuestions + 1);
    setTotalTimeSpent(totalTimeSpent + 10);
    handleNext();
  };

  const handleNext = () => {
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimePerQuestion(0);
    } else {
      setShowResults(true);
    }
  };

  const handleEndTest = () => {
     const confirmEnd = window.confirm("Are you sure you want to end the test and return to the dashboard?");
    if (!confirmEnd) return;
    
    // Clear both mcqs and test state when ending test
    localStorage.removeItem("mcqs");
    localStorage.removeItem("testState");
    
    router.push("/dashboard");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowResults(false);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setUnattemptedQuestions(0);
    setTotalTimeSpent(0);
    setTimePerQuestion(0);
    setPoints(0);
    console.log("Test ended and returned to dashboard.");
  };

  const percentage = Math.round((correctAnswers / questions.length) * 100);
  const averageTimePerQuestion = (totalTimeSpent / questions.length).toFixed(2);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {!showResults ? (
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6 relative">
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
          <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <h3 className="text-xl font-bold text-center mb-6 p-4 bg-blue-500 text-white rounded-lg">
            {questions[currentQuestionIndex]?.question}
          </h3>
          <QuestionTimer
            onTimeUp={handleTimeUp}
            setTimePerQuestion={setTimePerQuestion}
            isAnswered={isAnswered}
            resetTimer={currentQuestionIndex}
          />
          <div className="mt-6 space-y-4">
            {questions[currentQuestionIndex]?.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition duration-300 focus:outline-none ${
                  isAnswered && option === questions[currentQuestionIndex].answer
                    ? "bg-green-500 text-white"
                    : isAnswered && option === selectedOption
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 focus:bg-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {isAnswered && (
            <button
              onClick={handleNext}
              className="mt-8 w-full py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next Question"}
            </button>
          )}
          <button
            onClick={handleEndTest}
            className="mt-4 w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            End Test
          </button>
        </div>
      ) : (
        <Results
          score={points}
          totalQuestions={questions.length}
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
          unattemptedQuestions={unattemptedQuestions}
          percentage={percentage}
          timeSpent={totalTimeSpent}
          averageTimePerQuestion={averageTimePerQuestion}
        />
      )}
    </div>
  );
}

/pages/test.js

