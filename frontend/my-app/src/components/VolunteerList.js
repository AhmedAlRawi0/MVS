import React, { useState, useEffect } from 'react';
import '../styles/VolunteerList.css';
import { fetchVolunteers, rejectApplication } from "../services/api";

const API_BASE = "http://127.0.0.1:5000"; 

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState(new Set());
  const [emailDetails, setEmailDetails] = useState({ subject: "", message: "" });
  const [response, setResponse] = useState("");

  const itemsPerPage = 10;
  const roles = ["Cooking", "Packaging", "Cleaning", "Distributing"];

  const getVolunteers = async () => {
    try {
      const response = await fetchVolunteers();
      console.log('API Response:', response); // Debug log
      
      if (response.data.success) {
        setVolunteers(response.data.volunteers);
        // Set initial checkbox state
        const initSelected = new Set();
        response.data.volunteers.forEach(vol => {
          initSelected.add(vol._id); // Note: using _id instead of id
        });
        setSelectedVolunteers(initSelected);
      } else {
        console.error('Failed to fetch volunteers:', response.data);
        setVolunteers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setVolunteers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    getVolunteers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredVolunteers.map(v => v._id);
      setSelectedVolunteers(new Set(allIds));
    } else {
      setSelectedVolunteers(new Set());
    }
  };

  const handleSelectVolunteer = (volunteerId) => {
    setSelectedVolunteers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(volunteerId)) {
        newSet.delete(volunteerId);
      } else {
        newSet.add(volunteerId);
      }
      return newSet;
    });
  };

  const handleSendEmail = () => {
    const selectedVolunteersList = volunteers.filter(v => selectedVolunteers.has(v._id));
    const selectedEmails = selectedVolunteersList.map(v => v.email);
    
    // Replace this with your actual email sending logic
    console.log('Sending email to:', selectedEmails);
    alert(`Email would be sent to ${selectedEmails.length} volunteers`);
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? volunteer.volunteering_role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const pageCount = Math.ceil(filteredVolunteers.length / itemsPerPage);
  const paginatedVolunteers = filteredVolunteers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  const handleDelete = async (volunteerId) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      try {
        // Replace with your actual API call
        await rejectApplication(volunteerId);
        getVolunteers();
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const handleEmailChange = (e) => {
    setEmailDetails({ ...emailDetails, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="volunteer-empty">Loading...</div>;
  }

  return (
    <div className="volunteer-list-container">
      <div className="volunteer-list-header">
        <h1 className="volunteer-list-title">Volunteer List</h1>
        {selectedVolunteers.size > 0 && (
          <button 
            className="email-button"
            onClick={handleSendEmail}
          >
            Send Email to Selected ({selectedVolunteers.size})
          </button>
        )}
      </div>

      <div className="volunteer-search">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="volunteer-filters">
        <select value={roleFilter} onChange={handleRoleFilter}>
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {paginatedVolunteers.length > 0 ? (
        <>
          <table className="volunteer-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedVolunteers.size === filteredVolunteers.length && filteredVolunteers.length > 0}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVolunteers.map(volunteer => (
                <tr key={volunteer._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.has(volunteer._id)}
                      onChange={() => handleSelectVolunteer(volunteer._id)}
                    />
                  </td>
                  <td>{volunteer.name}</td>
                  <td>{volunteer.email}</td>
                  <td>{volunteer.volunteering_role}</td>
                  <td>
                    <div className="volunteer-actions">
                      <button
                        className="action-button view-button"
                        onClick={() => handleView(volunteer)}
                      >
                        View
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDelete(volunteer._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            {[...Array(pageCount)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="pagination-button"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="volunteer-empty">No volunteers found</div>
      )}

      {showModal && selectedVolunteer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Volunteer Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{selectedVolunteer.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{selectedVolunteer.email}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{selectedVolunteer.phone_number || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Role:</div>
                <div className="detail-value">{selectedVolunteer.volunteering_role || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Description:</div>
                <div className="detail-value">{selectedVolunteer.desc_paragraph || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Availabilities:</div>
                <div className="detail-value">
                  {selectedVolunteer.availabilities ? (
                    typeof selectedVolunteer.availabilities === 'string' ? (
                      selectedVolunteer.availabilities
                    ) : Array.isArray(selectedVolunteer.availabilities) ? (
                      <ul className="availability-list">
                        {selectedVolunteer.availabilities.map((date, index) => (
                          <li key={index}>{new Date(date).toLocaleDateString()}</li>
                        ))}
                      </ul>
                    ) : (
                      'N/A'
                    )
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              {selectedVolunteer.cv && (
                <div className="detail-row">
                  <div className="detail-label">CV:</div>
                  <div className="detail-value">
                    <a 
                      href={`${API_BASE}/cv/${selectedVolunteer._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-link"
                    >
                      View CV
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="modal-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Send Email</h3>
        <div>
          <label>Subject: </label>
          <input type="text" name="subject" value={emailDetails.subject} onChange={handleEmailChange} />
        </div>
        <div>
          <label>Message: </label>
          <textarea name="message" value={emailDetails.message} onChange={handleEmailChange} />
        </div>
        <button onClick={handleSendEmail}>Send Email</button>
        {response && <p>{response}</p>}
      </div>
    </div>
  );
};

export default VolunteerList;