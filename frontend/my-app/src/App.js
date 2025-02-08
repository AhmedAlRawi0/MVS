import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./components/Signup";
import Applications from "./components/Applications";
import VolunteerList from "./components/VolunteerList";

const App = () => {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Volunteer Signup</Link></li>
          <li><Link to="/applications">Applications (Admin)</Link></li>
          <li><Link to="/volunteers">Volunteer List (Admin)</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/volunteers" element={<VolunteerList />} />
      </Routes>
    </Router>
  );
};

export default App;