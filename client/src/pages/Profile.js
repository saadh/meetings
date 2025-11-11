import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>My Profile</h1>
          <Link to="/edit-profile" className="btn btn-primary">Edit Profile</Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.firstName} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', fontWeight: 'bold', margin: '0 auto' }}>
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Name:</strong> {user?.firstName} {user?.lastName}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <strong>Email:</strong> {user?.email}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <strong>Public Meeting Link:</strong> {window.location.origin}/profile/{user?.publicMeetingLink}
        </div>

        {user?.company?.name && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Company:</strong> {user.company.position} at {user.company.name}
          </div>
        )}

        {user?.bio && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Bio:</strong>
            <p>{user.bio}</p>
          </div>
        )}

        {user?.description && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Description:</strong>
            <p>{user.description}</p>
          </div>
        )}

        {user?.interests && user.interests.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Interests:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {user.interests.map((interest, idx) => (
                <span key={idx} style={{ padding: '6px 12px', backgroundColor: '#e8f5e9', borderRadius: '16px' }}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <h3>Meeting Preferences</h3>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Accepting Requests:</strong> {user?.meetingPreferences?.acceptingRequests ? 'Yes' : 'No'}</p>
            <p><strong>Meeting Format:</strong> {user?.meetingPreferences?.meetingFormat}</p>
            <p><strong>Max Meetings/Week:</strong> {user?.meetingLimits?.maxMeetingsPerWeek}</p>
            <p><strong>Max Meetings/Month:</strong> {user?.meetingLimits?.maxMeetingsPerMonth}</p>
          </div>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <h3>Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
            <div><strong>Requests Sent:</strong> {user?.statistics?.requestsSent || 0}</div>
            <div><strong>Requests Received:</strong> {user?.statistics?.requestsReceived || 0}</div>
            <div><strong>Acceptance Rate:</strong> {user?.acceptanceRate || 0}%</div>
            <div><strong>Meetings Completed:</strong> {user?.statistics?.totalMeetingsCompleted || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
