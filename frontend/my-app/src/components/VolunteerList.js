import React, { useState, useEffect } from 'react';
import '../styles/VolunteerList.css';
import { fetchVolunteers, sendEmails } from "../services/api";

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

  const fetchVolunteers = async () => {
    try {
      // Mock data for testing
      const mockData = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          phoneNumber: "1234567890",
          volunteeringRole: "Cooking",
          description_paragraph: "I love cooking and want to help the community.",
          availabilities: ["2024-03-20", "2024-03-21", "2024-03-22"]
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          phoneNumber: "0987654321",
          volunteeringRole: "Packaging",
          description_paragraph: "I have experience in food packaging.",
          availabilities: ["2024-03-23", "2024-03-24"]
        },
        {
          id: 3,
          name: "Alice Johnson",
          email: "alice@example.com",
          phoneNumber: "5555555555",
          volunteeringRole: "Distributing",
          description_paragraph: "I have a car and can help with distribution.",
          availabilities: ["2024-03-25", "2024-03-26", "2024-03-27"]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setVolunteers(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers().then(res => {
      setVolunteers(res.data);
      // Set initial checkbox state to false
      const initSelected = new Set();
      res.data.forEach(vol => {
        initSelected.add(vol.id);
      });
      setSelectedVolunteers(initSelected);
      setLoading(false);
    })
    .catch(err => console.error("Error fetching volunteers", err));
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
      const allIds = filteredVolunteers.map(v => v.id);
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
    const selectedVolunteersList = volunteers.filter(v => selectedVolunteers.has(v.id));
    const selectedEmails = selectedVolunteersList.map(v => v.email);
    
    // Replace this with your actual email sending logic
    console.log('Sending email to:', selectedEmails);
    alert(`Email would be sent to ${selectedEmails.length} volunteers`);
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? volunteer.volunteeringRole === roleFilter : true;
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

  const handleEdit = (volunteerId) => {
    // Implement edit functionality
    console.log('Edit volunteer:', volunteerId);
  };

  const handleDelete = async (volunteerId) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      try {
        // Replace with your actual API call
        await fetch(`/api/volunteers/${volunteerId}`, { method: 'DELETE' });
        fetchVolunteers();
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
                <tr key={volunteer.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.has(volunteer.id)}
                      onChange={() => handleSelectVolunteer(volunteer.id)}
                    />
                  </td>
                  <td>{volunteer.name}</td>
                  <td>{volunteer.email}</td>
                  <td>{volunteer.volunteeringRole}</td>
                  <td>
                    <div className="volunteer-actions">
                      <button
                        className="action-button view-button"
                        onClick={() => handleView(volunteer)}
                      >
                        View
                      </button>
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEdit(volunteer.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDelete(volunteer.id)}
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="volunteer-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Volunteer Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div>
              <p><strong>Name:</strong> {selectedVolunteer.name}</p>
              <p><strong>Email:</strong> {selectedVolunteer.email}</p>
              <p><strong>Phone:</strong> {selectedVolunteer.phoneNumber}</p>
              <p><strong>Role:</strong> {selectedVolunteer.volunteeringRole}</p>
              <p><strong>Description:</strong> {selectedVolunteer.description_paragraph}</p>
              <p><strong>Availabilities:</strong></p>
              <ul>
                {selectedVolunteer.availabilities.map(date => (
                  <li key={date}>{new Date(date).toLocaleDateString()}</li>
                ))}
              </ul>
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