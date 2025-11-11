import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './MeetingDetail.css';

function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  const [acceptData, setAcceptData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    message: ''
  });

  const [rejectData, setRejectData] = useState({
    rejectionReason: ''
  });

  const [modifyData, setModifyData] = useState({
    message: '',
    modifications: {
      duration: '',
      proposedDates: [{ date: '', time: '' }],
      compensationAmount: '',
      other: ''
    }
  });

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    try {
      const res = await api.get(`/meetings/${id}`);
      setMeeting(res.data.meeting);
    } catch (error) {
      toast.error('Failed to load meeting details');
      navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/meetings/${id}/accept`, acceptData);
      toast.success('Meeting request accepted!');
      loadMeeting();
      setShowAcceptModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept meeting');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/meetings/${id}/reject`, rejectData);
      toast.success('Meeting request rejected');
      loadMeeting();
      setShowRejectModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject meeting');
    }
  };

  const handleModify = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/meetings/${id}/modify`, modifyData);
      toast.success('Modifications sent to requester');
      loadMeeting();
      setShowModifyModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send modifications');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      await api.put(`/meetings/${id}/cancel`, {
        reason: 'Meeting cancelled'
      });
      toast.success('Meeting cancelled');
      loadMeeting();
    } catch (error) {
      toast.error('Failed to cancel meeting');
    }
  };

  const handleComplete = async () => {
    try {
      await api.put(`/meetings/${id}/complete`);
      toast.success('Meeting marked as completed');
      loadMeeting();
    } catch (error) {
      toast.error('Failed to mark meeting as completed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!meeting) return <div className="container">Meeting not found</div>;

  const isRecipient = meeting.recipient._id === user._id;
  const isSender = meeting.sender._id === user._id;
  const canAccept = isRecipient && meeting.status === 'pending';
  const canReject = isRecipient && meeting.status === 'pending';
  const canModify = isRecipient && meeting.status === 'pending';
  const canCancel = (isSender || isRecipient) && (meeting.status === 'pending' || meeting.status === 'accepted');
  const canComplete = (isSender || isRecipient) && meeting.status === 'accepted';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="meeting-detail-page">
      <div className="container">
        <button onClick={() => navigate('/meetings')} className="back-button">
          ← Back to Meetings
        </button>

        <div className="meeting-detail-container">
          <div className="meeting-detail-main">
            <div className="status-header">
              <h1>Meeting Request</h1>
              <span className={`status-badge status-${meeting.status}`}>
                {meeting.status}
              </span>
            </div>

            <div className="participants-section">
              <div className="participant">
                <h3>From</h3>
                <div className="participant-info">
                  {meeting.sender.profileImage ? (
                    <img src={meeting.sender.profileImage} alt={meeting.sender.firstName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {meeting.sender.firstName[0]}{meeting.sender.lastName[0]}
                    </div>
                  )}
                  <div>
                    <h4>{meeting.sender.firstName} {meeting.sender.lastName}</h4>
                    <p>{meeting.sender.email}</p>
                    {meeting.sender.company?.name && (
                      <p className="company">{meeting.sender.company.position} at {meeting.sender.company.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="participant">
                <h3>To</h3>
                <div className="participant-info">
                  {meeting.recipient.profileImage ? (
                    <img src={meeting.recipient.profileImage} alt={meeting.recipient.firstName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {meeting.recipient.firstName[0]}{meeting.recipient.lastName[0]}
                    </div>
                  )}
                  <div>
                    <h4>{meeting.recipient.firstName} {meeting.recipient.lastName}</h4>
                    <p>{meeting.recipient.email}</p>
                    {meeting.recipient.company?.name && (
                      <p className="company">{meeting.recipient.company.position} at {meeting.recipient.company.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="meeting-info-grid">
              <div className="info-item">
                <strong>Meeting Type</strong>
                <p>{meeting.meetingType.replace(/-/g, ' ')}</p>
              </div>
              <div className="info-item">
                <strong>Duration</strong>
                <p>{meeting.duration} minutes</p>
              </div>
              <div className="info-item">
                <strong>Format</strong>
                <p>{meeting.meetingFormat}</p>
              </div>
              <div className="info-item">
                <strong>Requested On</strong>
                <p>{formatDate(meeting.createdAt)}</p>
              </div>
            </div>

            <div className="purpose-section">
              <h3>Purpose</h3>
              <p>{meeting.purpose}</p>
            </div>

            {meeting.proposedDates && meeting.proposedDates.length > 0 && (
              <div className="proposed-dates-section">
                <h3>Proposed Dates</h3>
                <ul>
                  {meeting.proposedDates.map((pd, idx) => (
                    <li key={idx}>
                      {pd.date && formatDate(pd.date)} at {pd.time}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.scheduledDate && (
              <div className="scheduled-section">
                <h3>Scheduled Meeting</h3>
                <p className="scheduled-time">
                  {formatDate(meeting.scheduledDate)} at {meeting.scheduledTime}
                </p>
                {meeting.meetingLink && (
                  <div className="meeting-link-box">
                    <strong>Zoom Meeting Link:</strong>
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                      {meeting.meetingLink}
                    </a>
                    {meeting.meetingPassword && (
                      <p><strong>Password:</strong> {meeting.meetingPassword}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {meeting.compensation.type !== 'none' && (
              <div className="compensation-section">
                <h3>Compensation</h3>
                {meeting.compensation.type === 'monetary' ? (
                  <div>
                    <p><strong>Type:</strong> Monetary</p>
                    {meeting.compensation.monetaryOffer.requestFee > 0 && (
                      <p><strong>Request Fee:</strong> ${meeting.compensation.monetaryOffer.requestFee}</p>
                    )}
                    {meeting.compensation.monetaryOffer.tip > 0 && (
                      <p><strong>Tip:</strong> ${meeting.compensation.monetaryOffer.tip}</p>
                    )}
                    {meeting.compensation.monetaryOffer.meetingFee > 0 && (
                      <p><strong>Meeting Fee:</strong> ${meeting.compensation.monetaryOffer.meetingFee}</p>
                    )}
                    <p><strong>Total:</strong> ${meeting.totalCompensation}</p>
                  </div>
                ) : (
                  <div>
                    <p><strong>Type:</strong> In-Kind</p>
                    <p><strong>Offering:</strong> {meeting.compensation.inKindOffer.description}</p>
                    <p><strong>Estimated Value:</strong> {meeting.compensation.inKindOffer.estimatedValue}</p>
                  </div>
                )}
              </div>
            )}

            {meeting.response && (
              <div className="response-section">
                <h3>Response</h3>
                <p>{meeting.response.message}</p>
                {meeting.response.respondedAt && (
                  <p className="responded-at">Responded on: {formatDate(meeting.response.respondedAt)}</p>
                )}
              </div>
            )}

            {meeting.rejectionReason && (
              <div className="rejection-section">
                <h3>Rejection Reason</h3>
                <p>{meeting.rejectionReason}</p>
              </div>
            )}
          </div>

          <div className="meeting-actions-sidebar">
            <div className="card">
              <h3>Actions</h3>
              <div className="action-buttons">
                {canAccept && (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => setShowAcceptModal(true)}
                  >
                    Accept Meeting
                  </button>
                )}
                {canModify && (
                  <button
                    className="btn btn-secondary btn-block"
                    onClick={() => setShowModifyModal(true)}
                  >
                    Accept with Modifications
                  </button>
                )}
                {canReject && (
                  <button
                    className="btn btn-danger btn-block"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Reject Meeting
                  </button>
                )}
                {canCancel && (
                  <button
                    className="btn btn-danger btn-block"
                    onClick={handleCancel}
                  >
                    Cancel Meeting
                  </button>
                )}
                {canComplete && (
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleComplete}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Accept Modal */}
        {showAcceptModal && (
          <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Accept Meeting Request</h2>
              <form onSubmit={handleAccept}>
                <div className="form-group">
                  <label>Select Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={acceptData.scheduledDate}
                    onChange={(e) => setAcceptData({ ...acceptData, scheduledDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Select Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={acceptData.scheduledTime}
                    onChange={(e) => setAcceptData({ ...acceptData, scheduledTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Message (Optional)</label>
                  <textarea
                    className="form-control"
                    value={acceptData.message}
                    onChange={(e) => setAcceptData({ ...acceptData, message: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAcceptModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm Accept
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reject Meeting Request</h2>
              <form onSubmit={handleReject}>
                <div className="form-group">
                  <label>Reason for Rejection</label>
                  <textarea
                    className="form-control"
                    value={rejectData.rejectionReason}
                    onChange={(e) => setRejectData({ ...rejectData, rejectionReason: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Confirm Reject
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modify Modal */}
        {showModifyModal && (
          <div className="modal-overlay" onClick={() => setShowModifyModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Accept with Modifications</h2>
              <form onSubmit={handleModify}>
                <div className="form-group">
                  <label>Message to Sender</label>
                  <textarea
                    className="form-control"
                    value={modifyData.message}
                    onChange={(e) => setModifyData({ ...modifyData, message: e.target.value })}
                    placeholder="Explain what you'd like to modify..."
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Suggested Changes (Optional)</label>
                  <textarea
                    className="form-control"
                    value={modifyData.modifications.other}
                    onChange={(e) => setModifyData({
                      ...modifyData,
                      modifications: { ...modifyData.modifications, other: e.target.value }
                    })}
                    placeholder="e.g., Different time, location, duration, etc."
                    rows="4"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModifyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingDetail;
