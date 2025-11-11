import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    description: '',
    company: { name: '', position: '' },
    interests: [],
    socialLinks: { linkedin: '', twitter: '', website: '', github: '' },
    meetingPreferences: {
      acceptingRequests: true,
      meetingFormat: 'both',
      meetingTypes: [],
      location: { city: '', country: '' }
    },
    meetingLimits: {
      maxMeetingsPerWeek: 10,
      maxMeetingsPerMonth: 40,
      maxHoursPerWeek: 10,
      maxHoursPerMonth: 40
    },
    pricing: {
      requestFee: { amount: 0, currency: 'USD' },
      meetingRate: 'free',
      rateAmount: 0
    }
  });

  const [interestInput, setInterestInput] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        description: user.description || '',
        company: user.company || { name: '', position: '' },
        interests: user.interests || [],
        socialLinks: user.socialLinks || { linkedin: '', twitter: '', website: '', github: '' },
        meetingPreferences: user.meetingPreferences || { acceptingRequests: true, meetingFormat: 'both', meetingTypes: [], location: { city: '', country: '' } },
        meetingLimits: user.meetingLimits || { maxMeetingsPerWeek: 10, maxMeetingsPerMonth: 40, maxHoursPerWeek: 10, maxHoursPerMonth: 40 },
        pricing: user.pricing || { requestFee: { amount: 0, currency: 'USD' }, meetingRate: 'free', rateAmount: 0 }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompanyChange = (field, value) => {
    setFormData({ ...formData, company: { ...formData.company, [field]: value } });
  };

  const handleSocialChange = (field, value) => {
    setFormData({ ...formData, socialLinks: { ...formData.socialLinks, [field]: value } });
  };

  const handlePrefChange = (field, value) => {
    setFormData({ ...formData, meetingPreferences: { ...formData.meetingPreferences, [field]: value } });
  };

  const handleLimitChange = (field, value) => {
    setFormData({ ...formData, meetingLimits: { ...formData.meetingLimits, [field]: parseInt(value) || 0 } });
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, interestInput.trim()] });
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile image uploaded');
      updateUser({ profileImage: res.data.imageUrl });
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile/me', formData);
      const prefsRes = await api.put('/profile/preferences', {
        acceptingRequests: formData.meetingPreferences.acceptingRequests,
        meetingFormat: formData.meetingPreferences.meetingFormat,
        meetingTypes: formData.meetingPreferences.meetingTypes,
        location: formData.meetingPreferences.location,
        meetingLimits: formData.meetingLimits
      });
      const pricingRes = await api.put('/profile/pricing', formData.pricing);
      
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
      navigate('/my-profile');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const meetingTypeOptions = ['paid-consulting', 'pro-bono', 'startup-advice', 'soundboard', 'investor-pitch', 'emotional-support', 'dating', 'expert-advice', 'skills-training', 'troubleshooting'];

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="card">
        <h1>Edit Profile</h1>
        
        <form onSubmit={handleSubmit}>
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Profile Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Bio (max 500 characters)</label>
            <textarea name="bio" className="form-control" value={formData.bio} onChange={handleChange} maxLength={500} />
          </div>

          <div className="form-group">
            <label>Description (max 1000 characters)</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} maxLength={1000} rows="4" />
          </div>

          <h3 style={{ marginTop: '30px' }}>Company & Interests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Company</label>
              <input type="text" className="form-control" value={formData.company.name} onChange={(e) => handleCompanyChange('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Position</label>
              <input type="text" className="form-control" value={formData.company.position} onChange={(e) => handleCompanyChange('position', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Interests</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="text" className="form-control" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} placeholder="Add an interest" />
              <button type="button" className="btn btn-secondary" onClick={addInterest}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.interests.map((interest, idx) => (
                <span key={idx} style={{ padding: '6px 12px', backgroundColor: '#e8f5e9', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}>×</button>
                </span>
              ))}
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Social Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>LinkedIn</label>
              <input type="url" className="form-control" value={formData.socialLinks.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Twitter</label>
              <input type="url" className="form-control" value={formData.socialLinks.twitter} onChange={(e) => handleSocialChange('twitter', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="url" className="form-control" value={formData.socialLinks.website} onChange={(e) => handleSocialChange('website', e.target.value)} />
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input type="url" className="form-control" value={formData.socialLinks.github} onChange={(e) => handleSocialChange('github', e.target.value)} />
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Meeting Preferences</h3>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={formData.meetingPreferences.acceptingRequests} onChange={(e) => handlePrefChange('acceptingRequests', e.target.checked)} />
              Currently accepting meeting requests
            </label>
          </div>

          <div className="form-group">
            <label>Meeting Format</label>
            <select className="form-control" value={formData.meetingPreferences.meetingFormat} onChange={(e) => handlePrefChange('meetingFormat', e.target.value)}>
              <option value="online">Online Only</option>
              <option value="in-person">In-Person Only</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="form-group">
            <label>Meeting Types (select all that apply)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {meetingTypeOptions.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.meetingPreferences.meetingTypes.includes(type)}
                    onChange={(e) => {
                      const types = e.target.checked 
                        ? [...formData.meetingPreferences.meetingTypes, type]
                        : formData.meetingPreferences.meetingTypes.filter(t => t !== type);
                      handlePrefChange('meetingTypes', types);
                    }}
                  />
                  {type.replace(/-/g, ' ')}
                </label>
              ))}
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Meeting Limits</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Max Meetings Per Week</label>
              <input type="number" className="form-control" value={formData.meetingLimits.maxMeetingsPerWeek} onChange={(e) => handleLimitChange('maxMeetingsPerWeek', e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label>Max Meetings Per Month</label>
              <input type="number" className="form-control" value={formData.meetingLimits.maxMeetingsPerMonth} onChange={(e) => handleLimitChange('maxMeetingsPerMonth', e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label>Max Hours Per Week</label>
              <input type="number" className="form-control" value={formData.meetingLimits.maxHoursPerWeek} onChange={(e) => handleLimitChange('maxHoursPerWeek', e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label>Max Hours Per Month</label>
              <input type="number" className="form-control" value={formData.meetingLimits.maxHoursPerMonth} onChange={(e) => handleLimitChange('maxHoursPerMonth', e.target.value)} min="0" />
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Pricing</h3>
          <div className="form-group">
            <label>Request Fee Amount ($)</label>
            <input type="number" className="form-control" value={formData.pricing.requestFee.amount} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, requestFee: { ...formData.pricing.requestFee, amount: parseFloat(e.target.value) || 0 } } })} min="0" step="0.01" />
          </div>

          <div className="form-group">
            <label>Meeting Rate Type</label>
            <select className="form-control" value={formData.pricing.meetingRate} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, meetingRate: e.target.value } })}>
              <option value="free">Free</option>
              <option value="per-hour">Per Hour</option>
              <option value="per-minute">Per Minute</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {formData.pricing.meetingRate !== 'free' && (
            <div className="form-group">
              <label>Rate Amount ($)</label>
              <input type="number" className="form-control" value={formData.pricing.rateAmount} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, rateAmount: parseFloat(e.target.value) || 0 } })} min="0" step="0.01" />
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/my-profile')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
