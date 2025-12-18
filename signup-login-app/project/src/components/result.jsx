import { useLocation, useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/ResultPage.css"; // 👈 Import the style

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resultData } = location.state || {};

  if (!resultData) {
    return <p>No result data available. Please take a quiz first.</p>;
  }

  const { score, total, wrong_topics, next_quiz_ids } = resultData;

  const weakest_topic =
    wrong_topics && Object.keys(wrong_topics).length > 0
      ? Object.entries(wrong_topics).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : "None";

  const correct = score;
  const wrong = total - score;

  const pieData = {
    labels: ["Correct", "Wrong"],
    datasets: [
      {
        data: [correct, wrong],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverOffset: 8,
      },
    ],
  };

  const barData = {
    labels: Object.keys(wrong_topics || {}),
    datasets: [
      {
        label: "Wrong Answers per Topic",
        data: Object.values(wrong_topics || {}),
        backgroundColor: "#2196F3",
      },
    ],
  };

  return (
    <div className="result-container">
      <h2>📊 Quiz Result</h2>
      <p>
        <b>Your Score:</b> {score} / {total}
      </p>

      {/* --- Overall Performance Chart --- */}
      <div className="chart-wrapper" style={{ width: "300px" }}>
        <Doughnut data={pieData} />
      </div>

      {/* --- Topic-wise Mistakes --- */}
      {wrong_topics && Object.keys(wrong_topics).length > 0 && (
        <div className="bar-section">
          <h3>Performance by Topic</h3>
          <Bar data={barData} />
          <p className="weakest-topic">
            <b>Weakest Area:</b> {weakest_topic}
          </p>
        </div>
      )}

      {/* --- Perfect Score Message --- */}
      {(!wrong_topics || Object.keys(wrong_topics).length === 0) && (
        <p className="success-msg">🎉 Excellent! You got everything correct!</p>
      )}

      {/* --- Buttons --- */}
      <div className="btn-container">
        <button onClick={() => navigate("/")} className="result-btn back-btn">
          Back to Courses
        </button>

        {next_quiz_ids && next_quiz_ids.length > 0 && (
          <button
            onClick={() =>
              navigate("/next-quiz", { state: { nextQuiz: next_quiz_ids } })
            }
            className="result-btn next-btn"
          >
            Take Next Quiz (Based on Strong Topics)
          </button>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
