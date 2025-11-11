import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Search.css';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      const res = await api.get('/users/interests');
      setInterests(res.data.interests.slice(0, 10));
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await api.get(`/search/users?q=${searchQuery}`);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByInterest = async (interest) => {
    setLoading(true);
    try {
      const res = await api.get(`/search/interest/${interest}`);
      setUsers(res.data.users);
      setSearchQuery(interest);
    } catch (error) {
      console.error('Interest search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <h1>Explore Professionals</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name, company, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="interests-section">
          <h3>Popular Interests</h3>
          <div className="interests-tags">
            {interests.map((interest, index) => (
              <button
                key={index}
                className="interest-tag"
                onClick={() => searchByInterest(interest.name)}
              >
                {interest.name} ({interest.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Searching...</div>
        ) : (
          <div className="users-grid">
            {users.map(user => (
              <div key={user._id} className="user-card">
                <div className="user-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.firstName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                  )}
                </div>
                <h3>{user.firstName} {user.lastName}</h3>
                {user.company?.name && (
                  <p className="user-company">{user.company.position} at {user.company.name}</p>
                )}
                <p className="user-bio">{user.bio || 'No bio available'}</p>
                <div className="user-interests">
                  {user.interests.slice(0, 3).map((interest, idx) => (
                    <span key={idx} className="interest-badge">{interest}</span>
                  ))}
                </div>
                <Link
                  to={`/profile/${user.publicMeetingLink}`}
                  className="btn btn-secondary btn-block"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && searchQuery && (
          <p className="no-results">No users found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
}

export default Search;
