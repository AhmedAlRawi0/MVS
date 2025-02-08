import React, { useState, useEffect } from 'react';
import '../styles/VolunteerList.css';  // We can reuse the same CSS
import { fetchApplications, approveApplication, rejectApplication} from '../services/api';

const API_BASE = "http://127.0.0.1:5000";  // Match your API_BASE from api.js

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const itemsPerPage = 10;

  const getApplications = async () => {
    try {
      const response = await fetchApplications();

      if (response.data && Array.isArray(response.data.applications)) {
        setApplications(response.data.applications);
      } else {
        console.error('Invalid response format:', response.data);
        setApplications([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      setApplications([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    getApplications();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleApprove = async (applicationId) => {
    try {
      const response = await approveApplication(applicationId);
      if (response.data.success) {
        getApplications();  // Refresh the list
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleReject = async (applicationId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        const response = await rejectApplication(applicationId);
        if (response.data.success) {
          getApplications();  // Refresh the list
        }
      } catch (error) {
        console.error('Error rejecting application:', error);
      }
    }
  };

  const handleView = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const getCvUrl = (volunteerId) => {
    return `${API_BASE}/cv/${volunteerId}`;
  };

  const filteredApplications = Array.isArray(applications) ? applications.filter(application => 
    application?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const pageCount = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="volunteer-empty">Loading...</div>;
  }

  return (
    <div className="volunteer-list-container">
      <div className="volunteer-list-header">
        <h1 className="volunteer-list-title">Pending Applications</h1>
      </div>

      <div className="volunteer-search">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {Array.isArray(paginatedApplications) && paginatedApplications.length > 0 ? (
        <>
          <table className="volunteer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>CV</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map(application => (
                <tr key={application._id}>
                  <td>{application.name}</td>
                  <td>{application.email}</td>
                  <td>{application.phone_number || 'N/A'}</td>
                  <td>
                    {application.cv ? (
                      <a 
                        href={getCvUrl(application._id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="action-button"
                      >
                        View CV
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <div className="volunteer-actions">
                      <button
                        className="action-button view-button"
                        onClick={() => handleView(application)}
                      >
                        View
                      </button>
                      <button
                        className="action-button approve-button"
                        onClick={() => handleApprove(application._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleReject(application._id)}
                      >
                        Reject
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
        <div className="volunteer-empty">No pending applications found</div>
      )}

      {showModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{selectedApplication.name}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{selectedApplication.email}</div>
              </div>    
              <div className="detail-row">
                <div className="detail-label">Phone:</div>
                <div className="detail-value">{selectedApplication.phone_number || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Description:</div>
                <div className="detail-value">{selectedApplication.desc_paragraph || 'N/A'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Availabilities:</div>
                <div className="detail-value">{selectedApplication.availabilities || 'N/A'}</div>
              </div>
              {selectedApplication.cv && (
                <div className="detail-row">
                  <div className="detail-label">CV:</div>
                  <div className="detail-value">
                    <a 
                      href={getCvUrl(selectedApplication._id)}
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
                className="modal-button approve-button"
                onClick={() => {
                  handleApprove(selectedApplication._id);
                  setShowModal(false);
                }}
              >
                Approve
              </button>
              <button
                className="modal-button reject-button"
                onClick={() => {
                  handleReject(selectedApplication._id);
                  setShowModal(false);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationList; 