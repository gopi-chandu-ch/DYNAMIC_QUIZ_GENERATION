import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/nextquize.css";

function NextQuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { nextQuiz } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!nextQuiz || nextQuiz.length === 0) return;

    axios
      .post("http://127.0.0.1:8000/api/get-questions-by-ids/", { ids: nextQuiz })
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Error loading next quiz:", err));
  }, [nextQuiz]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentIndex];
    if (selectedOption === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption("");
    } else {
      setShowResult(true);
    }
  };

  if (!nextQuiz) return <p>No next quiz data found.</p>;
  if (questions.length === 0) return <p>Loading next quiz...</p>;

  if (showResult) {
    return (
      <div className="result-container">
        <h2>Next Quiz Completed!</h2>
        <p>Your Score: {score} / {questions.length}</p>
        <button onClick={() => navigate("/")}>Back to Courses</button>
      </div>
    );
  }

  const q = questions[currentIndex];
  const options = [q.option1, q.option2, q.option3, q.option4];

  return (
    <div className="quiz-container">
      <h2>Question {currentIndex + 1} / {questions.length}</h2>
      <h3>{q.question}</h3>

      <div className="options">
        {options.map((opt, index) => (
          <label
            key={index}
            className={`option ${selectedOption === opt ? "selected" : ""}`}
            onClick={() => handleOptionSelect(opt)}
          >
            <input
              type="radio"
              name="option"
              value={opt}
              checked={selectedOption === opt}
              readOnly
            />
            {opt}
          </label>
        ))}
      </div>

      <button
        className="next-btn"
        onClick={handleNext}
        disabled={!selectedOption}
      >
        {currentIndex + 1 === questions.length ? "Submit" : "Next"}
      </button>
    </div>
  );
}

export default NextQuizPage;
