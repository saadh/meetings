# Meetings Platform 🤝

A modern, comprehensive meetings booking platform designed to disrupt traditional networking by enabling direct, meaningful connections between professionals. Unlike outdated platforms like LinkedIn, this application facilitates actual face-to-face meetings with built-in scheduling, payments, and video conferencing.

## 🌟 Key Features

### User System
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Complete User Profiles**: Profile images, bio, description, interests, company info, social links
- **Public Meeting Links**: Each user gets a shareable public link

### Meeting Management
- **Flexible Meeting Requests**: Multiple types (consulting, advice, dating, etc.), custom durations
- **Smart Request Handling**: Accept, Reject, or Accept with Modifications
- **Availability Control**: Set limits per week/month, toggle on/off for requests
- **Automatic Zoom Integration**: Online meetings get automatic Zoom links

### Compensation & Payments
- **Flexible Options**: Request fees, meeting fees, tips, or in-kind compensation
- **Stripe Integration**: Secure payment processing

### Discovery & Search
- Search by name, company, or keywords
- Browse by interest groups or organizations
- Public profile pages

### Statistics & Analytics
- Requests sent/received
- Acceptance rates
- Meetings completed
- Payment history

### SuperAdmin System
- View, edit, or delete any user account
- Platform-wide statistics
- User management dashboard

## 🏗️ Technology Stack

**Backend**: Node.js, Express, MongoDB, JWT, Stripe, Nodemailer, Zoom API
**Frontend**: React 18, React Router, Context API, Axios, Stripe Elements

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (v4.4+)
- Stripe account
- Zoom account (optional)
- Email account for SMTP

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Run Application

```bash
# Development (both frontend + backend)
npm run dev:full
```

Visit http://localhost:3000

## 📁 Project Structure

```
meetings-platform/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # Navbar, Routes
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # All pages
│   │   └── utils/          # API config
│   └── package.json
├── server/                  # Express backend
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── utils/             # Helpers
├── uploads/               # File uploads
├── .env                   # Environment config
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile/me` - Get profile
- `PUT /api/profile/me` - Update profile
- `POST /api/profile/upload-image` - Upload image
- `PUT /api/profile/preferences` - Update preferences

### Search
- `GET /api/search/users?q=query` - Search users
- `GET /api/search/interest/:interest` - By interest
- `GET /api/search/organization/:org` - By organization

### Meetings
- `POST /api/meetings` - Create request
- `GET /api/meetings/received` - Received requests
- `GET /api/meetings/sent` - Sent requests
- `PUT /api/meetings/:id/accept` - Accept
- `PUT /api/meetings/:id/reject` - Reject
- `PUT /api/meetings/:id/modify` - Modify

### Admin
- `GET /api/admin/users` - All users
- `GET /api/admin/statistics` - Platform stats
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation
- Rate limiting
- Helmet.js security headers
- CORS protection
- File upload validation

## 💳 Payment Setup

1. Create Stripe account at stripe.com
2. Copy API keys to .env
3. Test with card: 4242 4242 4242 4242

## 📧 Email Notifications

Configure in .env:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Gmail users: Enable 2FA and use App Password

## 🎥 Zoom Integration

1. Create Zoom OAuth app
2. Add credentials to .env
3. Grant meeting:write scope

## 👤 User Roles

**Regular User**: Full meeting management
**SuperAdmin**: Platform management + all user features

Default SuperAdmin (CHANGE IN PRODUCTION):
- Email: admin@meetings.com
- Password: SuperAdmin123!

## 🐛 Troubleshooting

**MongoDB not connecting?**
```bash
sudo systemctl status mongod
```

**Port 5000 in use?**
```bash
lsof -i :5000
kill -9 [PID]
```

**Module errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment Checklist

- [ ] Change JWT_SECRET
- [ ] Update SuperAdmin credentials
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up Stripe live keys
- [ ] Enable HTTPS
- [ ] Configure CORS for production
- [ ] Set up monitoring

## 📝 Environment Variables

Required in .env:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meetings-platform
JWT_SECRET=your_secret_key
SUPERADMIN_EMAIL=admin@meetings.com
SUPERADMIN_PASSWORD=SuperAdmin123!
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

## 🎯 Features Implemented

✅ Complete authentication system
✅ User profiles with images
✅ Meeting request system
✅ Accept/Reject/Modify workflows
✅ Payment integration (Stripe)
✅ Search and discovery
✅ Statistics tracking
✅ SuperAdmin dashboard
✅ Email notifications
✅ Zoom integration
✅ Meeting limits and availability
✅ Public profile links
✅ In-kind compensation option

## 🔮 Future Enhancements

- Calendar integration
- Mobile app
- Video chat built-in
- Meeting templates
- Rating system
- AI-powered suggestions
- Team accounts
- Multi-language support

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and open PR

---

**Ready to build meaningful connections! 🚀**
