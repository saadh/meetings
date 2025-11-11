import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    loadMeetings();
  }, [statusFilter]);

  const loadMeetings = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/meetings?page=${page}&status=${statusFilter}`);
      setMeetings(res.data.meetings);
      setPagination({ currentPage: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>All Meeting Requests</h1>

      <div className="form-group" style={{ marginTop: '30px' }}>
        <label>Filter by Status:</label>
        <select className="form-control" style={{ maxWidth: '300px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading meetings...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>From</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>To</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Duration</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map(meeting => (
                  <tr key={meeting._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      {meeting.sender?.firstName} {meeting.sender?.lastName}
                      <br />
                      <small style={{ color: '#666' }}>{meeting.sender?.email}</small>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {meeting.recipient?.firstName} {meeting.recipient?.lastName}
                      <br />
                      <small style={{ color: '#666' }}>{meeting.recipient?.email}</small>
                    </td>
                    <td style={{ padding: '12px' }}>{meeting.meetingType.replace(/-/g, ' ')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{meeting.duration} min</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`status-badge status-${meeting.status}`}>{meeting.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(meeting.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
              <button className="btn btn-secondary" disabled={pagination.currentPage === 1} onClick={() => loadMeetings(pagination.currentPage - 1)}>Previous</button>
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button className="btn btn-secondary" disabled={pagination.currentPage === pagination.totalPages} onClick={() => loadMeetings(pagination.currentPage + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminMeetings;
