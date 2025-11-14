# NepFund - Crowdfunding Platform for Nepal

A full-stack MERN application for crowdfunding local projects and causes in Nepal.

## Features

### User Features
- User registration & authentication (JWT)
- Profile management
- Browse campaigns by category
- Search and filter campaigns
- Donate securely (Khalti/eSewa/Stripe integration ready)
- Track campaign progress
- Comment and support campaigns

### Campaign Creator Features
- Create fundraising campaigns
- Upload images and supporting documents
- View donations and progress
- Post updates
- Manage campaigns

### Admin Features
- Verify & approve campaigns
- Manage users and campaigns
- Flag/remove fraudulent campaigns
- Analytics dashboard
- Generate reports

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads

### Frontend
- React 18
- Redux Toolkit + RTK Query
- React Router
- Tailwind CSS
- Vite

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://lordqshal_db_user:0Et9DAvWt6kHTGJ9@cluster0.crf46gj.mongodb.net/nepfund
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
ESEWA_MERCHANT_ID=your_esewa_merchant_id
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Create upload directories (if they don't exist):
```bash
mkdir -p uploads/images uploads/documents
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
Fund/
├── backend/
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Utility functions
│   ├── uploads/         # Uploaded files
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── services/    # RTK Query API
    │   ├── store/       # Redux store
    │   ├── utils/       # Utility functions
    │   └── App.jsx      # Main App component
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Campaigns
- `GET /api/campaigns` - Get all campaigns (with filters)
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign (Protected)
- `PUT /api/campaigns/:id` - Update campaign (Protected)
- `DELETE /api/campaigns/:id` - Delete campaign (Protected)
- `GET /api/campaigns/my-campaigns` - Get user's campaigns (Protected)
- `POST /api/campaigns/:id/comments` - Add comment (Protected)
- `POST /api/campaigns/:id/updates` - Add update (Protected)

### Donations
- `POST /api/donations` - Create donation (Protected)
- `GET /api/donations/campaign/:campaignId` - Get campaign donations
- `GET /api/donations/my-donations` - Get user's donations (Protected)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)
- `GET /api/admin/campaigns/pending` - Get pending campaigns (Admin)
- `PUT /api/admin/campaigns/:id/approve` - Approve campaign (Admin)
- `PUT /api/admin/campaigns/:id/reject` - Reject campaign (Admin)
- `GET /api/admin/users` - Get all users (Admin)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)

## Campaign Categories

1. Medical & Health Emergency
2. Education Support
3. Natural Disaster Relief
4. Child Welfare
5. Women Empowerment
6. Animal Rescue & Shelter
7. Environmental Conservation
8. Rural Infrastructure Development
9. Startup & Innovation
10. Sports & Talent Support
11. Community Projects
12. Elderly Care & Support
13. Emergency Shelter / Housing
14. Social Cause / Awareness Campaigns
15. Memorial & Tribute Campaigns

## Payment Integration

The platform supports integration with:
- **Khalti** - Nepal's popular payment gateway
- **eSewa** - Another popular Nepali payment gateway
- **Stripe** - For international donations

Payment integration functions are in `backend/utils/payment.js`. You'll need to implement the actual API calls based on each gateway's documentation.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes (both frontend and backend)
- Admin-only routes
- File upload validation
- Input validation with express-validator

## Development Notes

- All routes are protected except authentication and public campaign browsing
- RTK Query handles all API calls with automatic caching
- Tailwind CSS is used for all styling (no regular CSS files)
- File uploads are stored in `backend/uploads/`
- Campaigns require admin approval before going live

## License

ISC

## Author

NepFund Development Team

