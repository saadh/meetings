import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
  const { publicLink } = useParams();
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [publicLink]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/search/profile/${publicLink}`);
      setUser(res.data.user);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="container">User not found</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card">
        <h1>{user.firstName} {user.lastName}</h1>
        <p>{user.bio}</p>
        {user.company?.name && <p><strong>Company:</strong> {user.company.name}</p>}
        {isAuthenticated && user.meetingPreferences?.acceptingRequests && (
          <Link to={`/meetings/create/${user._id}`} className="btn btn-primary">
            Request Meeting
          </Link>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
