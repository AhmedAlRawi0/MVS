import axios from "axios";

const API_BASE = "http://localhost:5000";  // Adjust based on your backend

export const signupVolunteer = (data) => axios.post(`${API_BASE}/signup`, data);

export const fetchApplications = () => axios.get(`${API_BASE}/applications`);

export const fetchVolunteers = () => axios.get(`${API_BASE}/volunteers`);

export const sendEmails = (payload) => axios.post(`${API_BASE}/send-email`, payload);