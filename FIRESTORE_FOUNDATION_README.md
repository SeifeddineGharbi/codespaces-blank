# Comprehensive Firestore Foundation Documentation

## Overview

This document provides comprehensive documentation for the Firestore foundation implemented for the Productivity Morning Routine app. The foundation includes robust data structures, validation, CRUD operations, scoring system, and security rules designed specifically for the 4 core MVP habits.

## 🏗️ Architecture Overview

The Firestore foundation is built with the following key components:

### Core Services
- **User Profile Service**: Complete user data management
- **Daily Progress Service**: Task completion and progress tracking  
- **Batch Operations Service**: Efficient multi-document operations
- **Analytics Service**: Comprehensive reporting and insights
- **Validation Service**: Robust data validation for all structures
- **Scoring Service**: Advanced scoring system for the 4 core habits
- **Database Utils**: Common utilities and helper functions

### Data Collections
```
/users/{userId}                               # User profiles
/user_progress/{userId}/daily_entries/{date}  # Daily progress tracking
/subscriptions/{userId}                       # Subscription management
/support_tickets/{ticketId}                  # Customer support
/analytics_events/{eventId}                  # Analytics tracking
/app_config/settings                         # App configuration
```

## 📊 The 4 Core MVP Habits

The system is designed around 4 core habits, each weighted at 25%:

### 1. 💧 Drink Water (Blue)
- **Category**: Hydration
- **Weight**: 25%
- **Validation**: Simple binary completion
- **Optimal Duration**: < 5 minutes

### 2. ⛔ No Phone Usage (Red)  
- **Category**: Digital Wellness
- **Weight**: 25%
- **Validation**: Critical habit - no points for skipping
- **Focus**: Avoiding phone before getting out of bed

### 3. ☀️ Sunlight Exposure (Yellow)
- **Category**: Health  
- **Weight**: 25%
- **Validation**: Bonus for optimal duration (5-10 minutes)
- **Penalty**: 20% reduction for < 3 minutes

### 4. 🐘 Elephant Task (Green)
- **Category**: Productivity
- **Weight**: 25% 
- **Validation**: Requires notes when completed
- **Bonus**: 15% for detailed notes (50+ characters)

## 🗃️ Data Structures

### User Profile Structure
```typescript
interface FirestoreUserProfile {
  userId: string;
  profile: {
    email: string;
    displayName?: string;
    photoURL?: string; 
    timeZone: string;
    locale: string;
  };
  onboarding: {
    isCompleted: boolean;
    completedAt?: Timestamp;
    responses: FirestoreOnboardingResponses;
  };
  routine: {
    wakeTime: string; // "06:00" format
    workStartTime?: string; // "09:00" format  
    routineDuration: number; // minutes
    selectedTasks: FirestoreRoutineTask[];
    customTasks?: FirestoreCustomTask[];
  };
  settings: {
    notifications: {
      morningReminder: boolean;
      reminderTime: string;
      motivationalQuotes: boolean;
      weeklyProgress: boolean; 
      streakMilestones: boolean;
    };
    privacy: {
      analyticsOptIn: boolean;
      crashReportingOptIn: boolean;
    };
  };
  subscription: {
    status: 'active' | 'cancelled' | 'expired' | 'trial' | 'none';
    plan?: 'weekly' | 'annual';
    expiresAt?: Timestamp;
    isTrialUser: boolean;
    hasUsedTrial: boolean;
  };
  stats: {
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    averageCompletionScore: number;
    totalDaysActive: number;
    joinDate: Timestamp;
    lastActive: Timestamp;
    achievements: string[];
  };
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
    version: number;
    deviceInfo?: {
      platform: 'ios' | 'android';
      appVersion: string;
      deviceModel?: string;
    };
  };
}
```

### Daily Progress Structure  
```typescript
interface FirestoreDailyProgress {
  userId: string;
  date: string; // YYYY-MM-DD format
  session: {
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number; // actual duration in minutes
    isCompleted: boolean;
    completionPercentage: number; // 0-100
  };
  tasks: FirestoreTaskCompletion[];
  metrics: {
    wakeTime?: string; // "06:15" format - actual wake time
    energyLevel?: number; // 1-10 scale
    moodRating?: number; // 1-10 scale  
    difficultyRating?: number; // 1-10 scale
    motivationLevel?: number; // 1-10 scale
  };
  reflection: {
    dailyReflection?: string;
    improvements?: string;
    challenges?: string;
    wins?: string;
  };
  achievements: {
    newAchievements: string[];
    milestones: FirestoreMilestone[];
  };
  streaks: {
    currentStreak: number;
    isStreakDay: boolean; 
    longestStreak: number;
    lastCompletionDate?: string;
  };
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
    dataSource: 'app' | 'sync' | 'manual';
  };
}
```

## 🔐 Security Rules

The Firestore security rules provide comprehensive validation:

### Key Security Features
- **User Isolation**: Users can only access their own data
- **Data Validation**: Comprehensive validation for all data structures
- **MVP Task Validation**: Specific validation for each of the 4 core habits
- **Type Safety**: Strong typing enforcement
- **Business Rules**: Enforcement of app business logic

### Example Security Rule for MVP Tasks
```javascript
function isValidMVPTaskSpecific(task) {
  return (task.taskId == 'drink_water' && isValidWaterTask(task)) ||
         (task.taskId == 'no_phone_usage' && isValidNoPhoneTask(task)) ||
         (task.taskId == 'sunlight_exposure' && isValidSunlightTask(task)) ||
         (task.taskId == 'elephant_task' && isValidElephantTask(task));
}

function isValidElephantTask(task) {
  return task.category == 'productivity' &&
         (task.status != 'completed' || task.notes != null);
}
```

## 📈 Scoring System

### Scoring Weights
Each of the 4 MVP habits has equal weight:
- Drink Water: 25%
- No Phone Usage: 25%  
- Sunlight Exposure: 25%
- Elephant Task: 25%

### Scoring Features
- **Base Scoring**: Points based on completion status
- **Quality Multipliers**: Based on task ratings (1-5 scale)
- **Bonus Points**: For optimal performance
- **Streak Bonuses**: Up to 10% extra for consecutive days
- **Quality Bonuses**: Up to 5% extra for high ratings

### Daily Score Calculation
```typescript
const dailyScore = calculateDailyScore(taskCompletions, streakInfo);
// Returns: { totalScore, percentage, taskScores, bonusPoints, tier, motivationalMessage }
```

## 🛠️ Service Usage Examples

### Creating a User Profile
```typescript
import { userProfileService } from '@/services/database';

const result = await userProfileService.createUserProfile(userId, {
  profile: {
    email: 'user@example.com',
    timeZone: 'America/New_York',
    locale: 'en-US'
  }
});

if (result.success) {
  console.log('Profile created:', result.data);
} else {  
  console.error('Error:', result.error);
}
```

### Updating Task Completion
```typescript
import { dailyProgressService } from '@/services/database';

const result = await dailyProgressService.updateTaskCompletion(
  userId, 
  '2025-01-28', 
  'drink_water',
  { 
    status: 'completed',
    actualDuration: 2,
    rating: 5
  }
);
```

### Getting Analytics
```typescript
import { analyticsService } from '@/services/database';

const analytics = await analyticsService.generateUserAnalytics(userId, 30);
// Returns comprehensive analytics for last 30 days
```

### Using Validation
```typescript
import { validateUserProfile } from '@/services/validation';

const validation = validateUserProfile(profileData);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}
```

### Calculating Scores
```typescript
import { scoringUtils } from '@/services/scoring';

const dailyScore = scoringUtils.calculateDailyScore(taskCompletions);
const weeklyScore = scoringUtils.calculateWeeklyScore(progressHistory);
const insights = scoringUtils.generateScoreInsights(weeklyScore, streakInfo);
```

## 🔧 Utility Functions

### Database Utils
```typescript
import { databaseUtils } from '@/services/databaseUtils';

// Date utilities
const today = databaseUtils.dateTime.getTodayString();
const weekRange = databaseUtils.dateTime.getWeekRange(new Date());

// Task utilities  
const defaultTasks = databaseUtils.task.createDefaultTaskCompletions();
const completionSummary = databaseUtils.task.getTaskCompletionSummary(tasks);

// Analytics utilities
const completionRate = databaseUtils.analytics.calculateCompletionRate(progresses);
const opportunities = databaseUtils.analytics.getImprovementOpportunities(progresses);

// Data transformation
const appProfile = databaseUtils.transform.firestoreToAppUserProfile(firestoreProfile);
```

### Caching
```typescript
import { databaseUtils } from '@/services/databaseUtils';

// Cache user profile for 5 minutes
databaseUtils.cache.set(`profile_${userId}`, profileData, 300);

// Retrieve from cache
const cachedProfile = databaseUtils.cache.get(`profile_${userId}`);
```

## 🎯 Best Practices

### 1. Always Use Validation
```typescript
// ✅ Good
const validation = validateDailyProgress(progressData);
if (validation.isValid) {
  await saveProgress(progressData);
} else {
  handleValidationErrors(validation.errors);
}

// ❌ Bad - No validation
await saveProgress(progressData);
```

### 2. Handle Errors Properly
```typescript
// ✅ Good
const result = await userProfileService.getUserProfile(userId);
if (!result.success) {
  if (databaseUtils.error.isNetworkError(result.error)) {
    showNetworkError();
  } else {
    showGenericError(result.error);
  }
}

// ❌ Bad - No error handling
const profile = await userProfileService.getUserProfile(userId);
```

### 3. Use Transactions for Related Updates
```typescript
// ✅ Good - User stats and daily progress updated together
await dailyProgressService.submitCompletedDay(userId, date, reflection);

// ❌ Bad - Separate updates that could fail independently
await updateDailyProgress(userId, date, progressData);
await updateUserStats(userId, statsData);
```

### 4. Leverage Caching
```typescript
// ✅ Good - Cache expensive analytics calculations
const cacheKey = `analytics_${userId}_${days}`;
let analytics = databaseUtils.cache.get(cacheKey);
if (!analytics) {
  analytics = await analyticsService.generateUserAnalytics(userId, days);
  databaseUtils.cache.set(cacheKey, analytics, 300); // 5 minutes
}
```

### 5. Use Real-time Listeners Wisely
```typescript
// ✅ Good - Clean up listeners
const unsubscribe = userProfileService.listenToUserProfile(userId, (profile) => {
  updateUI(profile);
});

// Remember to clean up
useEffect(() => {
  return () => unsubscribe();
}, []);
```

## 🧪 Testing the Foundation

### Test Firebase Connection
```typescript
import { checkFirebaseConnection } from '@/services/firebase';

const isConnected = await checkFirebaseConnection();
console.log('Firebase connected:', isConnected);
```

### Test Validation
```typescript
import { validateUserProfile } from '@/services/validation';

const testProfile = { /* test data */ };
const validation = validateUserProfile(testProfile);
console.log('Validation passed:', validation.isValid);
```

### Test Scoring
```typescript
import { scoringUtils } from '@/services/scoring';

const testTasks = [
  { taskId: 'drink_water', status: 'completed', rating: 5 },
  { taskId: 'no_phone_usage', status: 'completed', rating: 4 },
  // ... other tasks
];

const score = scoringUtils.calculateDailyScore(testTasks);
console.log('Daily score:', score.percentage);
```

## 🚀 Performance Considerations

### Indexing Strategy
The following Firestore indexes are recommended:
```typescript
// User progress queries
{
  collection: 'user_progress/{userId}/daily_entries',
  fields: [
    { field: 'date', order: 'desc' },
    { field: 'session.isCompleted', order: 'asc' }
  ]
}

// Analytics queries
{
  collection: 'analytics_events',
  fields: [
    { field: 'userId', order: 'asc' },
    { field: 'event.timestamp', order: 'desc' }
  ]
}
```

### Pagination
```typescript
// Use pagination for large datasets
const result = await dailyProgressService.getProgressHistory(
  userId, 
  startDate, 
  endDate,
  { 
    limit: 20,
    orderDirection: 'desc'
  }
);
```

### Batch Operations
```typescript
// Use batch operations for multiple updates
await batchOperationsService.executeBatch([
  { type: 'update', collection: 'users', docId: userId, data: userUpdates },
  { type: 'create', collection: 'analytics_events', docId: eventId, data: eventData }
]);
```

## 🔄 Migration and Versioning

### Schema Versioning
All documents include a version field for future migrations:
```typescript
metadata: {
  version: 1, // Current schema version
  // ... other metadata
}
```

### Data Migration Example
```typescript
// Check version and migrate if needed
if (profileData.metadata.version < 2) {
  const migratedData = migrateToV2(profileData);
  await userProfileService.updateUserProfile(userId, migratedData);
}
```

## 📞 Support and Troubleshooting

### Common Issues

1. **Validation Errors**: Check the validation result object for specific error messages
2. **Permission Denied**: Ensure user is authenticated and accessing their own data
3. **Network Errors**: Use `databaseUtils.error.isNetworkError()` to detect and handle
4. **Cache Issues**: Clear cache with `databaseUtils.cache.clearAll()` if needed

### Debug Mode
Enable debug logging in development:
```typescript
if (__DEV__) {
  console.log('Firestore operation:', operation, result);
}
```

### Getting Help
- Check validation errors first: `validation.errors`
- Use error utilities: `databaseUtils.error.formatUserError(error)`
- Enable detailed logging for debugging
- Check Firestore security rules if permissions are denied

---

## 📋 Summary

This comprehensive Firestore foundation provides:

✅ **Complete Data Architecture** - Robust schemas for all app data  
✅ **4 Core Habits Support** - Specialized handling for MVP tasks  
✅ **Advanced Scoring System** - 25% weight each, bonuses, streaks  
✅ **Comprehensive Validation** - Client and server-side validation  
✅ **Security Rules** - Row-level security with data validation  
✅ **CRUD Operations** - Full create, read, update, delete support  
✅ **Real-time Updates** - Live data synchronization  
✅ **Analytics & Insights** - Comprehensive reporting system  
✅ **Utilities & Helpers** - Common operations and transformations  
✅ **Error Handling** - Robust error management and recovery  
✅ **Performance Optimized** - Caching, pagination, batch operations  

The foundation is production-ready and designed to scale with the app's growth while maintaining data integrity and user experience quality.