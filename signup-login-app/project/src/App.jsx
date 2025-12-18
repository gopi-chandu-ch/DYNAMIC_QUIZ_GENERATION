import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoursesPage from "./components/coursepage";
import QuizPage from "./components/quizpage";
import ResultPage from "./components/result";
import NextQuizPage from "./components/nextquizpage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<CoursesPage />} />
          <Route path="/quiz/:courseId" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/next-quiz" element={<NextQuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
