// components/Signup.js
import React, { useState } from "react";
import { signupVolunteer } from "../services/api";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", skills: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signupVolunteer(formData);
      setMessage(res.data.message);
      setFormData({ name: "", email: "", skills: "" });
    } catch (error) {
      console.error("Signup error", error);
      setMessage("Error signing up!");
    }
  };

  return (
    <div>
      <h1>Volunteer Signup</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input name="name" value={formData.name} onChange={handleChange} required/>
        </div>
        <div>
          <label>Email:</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required/>
        </div>
        <div>
          <label>Skills:</label>
          <input name="skills" value={formData.skills} onChange={handleChange} />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;