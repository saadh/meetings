import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './MeetingRequests.css';

function MeetingRequests() {
  const [activeTab, setActiveTab] = useState('received');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    loadMeetings();
  }, [activeTab, statusFilter]);

  const loadMeetings = async (page = 1) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'received' ? '/meetings/received' : '/meetings/sent';
      const res = await api.get(`${endpoint}?status=${statusFilter}&page=${page}`);
      setMeetings(res.data.meetings);
      setPagination({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total
      });
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
      modified: 'status-modified',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return classes[status] || '';
  };

  return (
    <div className="meeting-requests-page">
      <div className="container">
        <h1>My Meeting Requests</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received Requests
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests
          </button>
        </div>

        <div className="filters">
          <label>Status:</label>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="modified">Modified</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading meetings...</div>
        ) : meetings.length > 0 ? (
          <>
            <div className="meetings-list">
              {meetings.map(meeting => {
                const otherPerson = activeTab === 'received' ? meeting.sender : meeting.recipient;

                return (
                  <div key={meeting._id} className="meeting-request-card">
                    <div className="meeting-header-row">
                      <div className="person-info">
                        {otherPerson.profileImage ? (
                          <img src={otherPerson.profileImage} alt={otherPerson.firstName} className="person-avatar" />
                        ) : (
                          <div className="person-avatar-placeholder">
                            {otherPerson.firstName[0]}{otherPerson.lastName[0]}
                          </div>
                        )}
                        <div>
                          <h3>
                            {activeTab === 'received' ? 'From: ' : 'To: '}
                            {otherPerson.firstName} {otherPerson.lastName}
                          </h3>
                          {otherPerson.company?.name && (
                            <p className="company">{otherPerson.company.position} at {otherPerson.company.name}</p>
                          )}
                        </div>
                      </div>
                      <span className={`status-badge ${getStatusClass(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>

                    <div className="meeting-details">
                      <div className="detail-item">
                        <strong>Type:</strong> {meeting.meetingType.replace(/-/g, ' ')}
                      </div>
                      <div className="detail-item">
                        <strong>Duration:</strong> {meeting.duration} minutes
                      </div>
                      <div className="detail-item">
                        <strong>Format:</strong> {meeting.meetingFormat}
                      </div>
                      <div className="detail-item">
                        <strong>Requested:</strong> {formatDate(meeting.createdAt)}
                      </div>
                    </div>

                    <div className="meeting-purpose">
                      <strong>Purpose:</strong>
                      <p>{meeting.purpose}</p>
                    </div>

                    {meeting.scheduledDate && (
                      <div className="scheduled-info">
                        <strong>Scheduled for:</strong> {formatDate(meeting.scheduledDate)} at {meeting.scheduledTime}
                      </div>
                    )}

                    {meeting.compensation.type !== 'none' && (
                      <div className="compensation-info">
                        <strong>Compensation:</strong>
                        {meeting.compensation.type === 'monetary' ? (
                          <span> ${meeting.totalCompensation} ({meeting.compensation.monetaryOffer.currency})</span>
                        ) : (
                          <span> {meeting.compensation.inKindOffer.description}</span>
                        )}
                      </div>
                    )}

                    <div className="meeting-actions">
                      <Link to={`/meetings/${meeting._id}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={pagination.currentPage === 1}
                  onClick={() => loadMeetings(pagination.currentPage - 1)}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => loadMeetings(pagination.currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-meetings">
            <p>No {statusFilter} meetings found.</p>
            {activeTab === 'sent' && (
              <Link to="/search" className="btn btn-primary">
                Find People to Meet
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingRequests;
