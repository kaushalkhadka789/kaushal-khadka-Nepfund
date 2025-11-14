# Backend Scripts

This folder contains utility scripts for managing the NepFund application.

## Available Scripts

### makeAdmin.js

Makes a user an admin by updating their role in the database.

**Usage:**
```bash
node scripts/makeAdmin.js <email>
```

**Example:**
```bash
node scripts/makeAdmin.js lamine10@gmail.com
```

**What it does:**
- Connects to the MongoDB database
- Finds the user by email
- Updates their role to 'admin'
- Displays confirmation message

**Requirements:**
- MongoDB connection must be configured in `.env`
- User with the specified email must exist in the database

## Creating New Scripts

When creating new utility scripts:
1. Place them in this `scripts` folder
2. Import necessary models and dependencies
3. Use proper error handling
4. Add documentation to this README
5. Use ES6 module syntax (import/export)
