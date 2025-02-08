import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";  // Adjust based on your backend

export const signupVolunteer = (data) => axios.post(`${API_BASE}/signup`, data);

export const fetchApplications = () => axios.get(`${API_BASE}/applications`);

export const approveApplication = (applicationId) => axios.get(`${API_BASE}/application/${applicationId}/approve`);

export const rejectApplication = (applicationId) => axios.get(`${API_BASE}/application/${applicationId}/reject`);

export const fetchVolunteers = () => axios.get(`${API_BASE}/volunteers`);

export const sendEmails = (payload) => axios.post(`${API_BASE}/send-email`, payload);