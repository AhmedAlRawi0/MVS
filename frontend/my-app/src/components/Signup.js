// components/Signup.js
import React, { useState } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Signup.css';
import { signupVolunteer } from "../services/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    description_paragraph: "",
    email: "",
    phoneNumber: "",
    cv: null,
    volunteeringRole: "",
    availabilities: []
  });
  const [message, setMessage] = useState("");

  const roles = ["Cooking", "Packaging", "Cleaning", "Distributing"];

  const handleChange = (e) => {
    if (e.target.name === 'cv') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prevData => {
      const currentDates = [...prevData.availabilities];
      const dateIndex = currentDates.indexOf(dateStr);
      
      if (dateIndex === -1) {
        return {
          ...prevData,
          availabilities: [...currentDates, dateStr]
        };
      } else {
        currentDates.splice(dateIndex, 1);
        return {
          ...prevData,
          availabilities: currentDates
        };
      }
    });
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    return formData.availabilities.includes(dateStr) ? 'selected-date' : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'availabilities') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const res = await signupVolunteer(formDataToSend);
      setMessage(res.data.message);
      setFormData({
        name: "",
        desc_paragraph: "",
        email: "",
        phone_number: "",
        cv: null,
        volunteering_role: "",
        availabilities: []
      });
    } catch (error) {
      console.error("Signup error", error);
      setMessage("Error signing up!");
    }
  };

  return (
    <div className="container">
      <div className="signup-container">
        <h1 className="signup-title">Volunteer Signup</h1>
        <h2 className="signup-subtitle">
          Jazakum Allahu Khairan for applying for the volunteering opportunity at Sister Sabria Foundation
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea 
              name="description_paragraph"
              value={formData.desc_paragraph}
              onChange={handleChange}
              placeholder="Tell us about yourself and why you'd like to volunteer..."
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input 
              name="phone_number" 
              type="tel" 
              pattern="[0-9]{10,}"
              value={formData.phone_number} 
              onChange={handleChange} 
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>CV Upload:</label>
            <input 
              name="cv" 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleChange} 
              required
            />
          </div>

          <div className="form-group">
            <label>Volunteering Role:</label>
            <select 
              name="volunteering_role" 
              value={formData.volunteering_role} 
              onChange={handleChange}
              required
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Availabilities (Click dates to select/unselect):</label>
            <div className="calendar-container">
              <Calendar
                onChange={handleDateClick}
                value={null}
                tileClassName={tileClassName}
                selectRange={false}
                minDate={new Date()}
              />
            </div>
            <div className="selected-dates">
              <p>Selected Dates:</p>
              <ul>
                {formData.availabilities
                  .sort()
                  .map(date => (
                    <li key={date}>{new Date(date).toLocaleDateString()}</li>
                  ))}
              </ul>
            </div>
          </div>

          <button type="submit" className="submit-button">Sign Up</button>
        </form>
        
        {message && (
          <p className={message.includes("Error") ? "error-message" : "success-message"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;