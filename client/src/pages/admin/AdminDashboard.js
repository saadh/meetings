import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/statistics');
      setStats(res.data.statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>SuperAdmin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', margin: '30px 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '48px', color: '#4CAF50', marginBottom: '10px' }}>{stats?.users?.total || 0}</h2>
          <p>Total Users</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '48px', color: '#2196F3', marginBottom: '10px' }}>{stats?.users?.active || 0}</h2>
          <p>Active Users</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '48px', color: '#FF9800', marginBottom: '10px' }}>{stats?.meetings?.total || 0}</h2>
          <p>Total Meetings</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
          <h2 style={{ fontSize: '48px', color: '#9C27B0', marginBottom: '10px' }}>{stats?.meetings?.completed || 0}</h2>
          <p>Completed Meetings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div className="card">
          <h3>Meeting Status</h3>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Pending:</strong> {stats?.meetings?.pending || 0}</p>
            <p><strong>Accepted:</strong> {stats?.meetings?.accepted || 0}</p>
            <p><strong>Completed:</strong> {stats?.meetings?.completed || 0}</p>
          </div>
        </div>

        <div className="card">
          <h3>User Status</h3>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Active:</strong> {stats?.users?.active || 0}</p>
            <p><strong>Inactive:</strong> {stats?.users?.inactive || 0}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
        <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
        <Link to="/admin/meetings" className="btn btn-secondary">View All Meetings</Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
