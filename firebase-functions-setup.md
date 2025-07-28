# Firebase Cloud Functions Setup Guide

This document outlines the Firebase Cloud Functions setup for the Productivity Morning Routine app. These functions will be implemented in Phase 2: Backend Integration.

## Functions Structure

### 1. Authentication Triggers

```typescript
// functions/src/auth-triggers.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// User creation trigger - create user profile
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userData = {
    userId: user.uid,
    profile: {
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      timeZone: 'UTC', // Default, should be updated by client
      locale: 'en-US', // Default, should be updated by client
    },
    onboarding: {
      isCompleted: false,
    },
    routine: {
      wakeTime: '07:00',
      routineDuration: 30,
      selectedTasks: [],
    },
    settings: {
      notifications: {
        morningReminder: true,
        reminderTime: '06:30',
      },
      privacy: {
        analyticsOptIn: true,
        crashReportingOptIn: true,
      },
    },
    subscription: {
      status: 'none',
      isTrialUser: false,
      hasUsedTrial: false,
    },
    stats: {
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageCompletionScore: 0,
      totalDaysActive: 0,
      joinDate: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
      achievements: [],
    },
    metadata: {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      version: 1,
    },
  };

  return admin.firestore().collection('users').doc(user.uid).set(userData);
});

// User deletion trigger - cleanup user data (GDPR compliance)
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const batch = admin.firestore().batch();
  
  // Delete user profile
  batch.delete(admin.firestore().collection('users').doc(user.uid));
  
  // Delete user progress (subcollection requires recursive deletion)
  const progressRef = admin.firestore().collection('user_progress').doc(user.uid);
  batch.delete(progressRef);
  
  // Delete subscription data
  batch.delete(admin.firestore().collection('subscriptions').doc(user.uid));
  
  return batch.commit();
});
```

### 2. Daily Progress Functions

```typescript
// functions/src/progress-functions.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Calculate daily score based on task completion
export const calculateDailyScore = functions.firestore
  .document('user_progress/{userId}/daily_entries/{date}')
  .onWrite(async (change, context) => {
    const { userId, date } = context.params;
    
    if (!change.after.exists) return null; // Document deleted
    
    const progressData = change.after.data();
    const tasks = progressData.tasks || [];
    
    // Calculate completion score based on SCORING_CONFIG
    const taskWeights = {
      drink_water: 25,
      no_phone_usage: 25,
      sunlight_exposure: 25,
      elephant_task: 25,
    };
    
    let totalScore = 0;
    tasks.forEach((task: any) => {
      if (task.status === 'completed') {
        totalScore += taskWeights[task.taskId] || 0;
      }
    });
    
    // Update session completion percentage
    const updatedData = {
      'session.completionPercentage': totalScore,
      'session.isCompleted': totalScore >= 75, // Passing score threshold
      'metadata.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
    };
    
    return change.after.ref.update(updatedData);
  });

// Update user statistics when daily progress changes
export const updateUserStats = functions.firestore
  .document('user_progress/{userId}/daily_entries/{date}')
  .onWrite(async (change, context) => {
    const { userId } = context.params;
    
    if (!change.after.exists) return null;
    
    const progressData = change.after.data();
    
    // Get user document
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    const currentStats = userData.stats || {};
    
    // Calculate new statistics
    const isCompleted = progressData.session?.isCompleted || false;
    const completionScore = progressData.session?.completionPercentage || 0;
    
    const updatedStats = {
      ...currentStats,
      totalCompletions: isCompleted ? (currentStats.totalCompletions || 0) + 1 : currentStats.totalCompletions || 0,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    return userRef.update({ 'stats': updatedStats });
  });
```

### 3. Notification Functions

```typescript
// functions/src/notification-functions.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Schedule morning reminders (runs daily at 3 AM UTC)
export const scheduleMorningReminders = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('settings.notifications.morningReminder', '==', true)
      .where('subscription.status', 'in', ['active', 'trial'])
      .get();
    
    const notifications: Promise<any>[] = [];
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      const wakeTime = userData.routine?.wakeTime || '07:00';
      const timeZone = userData.profile?.timeZone || 'UTC';
      
      // Calculate reminder time (90 minutes after wake time)
      const reminderTime = calculateReminderTime(wakeTime, 90);
      
      // Schedule notification for today if it's a weekday
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
        notifications.push(scheduleNotification(doc.id, reminderTime, timeZone));
      }
    });
    
    return Promise.all(notifications);
  });

// Helper function to calculate reminder time
function calculateReminderTime(wakeTime: string, delayMinutes: number): string {
  const [hours, minutes] = wakeTime.split(':').map(Number);
  const wakeDate = new Date();
  wakeDate.setHours(hours, minutes, 0, 0);
  
  const reminderDate = new Date(wakeDate.getTime() + (delayMinutes * 60 * 1000));
  
  return `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`;
}

// Helper function to schedule notification
async function scheduleNotification(userId: string, reminderTime: string, timeZone: string): Promise<void> {
  // Implementation would use Firebase Cloud Messaging
  // This is a placeholder for the actual notification logic
  console.log(`Scheduling notification for user ${userId} at ${reminderTime} in ${timeZone}`);
}
```

### 4. Analytics Functions

```typescript
// functions/src/analytics-functions.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Process analytics events
export const processAnalyticsEvent = functions.firestore
  .document('analytics_events/{eventId}')
  .onCreate(async (snapshot, context) => {
    const eventData = snapshot.data();
    
    // Mark event as processed
    await snapshot.ref.update({
      'metadata.processed': true,
      'metadata.processedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Additional analytics processing can be added here
    // e.g., forwarding to external analytics services
    
    return null;
  });

// Generate weekly analytics reports
export const generateWeeklyReports = functions.pubsub
  .schedule('0 9 * * 1') // Every Monday at 9 AM UTC
  .onRun(async (context) => {
    // Generate weekly analytics reports for active users
    const activeUsersSnapshot = await admin.firestore()
      .collection('users')
      .where('subscription.status', 'in', ['active', 'trial'])
      .get();
    
    const reports: Promise<any>[] = [];
    
    activeUsersSnapshot.docs.forEach(doc => {
      reports.push(generateUserWeeklyReport(doc.id));
    });
    
    return Promise.all(reports);
  });

async function generateUserWeeklyReport(userId: string): Promise<void> {
  // Implementation for generating weekly progress reports
  console.log(`Generating weekly report for user ${userId}`);
}
```

### 5. Subscription Functions

```typescript
// functions/src/subscription-functions.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Handle subscription status changes
export const onSubscriptionUpdate = functions.firestore
  .document('subscriptions/{userId}')
  .onWrite(async (change, context) => {
    const { userId } = context.params;
    
    if (!change.after.exists) return null;
    
    const subscriptionData = change.after.data();
    const status = subscriptionData.current?.status;
    
    // Update user profile with subscription status
    const userRef = admin.firestore().collection('users').doc(userId);
    
    return userRef.update({
      'subscription.status': status,
      'subscription.plan': subscriptionData.current?.plan || null,
      'subscription.expiresAt': subscriptionData.current?.expiresAt || null,
      'metadata.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
    });
  });

// Handle subscription expiration
export const checkExpiredSubscriptions = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight UTC
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    const expiredSubscriptions = await admin.firestore()
      .collection('subscriptions')
      .where('current.expiresAt', '<=', now)
      .where('current.status', '==', 'active')
      .get();
    
    const updates: Promise<any>[] = [];
    
    expiredSubscriptions.docs.forEach(doc => {
      updates.push(doc.ref.update({
        'current.status': 'expired',
        'metadata.lastUpdated': admin.firestore.FieldValue.serverTimestamp(),
      }));
    });
    
    return Promise.all(updates);
  });
```

## Deployment Commands

```bash
# Initialize Firebase Functions
firebase functions:config:set environment="production"

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:onUserCreate

# View function logs
firebase functions:log

# Run functions locally
firebase emulators:start --only functions,firestore
```

## Environment Variables

```bash
# Set environment variables for functions
firebase functions:config:set \
  app.name="Productivity Morning Routine" \
  notifications.sender_id="197877248013" \
  analytics.enabled="true"
```

## Testing

```typescript
// functions/src/test/auth-triggers.test.ts
import * as admin from 'firebase-admin';
import * as test from 'firebase-functions-test';

const testEnv = test();

describe('Auth Triggers', () => {
  afterAll(() => {
    testEnv.cleanup();
  });

  test('should create user profile on user creation', async () => {
    const user = {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    // Test the onUserCreate function
    // Implementation details would go here
  });
});
```

## Security Considerations

1. **Function Permissions**: Ensure functions run with minimal required permissions
2. **Data Validation**: Validate all input data in functions
3. **Rate Limiting**: Implement rate limiting for user-triggered functions
4. **Audit Logging**: Log all critical operations for security auditing
5. **Environment Variables**: Store sensitive configuration in Firebase Functions config

## Performance Optimization

1. **Batch Operations**: Use Firestore batch operations for multiple writes
2. **Caching**: Implement caching for frequently accessed data
3. **Pagination**: Implement pagination for large data queries
4. **Indexing**: Ensure proper Firestore indexes for all queries
5. **Timeout Configuration**: Set appropriate timeout values for functions

This Cloud Functions setup provides a robust backend infrastructure for the Productivity Morning Routine app, handling user management, data processing, notifications, and analytics in a scalable and secure manner.