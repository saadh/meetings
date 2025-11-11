import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(\`/admin/users?page=\${page}&search=\${search}\`);
      setUsers(res.data.users);
      setPagination({ currentPage: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      await api.put(\`/admin/users/\${userId}/\${endpoint}\`);
      toast.success(\`User \${isActive ? 'deactivated' : 'activated'} successfully\`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await api.delete(\`/admin/users/\${userId}\`);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Manage Users</h1>

      <div className="form-group" style={{ marginTop: '30px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Company</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{user.firstName} {user.lastName}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>{user.company?.name || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', backgroundColor: user.isActive ? '#e8f5e9' : '#ffebee', color: user.isActive ? '#2e7d32' : '#c62828' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{user.role}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {user.role !== 'superadmin' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
              <button className="btn btn-secondary" disabled={pagination.currentPage === 1} onClick={() => loadUsers(pagination.currentPage - 1)}>Previous</button>
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <button className="btn btn-secondary" disabled={pagination.currentPage === pagination.totalPages} onClick={() => loadUsers(pagination.currentPage + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminUsers;
