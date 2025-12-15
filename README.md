# Zeta - Science Platform

A complete full-stack science education platform with quiz system, research papers, YouTube channels, and apps management.

## Features

- 🔐 User Authentication (Login, Signup, Password Reset)
- 📝 Daily & Competitive Quiz System
- 📚 Research Papers Management
- 🎥 YouTube Channels Directory
- 📱 Apps Showcase
- 👨‍💼 Admin Dashboard
- 🌓 Dark/Light Theme
- 📊 User Progress Tracking

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive Design
- Modern UI/UX

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- bcrypt for password hashing

**External Services:**
- Firebase (for PDF storage)
- Vercel (for frontend deployment)

## Project Structure

```
zeta/
├── frontend/
│   ├── login.html
│   ├── index.html
│   ├── style.css
│   ├── login.js
│   ├── app.js
│   └── admin.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── models/
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   └── Content.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── quiz.js
│   │   ├── papers.js
│   │   ├── channels.js
│   │   ├── apps.js
│   │   ├── help.js
│   │   └── admin.js
│   └── middleware/
│       └── auth.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Firebase account (for PDF hosting)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

4. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Update API_URL in all JS files:
- `login.js`
- `app.js`
- `admin.js`

Change `http://localhost:5000/api` to your backend URL.

3. Open `login.html` in a browser or deploy to Vercel.

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### Firebase Setup (for PDFs)

1. Create a Firebase project at https://console.firebase.google.com
2. Go to Storage
3. Upload your PDF files
4. Get the download URLs
5. Use these URLs when adding papers/help in the admin dashboard

### Vercel Deployment (Frontend)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Follow the prompts and your site will be live!

## Admin Access

To access admin features, use the following credentials:
- **Email:** admin@zeta.com
- **Password:** (set during signup)

The admin account must be created with exactly this email address.

## Usage Guide

### For Users:

1. **Signup/Login:** Create an account or login with existing credentials
2. **Daily Quiz:** Answer one question per day
3. **Competitive Quiz:** Select topics and answer multiple questions
4. **Research Papers:** Browse and read scientific papers
5. **YouTube Channels:** Explore educational channels
6. **Apps:** Download educational applications
7. **Account Settings:** Update password, view help, or delete account

### For Admins:

1. **Login** with admin@zeta.com
2. **Admin Dashboard** button appears in header
3. **Manage Content:**
   - Add/Edit/Delete daily quizzes
   - Create topics and add questions
   - Upload research papers
   - Add YouTube channels
   - Add apps with download links
   - Set help documentation

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/security-question` - Get security question
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/update-password` - Update password (authenticated)
- `DELETE /api/auth/delete-account` - Delete account (authenticated)

### Quiz
- `GET /api/quiz/daily` - Get daily quiz
- `GET /api/quiz/topics` - Get all topics
- `GET /api/quiz/topic/:topicId` - Get topic with questions
- `POST /api/quiz/answer` - Submit quiz answer
- `GET /api/quiz/user-answer` - Get user's answer

### Content
- `GET /api/papers` - Get all papers
- `GET /api/papers/search` - Search papers
- `GET /api/channels` - Get all channels
- `GET /api/apps` - Get all apps
- `GET /api/help` - Get help document

### Admin (requires admin authentication)
- Daily Quiz: POST, PUT, DELETE `/api/admin/quiz/daily`
- Topics: POST, DELETE `/api/admin/quiz/topic`
- Questions: POST, PUT, DELETE `/api/admin/quiz/topic/:topicId/question`
- Papers: POST, PUT, DELETE `/api/admin/papers`
- Channels: POST, PUT, DELETE `/api/admin/channels`
- Apps: POST, PUT, DELETE `/api/admin/apps`
- Help: POST, PUT, DELETE `/api/admin/help`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Security question for password recovery
- Admin-only routes protection
- Input validation
- CORS enabled

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues and questions, please create an issue in the repository.

## Future Enhancements

- Email verification
- Social media login
- Quiz leaderboards
- Certificate generation
- Mobile app version
- Advanced analytics
- Content recommendations
- Multi-language support

---

**Built with ❤️ for Science Education**