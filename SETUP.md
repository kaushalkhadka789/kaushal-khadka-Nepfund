# Quick Setup Guide

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Backend Environment

Create a `.env` file in the `backend` folder with the following content:

```env
PORT=5000
MONGODB_URI=mongodb+srv://lordqshal_db_user:0Et9DAvWt6kHTGJ9@cluster0.crf46gj.mongodb.net/nepfund
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# SMTP Configuration for Email (Gmail)
SMTP_USER=kaushalkhadka789@gmail.com
SMTP_PASSWORD=iwej uyol qvzr szmu
```

## Step 3: Create Upload Directories

```bash
# In backend folder
mkdir -p uploads/images uploads/documents
```

## Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Step 5: Start Development Servers

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Creating Admin User

To create an admin user, you can either:
1. Manually update the user role in MongoDB to 'admin'
2. Use MongoDB Compass or any MongoDB client
3. Or add an admin creation endpoint (not included by default for security)

## Testing the Application

1. Register a new account
2. Create a campaign
3. Login as admin (if you've created one) to approve campaigns
4. Browse and donate to campaigns

## Notes

- All routes are protected except login/register and public campaign viewing
- Campaigns require admin approval before they appear on the homepage
- Payment integration needs actual API keys from payment providers (Khalti, eSewa, Stripe)

