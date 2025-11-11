import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentMeetings, setRecentMeetings] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, meetingsRes] = await Promise.all([
        api.get(`/users/${user._id}/stats`),
        api.get('/meetings/my-requests?limit=5')
      ]);
      setStats(statsRes.data.stats);
      setRecentMeetings(meetingsRes.data.meetings);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Welcome back, {user?.firstName}!</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats?.requestsSent || 0}</h3>
            <p>Requests Sent</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.requestsReceived || 0}</h3>
            <p>Requests Received</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.acceptanceRate || 0}%</h3>
            <p>Acceptance Rate</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.totalMeetingsCompleted || 0}</h3>
            <p>Meetings Completed</p>
          </div>
        </div>

        <div className="quick-actions">
          <Link to="/search" className="btn btn-primary">Find People</Link>
          <Link to="/meetings" className="btn btn-secondary">View All Meetings</Link>
          <Link to="/edit-profile" className="btn btn-secondary">Edit Profile</Link>
        </div>

        <div className="recent-meetings">
          <h2>Recent Meeting Requests</h2>
          {recentMeetings.length > 0 ? (
            <div className="meetings-list">
              {recentMeetings.map(meeting => (
                <div key={meeting._id} className="meeting-card">
                  <div className="meeting-info">
                    <strong>
                      {meeting.sender._id === user._id
                        ? `To: ${meeting.recipient.firstName} ${meeting.recipient.lastName}`
                        : `From: ${meeting.sender.firstName} ${meeting.sender.lastName}`
                      }
                    </strong>
                    <p>{meeting.meetingType} - {meeting.duration} minutes</p>
                    <span className={`status-badge status-${meeting.status}`}>
                      {meeting.status}
                    </span>
                  </div>
                  <Link to={`/meetings/${meeting._id}`} className="btn btn-sm">View</Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No meeting requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
