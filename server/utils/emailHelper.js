const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send meeting request notification
 */
async function sendMeetingRequestEmail(recipient, sender, meetingDetails) {
  try {
    if (!process.env.EMAIL_USER) {
      console.warn('Email configuration not set. Skipping email notification.');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient.email,
      subject: `New Meeting Request from ${sender.firstName} ${sender.lastName}`,
      html: `
        <h2>New Meeting Request</h2>
        <p>You have received a new meeting request from <strong>${sender.firstName} ${sender.lastName}</strong>.</p>

        <h3>Meeting Details:</h3>
        <ul>
          <li><strong>Type:</strong> ${meetingDetails.meetingType}</li>
          <li><strong>Duration:</strong> ${meetingDetails.duration} minutes</li>
          <li><strong>Format:</strong> ${meetingDetails.meetingFormat}</li>
        </ul>

        <p><strong>Purpose:</strong></p>
        <p>${meetingDetails.purpose}</p>

        <p>Please log in to your account to respond to this request.</p>

        <p>
          <a href="${process.env.CLIENT_URL}/meetings/received"
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Request
          </a>
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Meeting request email sent successfully');
  } catch (error) {
    console.error('Error sending meeting request email:', error);
  }
}

/**
 * Send meeting accepted notification
 */
async function sendMeetingAcceptedEmail(sender, recipient, meetingDetails) {
  try {
    if (!process.env.EMAIL_USER) {
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sender.email,
      subject: `Meeting Request Accepted by ${recipient.firstName} ${recipient.lastName}`,
      html: `
        <h2>Meeting Request Accepted!</h2>
        <p><strong>${recipient.firstName} ${recipient.lastName}</strong> has accepted your meeting request.</p>

        <h3>Meeting Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(meetingDetails.scheduledDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${meetingDetails.scheduledTime}</li>
          <li><strong>Duration:</strong> ${meetingDetails.duration} minutes</li>
          <li><strong>Format:</strong> ${meetingDetails.meetingFormat}</li>
        </ul>

        ${meetingDetails.meetingLink ? `
          <p><strong>Meeting Link:</strong></p>
          <p><a href="${meetingDetails.meetingLink}">${meetingDetails.meetingLink}</a></p>
          ${meetingDetails.meetingPassword ? `<p><strong>Password:</strong> ${meetingDetails.meetingPassword}</p>` : ''}
        ` : ''}

        <p>
          <a href="${process.env.CLIENT_URL}/meetings/${meetingDetails._id}"
             style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Meeting Details
          </a>
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Meeting accepted email sent successfully');
  } catch (error) {
    console.error('Error sending meeting accepted email:', error);
  }
}

/**
 * Send meeting rejected notification
 */
async function sendMeetingRejectedEmail(sender, recipient, reason) {
  try {
    if (!process.env.EMAIL_USER) {
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sender.email,
      subject: `Meeting Request Update from ${recipient.firstName} ${recipient.lastName}`,
      html: `
        <h2>Meeting Request Update</h2>
        <p><strong>${recipient.firstName} ${recipient.lastName}</strong> has declined your meeting request.</p>

        ${reason ? `
          <p><strong>Reason:</strong></p>
          <p>${reason}</p>
        ` : ''}

        <p>Don't give up! You can try reaching out to other professionals on our platform.</p>

        <p>
          <a href="${process.env.CLIENT_URL}/search"
             style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Find Other Professionals
          </a>
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Meeting rejected email sent successfully');
  } catch (error) {
    console.error('Error sending meeting rejected email:', error);
  }
}

module.exports = {
  sendMeetingRequestEmail,
  sendMeetingAcceptedEmail,
  sendMeetingRejectedEmail
};
