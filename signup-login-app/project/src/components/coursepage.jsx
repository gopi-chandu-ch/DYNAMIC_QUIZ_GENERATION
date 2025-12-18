import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CoursesPage.css"; 

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/courses/")
      .then((res) => setCourses(res.data.courses))
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  const handleSelect = (id) => {
    navigate(`/quiz/${id}`);
  };

  return (
    <>
      <nav>
        <div className="logo">ACADEMIX</div>
        <div className="nav-links">
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/progress")}>Progress</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
          <button
            onClick={() => {
              localStorage.removeItem("loggedInUser");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <h2>Available Courses</h2>
        {courses.length === 0 ? (
          <p className="empty">No courses available.</p>
        ) : (
          <div className="course-list">
            {courses.map((course) => (
              <div className="course-card" key={course.id}>
                <h4>{course.name}</h4>
                <p>{course.description || "No description available."}</p>
                <button onClick={() => handleSelect(course.id)}>
                  Start Course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default CoursesPage;
