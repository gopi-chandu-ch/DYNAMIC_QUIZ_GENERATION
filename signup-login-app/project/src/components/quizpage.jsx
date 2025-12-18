import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/QuizPage.css"; // 👈 Import the new styles

function QuizPage() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/start-quiz/${courseId}/`)
      .then((res) => {
        setQuestions(res.data.quizzes);
        setLoading(false);
      })
      .catch((err) => console.error("Error loading quiz:", err));
  }, [courseId]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentIndex];
    const updatedAnswers = [
      ...userAnswers,
      { id: currentQuestion.id, selected: selectedOption },
    ];
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption("");
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (answers) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/submit-quiz/", {
        course_id: courseId,
        answers: answers,
      });
      navigate("/result", { state: { resultData: res.data } });
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  if (loading) return <p style={{ color: "white" }}>Loading quiz questions...</p>;

  const q = questions[currentIndex];
  const options = [q.option1, q.option2, q.option3, q.option4];

  return (
    <div className="quiz-container">
      <h2>
        Question {currentIndex + 1} / {questions.length}
      </h2>
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
              onChange={() => handleOptionSelect(opt)}
              style={{ display: "none" }}
            />
            {opt}
          </label>
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={!selectedOption}
        className="next-btn"
      >
        {currentIndex + 1 === questions.length ? "Submit" : "Next"}
      </button>
    </div>
  );
}

export default QuizPage;
