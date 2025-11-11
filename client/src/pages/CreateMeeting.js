import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './CreateMeeting.css';

function CreateMeeting() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    duration: 30,
    customDuration: '',
    meetingType: 'startup-advice',
    purpose: '',
    meetingFormat: 'online',
    proposedDates: [{ date: '', time: '' }],
    location: {
      address: '',
      city: '',
      country: ''
    },
    compensation: {
      type: 'none',
      monetaryOffer: {
        requestFee: 0,
        tip: 0,
        meetingFee: 0,
        maxAmount: 0,
        currency: 'USD'
      },
      inKindOffer: {
        description: '',
        estimatedValue: ''
      }
    }
  });

  const meetingTypes = [
    { value: 'paid-consulting', label: 'Paid Consulting' },
    { value: 'pro-bono', label: 'Pro Bono' },
    { value: 'startup-advice', label: 'Startup Advice' },
    { value: 'soundboard', label: 'Soundboard' },
    { value: 'investor-pitch', label: 'Investor Pitch' },
    { value: 'emotional-support', label: 'Emotional Support' },
    { value: 'dating', label: 'Dating' },
    { value: 'expert-advice', label: 'Expert Advice' },
    { value: 'skills-training', label: 'Skills Training' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadRecipient();
  }, [userId]);

  const loadRecipient = async () => {
    try {
      const res = await api.get(`/users/${userId}/stats`);
      // We need to get the full user data, let's search for them
      const userRes = await api.get(`/search/users?q=${userId}`);
      if (userRes.data.users.length > 0) {
        setRecipient(userRes.data.users.find(u => u._id === userId));
      }
    } catch (error) {
      toast.error('Error loading user information');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompensationChange = (field, value) => {
    setFormData({
      ...formData,
      compensation: {
        ...formData.compensation,
        [field]: value
      }
    });
  };

  const handleMonetaryChange = (field, value) => {
    setFormData({
      ...formData,
      compensation: {
        ...formData.compensation,
        monetaryOffer: {
          ...formData.compensation.monetaryOffer,
          [field]: parseFloat(value) || 0
        }
      }
    });
  };

  const handleInKindChange = (field, value) => {
    setFormData({
      ...formData,
      compensation: {
        ...formData.compensation,
        inKindOffer: {
          ...formData.compensation.inKindOffer,
          [field]: value
        }
      }
    });
  };

  const addProposedDate = () => {
    setFormData({
      ...formData,
      proposedDates: [...formData.proposedDates, { date: '', time: '' }]
    });
  };

  const updateProposedDate = (index, field, value) => {
    const newDates = [...formData.proposedDates];
    newDates[index][field] = value;
    setFormData({ ...formData, proposedDates: newDates });
  };

  const removeProposedDate = (index) => {
    const newDates = formData.proposedDates.filter((_, i) => i !== index);
    setFormData({ ...formData, proposedDates: newDates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.purpose.trim()) {
      toast.error('Please provide a purpose for the meeting');
      return;
    }

    if (formData.purpose.length < 20) {
      toast.error('Please provide more details about the meeting purpose (at least 20 characters)');
      return;
    }

    setSubmitting(true);

    try {
      const finalDuration = formData.duration === 'custom'
        ? parseInt(formData.customDuration)
        : formData.duration;

      const requestData = {
        recipientId: userId,
        duration: finalDuration,
        meetingType: formData.meetingType,
        purpose: formData.purpose,
        meetingFormat: formData.meetingFormat,
        proposedDates: formData.proposedDates.filter(d => d.date && d.time),
        location: formData.meetingFormat === 'in-person' ? formData.location : undefined,
        compensation: formData.compensation
      };

      await api.post('/meetings', requestData);
      toast.success('Meeting request sent successfully!');
      navigate('/meetings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send meeting request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!recipient) return <div className="container">User not found</div>;

  return (
    <div className="create-meeting-page">
      <div className="container">
        <div className="meeting-header">
          <h1>Request Meeting with {recipient.firstName} {recipient.lastName}</h1>
          {recipient.company?.name && (
            <p className="recipient-company">{recipient.company.position} at {recipient.company.name}</p>
          )}
        </div>

        <div className="meeting-form-container">
          <form onSubmit={handleSubmit} className="meeting-form">
            {/* Duration */}
            <div className="form-section">
              <h3>Meeting Duration</h3>
              <div className="duration-options">
                <label className={`duration-option ${formData.duration === 5 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="5"
                    checked={formData.duration === 5}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                  5 minutes
                </label>
                <label className={`duration-option ${formData.duration === 15 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="15"
                    checked={formData.duration === 15}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                  15 minutes
                </label>
                <label className={`duration-option ${formData.duration === 30 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="30"
                    checked={formData.duration === 30}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                  30 minutes
                </label>
                <label className={`duration-option ${formData.duration === 60 ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="60"
                    checked={formData.duration === 60}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                  1 hour
                </label>
                <label className={`duration-option ${formData.duration === 'custom' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="duration"
                    value="custom"
                    checked={formData.duration === 'custom'}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                  Custom
                </label>
              </div>
              {formData.duration === 'custom' && (
                <div className="form-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter duration in minutes"
                    value={formData.customDuration}
                    onChange={(e) => setFormData({ ...formData, customDuration: e.target.value })}
                    min="5"
                    max="300"
                  />
                </div>
              )}
            </div>

            {/* Meeting Type */}
            <div className="form-section">
              <h3>Meeting Type</h3>
              <div className="form-group">
                <select
                  name="meetingType"
                  className="form-control"
                  value={formData.meetingType}
                  onChange={handleChange}
                  required
                >
                  {meetingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div className="form-section">
              <h3>Purpose of Meeting</h3>
              <div className="form-group">
                <textarea
                  className="form-control"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Describe the exact purpose of this meeting in 2-3 sentences..."
                  rows="4"
                  required
                />
                <small className="char-count">{formData.purpose.length}/500 characters</small>
              </div>
            </div>

            {/* Meeting Format */}
            <div className="form-section">
              <h3>Meeting Format</h3>
              <div className="format-options">
                <label className={`format-option ${formData.meetingFormat === 'online' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="meetingFormat"
                    value="online"
                    checked={formData.meetingFormat === 'online'}
                    onChange={handleChange}
                  />
                  Online (Zoom)
                </label>
                <label className={`format-option ${formData.meetingFormat === 'in-person' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="meetingFormat"
                    value="in-person"
                    checked={formData.meetingFormat === 'in-person'}
                    onChange={handleChange}
                  />
                  In-Person
                </label>
              </div>

              {formData.meetingFormat === 'in-person' && (
                <div className="location-fields">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, country: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Proposed Dates */}
            <div className="form-section">
              <h3>Proposed Dates & Times</h3>
              {formData.proposedDates.map((proposedDate, index) => (
                <div key={index} className="proposed-date-row">
                  <input
                    type="date"
                    className="form-control"
                    value={proposedDate.date}
                    onChange={(e) => updateProposedDate(index, 'date', e.target.value)}
                  />
                  <input
                    type="time"
                    className="form-control"
                    value={proposedDate.time}
                    onChange={(e) => updateProposedDate(index, 'time', e.target.value)}
                  />
                  {formData.proposedDates.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeProposedDate(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addProposedDate}>
                + Add Another Date Option
              </button>
            </div>

            {/* Compensation */}
            <div className="form-section">
              <h3>Compensation (Optional)</h3>
              <div className="compensation-type">
                <label>
                  <input
                    type="radio"
                    name="compensationType"
                    value="none"
                    checked={formData.compensation.type === 'none'}
                    onChange={(e) => handleCompensationChange('type', e.target.value)}
                  />
                  No Compensation
                </label>
                <label>
                  <input
                    type="radio"
                    name="compensationType"
                    value="monetary"
                    checked={formData.compensation.type === 'monetary'}
                    onChange={(e) => handleCompensationChange('type', e.target.value)}
                  />
                  Monetary
                </label>
                <label>
                  <input
                    type="radio"
                    name="compensationType"
                    value="in-kind"
                    checked={formData.compensation.type === 'in-kind'}
                    onChange={(e) => handleCompensationChange('type', e.target.value)}
                  />
                  In-Kind
                </label>
              </div>

              {formData.compensation.type === 'monetary' && (
                <div className="monetary-fields">
                  {recipient.pricing?.requestFee?.amount > 0 && (
                    <div className="form-group">
                      <label>Request Fee (Required by recipient)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={recipient.pricing.requestFee.amount}
                        disabled
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Tip (to increase acceptance chances)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.compensation.monetaryOffer.tip}
                      onChange={(e) => handleMonetaryChange('tip', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Maximum You're Willing to Pay</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.compensation.monetaryOffer.maxAmount}
                      onChange={(e) => handleMonetaryChange('maxAmount', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {formData.compensation.type === 'in-kind' && (
                <div className="in-kind-fields">
                  <div className="form-group">
                    <label>What are you offering?</label>
                    <textarea
                      className="form-control"
                      value={formData.compensation.inKindOffer.description}
                      onChange={(e) => handleInKindChange('description', e.target.value)}
                      placeholder="e.g., 3 hours of free consulting, website design for your company, etc."
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estimated Value</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.compensation.inKindOffer.estimatedValue}
                      onChange={(e) => handleInKindChange('estimatedValue', e.target.value)}
                      placeholder="e.g., $500, 5 hours, etc."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Sending Request...' : 'Send Meeting Request'}
              </button>
            </div>
          </form>

          <div className="recipient-info-sidebar">
            <div className="card">
              <h3>Meeting With</h3>
              <div className="recipient-details">
                {recipient.profileImage ? (
                  <img src={recipient.profileImage} alt={recipient.firstName} className="recipient-avatar" />
                ) : (
                  <div className="recipient-avatar-placeholder">
                    {recipient.firstName[0]}{recipient.lastName[0]}
                  </div>
                )}
                <h4>{recipient.firstName} {recipient.lastName}</h4>
                {recipient.company?.name && (
                  <p>{recipient.company.position} at {recipient.company.name}</p>
                )}
                <p className="recipient-bio">{recipient.bio}</p>

                {recipient.pricing && (
                  <div className="pricing-info">
                    <h4>Pricing</h4>
                    {recipient.pricing.requestFee?.amount > 0 && (
                      <p>Request Fee: ${recipient.pricing.requestFee.amount}</p>
                    )}
                    {recipient.pricing.meetingRate !== 'free' && (
                      <p>Meeting Rate: ${recipient.pricing.rateAmount} per {recipient.pricing.meetingRate.replace('per-', '')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMeeting;
