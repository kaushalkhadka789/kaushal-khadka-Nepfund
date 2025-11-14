# Reward Points Persistence

## Overview
Reward points are stored in MongoDB and persist across server restarts. All reward data is stored in the database, not in memory.

## Storage Locations

1. **User.rewardPoints** - Stored in the `User` collection in MongoDB
   - Field: `rewardPoints` (Number, default: 0)
   - Updated automatically after each donation
   - Persists across server restarts

2. **RewardTransaction Collection** - Stores transaction history
   - Records each point earning event
   - Links to User, Campaign, and Donation
   - Persists all reward transactions

## How Points Are Updated

1. **On Donation** (`donation.controller.js`):
   - Points calculated: `1 point per NPR 10`
   - User.rewardPoints incremented atomically using `$inc`
   - RewardTransaction record created
   - All operations are database transactions

2. **On Bonus Points** (`reward.controller.js`):
   - Admin grants bonus points
   - User.rewardPoints incremented atomically
   - RewardTransaction record created with reason='bonus'

## Verification

To verify points are persisting:

1. Make a donation
2. Check MongoDB:
   ```javascript
   db.users.findOne({ email: "user@example.com" }, { rewardPoints: 1 })
   ```
3. Restart the server
4. Check the user's reward points again - they should be the same

## Migration Script

If reward points are missing for existing users, run:

```bash
node backend/scripts/recalculateRewardPoints.js
```

This script:
- Finds all users
- Calculates points from their donation history
- Updates User.rewardPoints in the database

## Troubleshooting

### Points showing as 0 after restart
- Check MongoDB connection
- Verify User.rewardPoints field exists in database
- Run the recalculation script if needed

### Points not updating after donation
- Check donation controller logs
- Verify RewardTransaction records are being created
- Check MongoDB for User.rewardPoints updates

### Transaction history missing
- Verify RewardTransaction collection exists
- Check that transactions are being created in donation controller
- Ensure no validation errors in RewardTransaction model

