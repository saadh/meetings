import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card">
        <h1>My Profile</h1>
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Public Link:</strong> {user?.publicMeetingLink}</p>
        <Link to="/edit-profile" className="btn btn-primary">Edit Profile</Link>
      </div>
    </div>
  );
}

export default Profile;
