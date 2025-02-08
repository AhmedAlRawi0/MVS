import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Applications from "./components/ApplicationList";
import VolunteerList from "./components/VolunteerList";
import './styles/global.css';
import './styles/navbar.css';
import './styles/footer.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/volunteers" element={<VolunteerList />} />
          <Route path="/applications" element={<Applications />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;