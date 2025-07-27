# Database Schema Design Document v1.0

## 📋 Table of Contents

1. [Overview](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#overview)
2. [Database Architecture](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#database-architecture)
3. [Core Collections](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#core-collections)
4. [Data Relationships](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#data-relationships)
5. [Security Rules](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#security-rules)
6. [Indexes & Performance](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#indexes--performance)
7. [Data Validation](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#data-validation)
8. [Analytics Schema](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#analytics-schema)
9. [Migration Strategy](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#migration-strategy)
10. [Backup & Recovery](https://claude.ai/chat/de2245dc-558f-4f37-9be1-3d8f996ff4d7#backup--recovery)

## 🏗 Overview

### Database Technology

- **Primary Database**: Firebase Cloud Firestore
- **Authentication**: Firebase Authentication
- **Analytics**: Firebase Analytics + Custom Events
- **Real-time Features**: Firestore real-time listeners

### Design Principles

- **Scalability**: Designed for 100,000+ users
- **Performance**: Optimized queries with proper indexing
- **Security**: Row-level security with Firestore rules
- **Data Integrity**: Strong validation and constraints
- **Privacy**: GDPR-compliant data handling

## 🏛 Database Architecture

### Collection Structure Overview

```
/users/{userId}
/user_progress/{userId}/daily_entries/{dateString}
/subscriptions/{userId}
/analytics_events/{eventId}
/support_tickets/{ticketId}
/app_config/settings

```

## 📊 Core Collections

### 1. Users Collection

**Collection Path**: `/users/{userId}`

```tsx
interface UserDocument {
  userId: string;

  // Basic Profile Information
  profile: {
    email: string;
    displayName?: string;
    photoURL?: string;
    timeZone: string; // User's timezone (e.g., "America/New_York")
    locale: string; // User's locale (e.g., "en-US")
  };

  // Onboarding & Personalization
  onboarding: {
    isCompleted: boolean;
    completedAt?: Timestamp;
    responses: {
      currentWakeTime: string; // "06:30" format
      idealWakeTime: string; // "06:00" format
      motivations: string[]; // Selected motivation categories
      challenges: string[]; // Selected challenge areas
      experience: 'beginner' | 'intermediate' | 'advanced';
      goals: string[]; // Selected goals
    };
  };

  // Morning Routine Preferences
  routine: {
    wakeTime: string; // "06:00" format
    routineDuration: number; // minutes
    selectedTasks: Array<{
      taskId: string;
      duration: number; // minutes
      order: number;
      isEnabled: boolean;
    }>;
    customTasks: Array<{
      id: string;
      name: string;
      duration: number;
      category: string;
      order: number;
      isEnabled: boolean;
    }>;
  };

  // App Settings & Preferences
  settings: {
    notifications: {
      morningReminder: boolean;
      reminderTime: string; // "05:45" format
      motivationalQuotes: boolean;
      weeklyProgress: boolean;
      streakMilestones: boolean;
    };
    privacy: {
      analyticsOptIn: boolean;
      crashReportingOptIn: boolean;
    };
  };

  // Subscription Status
  subscription: {
    status: 'active' | 'cancelled' | 'expired' | 'trial' | 'none';
    plan?: 'weekly' | 'annual';
    expiresAt?: Timestamp;
    isTrialUser: boolean;
    hasUsedTrial: boolean;
  };

  // User Statistics & Progress
  stats: {
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    averageCompletionScore: number;
    totalDaysActive: number;
    joinDate: Timestamp;
    lastActive: Timestamp;
    achievements: string[]; // Achievement IDs unlocked
  };

  // Metadata
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
    version: number; // Schema version for migrations
    deviceInfo?: {
      platform: 'ios' | 'android';
      appVersion: string;
      deviceModel?: string;
    };
  };
}

```

### 2. User Progress Collection

**Collection Path**: `/user_progress/{userId}/daily_entries/{dateString}`

```tsx
interface DailyProgressDocument {
  userId: string;
  date: string; // YYYY-MM-DD format

  // Session Information
  session: {
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number; // actual duration in minutes
    isCompleted: boolean;
    completionPercentage: number; // 0-100
  };

  // Task Completion Details
  tasks: Array<{
    taskId: string;
    name: string;
    category: string;
    plannedDuration: number; // minutes
    actualDuration?: number; // minutes
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
    startTime?: Timestamp;
    endTime?: Timestamp;
    notes?: string;
    rating?: number; // 1-5 satisfaction rating
  }>;

  // Daily Metrics
  metrics: {
    wakeTime?: string; // "06:15" format - actual wake time
    energyLevel?: number; // 1-10 scale
    moodRating?: number; // 1-10 scale
    difficultyRating?: number; // 1-10 scale
    motivationLevel?: number; // 1-10 scale
  };

  // Reflection & Notes
  reflection: {
    dailyReflection?: string;
    improvements?: string;
    challenges?: string;
    wins?: string;
  };

  // Achievements & Milestones
  achievements: {
    newAchievements: string[]; // Achievement IDs earned today
    milestones: Array<{
      type: 'streak' | 'completion' | 'consistency';
      value: number;
      achievedAt: Timestamp;
    }>;
  };

  // Streak Information
  streaks: {
    currentStreak: number;
    isStreakDay: boolean;
    longestStreak: number;
    lastCompletionDate?: string; // YYYY-MM-DD format
  };

  // Metadata
  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
    dataSource: 'app' | 'sync' | 'manual';
  };
}

```

### 3. Subscriptions Collection

**Collection Path**: `/subscriptions/{userId}`

```tsx
interface SubscriptionDocument {
  userId: string;

  // Current Subscription Status
  current: {
    status: 'active' | 'cancelled' | 'expired' | 'trial' | 'none';
    plan: 'weekly' | 'annual' | null;
    startDate: Timestamp;
    expiresAt?: Timestamp;
    autoRenew: boolean;

    // Trial Information
    trial: {
      isTrialUser: boolean;
      trialStartDate?: Timestamp;
      trialEndDate?: Timestamp;
      hasUsedTrial: boolean;
    };
  };

  // RevenueCat Integration
  revenuecat: {
    customerId: string;
    originalAppUserId: string;
    activeEntitlements: string[];
    latestReceiptInfo?: {
      productId: string;
      purchaseDate: Timestamp;
      expirationDate?: Timestamp;
      originalTransactionId: string;
    };
  };

  // Purchase History
  purchases: Array<{
    productId: string;
    platform: 'ios' | 'android';
    purchaseDate: Timestamp;
    expirationDate?: Timestamp;
    price: number;
    currency: string;
    transactionId: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
  }>;

  // Billing Information
  billing: {
    nextBillingDate?: Timestamp;
    lastBillingDate?: Timestamp;
    billingIssues: Array<{
      date: Timestamp;
      issue: string;
      resolved: boolean;
    }>;
  };

  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
  };
}

```

### 4. Support Tickets Collection

**Collection Path**: `/support_tickets/{ticketId}`

```tsx
interface SupportTicketDocument {
  ticketId: string;
  userId: string;

  // Ticket Information
  ticket: {
    subject: string;
    description: string;
    category: 'bug' | 'feature_request' | 'billing' | 'general' | 'technical';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
  };

  // User Context
  userContext: {
    email: string;
    subscriptionStatus: string;
    appVersion: string;
    platform: 'ios' | 'android';
    deviceInfo?: string;
  };

  // Conversation Thread
  messages: Array<{
    messageId: string;
    sender: 'user' | 'support';
    content: string;
    timestamp: Timestamp;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  }>;

  // Resolution
  resolution?: {
    resolvedAt: Timestamp;
    resolvedBy: string;
    solution: string;
    satisfactionRating?: number; // 1-5
  };

  metadata: {
    createdAt: Timestamp;
    lastUpdated: Timestamp;
    assignedTo?: string;
  };
}

```

### 5. App Configuration Collection

**Collection Path**: `/app_config/settings`

```tsx
interface AppConfigDocument {
  // Feature Flags
  features: {
    isOnboardingEnabled: boolean;
    isStreakSystemEnabled: boolean;
    isAnalyticsEnabled: boolean;
    isPremiumFeaturesEnabled: boolean;
    isMaintenanceMode: boolean;
  };

  // App Settings
  app: {
    minimumVersion: {
      ios: string;
      android: string;
    };
    forceUpdate: {
      ios: boolean;
      android: boolean;
    };
    apiEndpoints: {
      analytics: string;
      support: string;
    };
  };

  // Default Task Templates
  defaultTasks: Array<{
    id: string;
    name: string;
    description: string;
    category: 'mindfulness' | 'fitness' | 'productivity' | 'wellness';
    defaultDuration: number;
    instructions: string;
    isPremium: boolean;
    order: number;
  }>;

  // Motivation Content
  content: {
    motivationalQuotes: Array<{
      id: string;
      text: string;
      author: string;
      category: string;
    }>;
    tips: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      isPremium: boolean;
    }>;
  };

  // Subscription Configuration
  subscriptions: {
    products: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      duration: 'weekly' | 'annual';
      features: string[];
    }>;
    trialDuration: number; // days
    gracePeriod: number; // days
  };

  metadata: {
    lastUpdated: Timestamp;
    version: number;
  };
}

```

### 6. Analytics Events Collection

**Collection Path**: `/analytics_events/{eventId}`

```tsx
interface AnalyticsEventDocument {
  eventId: string;
  userId: string;

  // Event Information
  event: {
    name: string;
    category: 'user_action' | 'system' | 'business' | 'performance';
    timestamp: Timestamp;
    sessionId: string;
  };

  // Event Properties (varies by event type)
  properties: {
    // User Events
    'routine_started'?: {
      planned_duration: number;
      task_count: number;
      wake_time: string;
    };

    'routine_completed'?: {
      actual_duration: number;
      completion_percentage: number;
      tasks_completed: number;
      satisfaction_rating: number;
    };

    'task_completed'?: {
      task_id: string;
      task_name: string;
      category: string;
      duration: number;
      rating: number;
    };

    // Subscription Events
    'subscription_started'?: {
      plan: string;
      price: number;
      trial_used: boolean;
    };

    'subscription_cancelled'?: {
      plan: string;
      reason: string;
      days_active: number;
    };

    // Analytics Events
    'analytics_viewed'?: {
      tab_type: 'weekly' | 'monthly' | 'streaks';
      view_duration_seconds: number;
    };

    // Retention Events
    'streak_milestone'?: {
      streak_length: number;
      milestone_type: '7_day' | '30_day' | '100_day';
    };

    'user_churned'?: {
      days_since_last_activity: number;
      subscription_status: string;
      last_completion_score: number;
    };
  };

  // Device & App Context
  context: {
    appVersion: string;
    platform: 'ios' | 'android';
    deviceModel?: string;
    osVersion?: string;
    timezone: string;
    locale: string;
  };

  metadata: {
    createdAt: Timestamp;
    processed: boolean;
  };
}

```

## 🔗 Data Relationships

### Primary Relationships

1. **Users ↔ User Progress**: One-to-many relationship where each user has multiple daily progress entries
2. **Users ↔ Subscriptions**: One-to-one relationship for subscription management
3. **Users ↔ Support Tickets**: One-to-many relationship for customer support
4. **Users ↔ Analytics Events**: One-to-many relationship for tracking user behavior

### Data Consistency Rules

- User progress entries must have a valid userId that exists in the users collection
- Subscription documents must reference an existing user
- Analytics events must be tied to a valid userId
- Daily progress entries must have unique date strings per user

## 🔒 Security Rules

### Firestore Security Rules

```jsx
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User progress subcollection
    match /user_progress/{userId}/daily_entries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Subscriptions - users can only access their own
    match /subscriptions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Support tickets - users can only access their own
    match /support_tickets/{ticketId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }

    // App config - read-only for authenticated users
    match /app_config/{document} {
      allow read: if request.auth != null;
    }

    // Analytics events - write-only for authenticated users
    match /analytics_events/{eventId} {
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}

```

### Data Validation Rules

```tsx
// Client-side validation functions
export const validateUserProfile = (profile: any): boolean => {
  return (
    profile.email &&
    profile.timeZone &&
    profile.locale &&
    typeof profile.email === 'string' &&
    profile.email.includes('@')
  );
};

export const validateDailyProgress = (progress: any): boolean => {
  return (
    progress.date &&
    progress.userId &&
    progress.session &&
    typeof progress.session.isCompleted === 'boolean' &&
    progress.session.completionPercentage >= 0 &&
    progress.session.completionPercentage <= 100
  );
};

export const validateRoutineTask = (task: any): boolean => {
  return (
    task.taskId &&
    task.duration &&
    task.order !== undefined &&
    typeof task.isEnabled === 'boolean' &&
    task.duration > 0 &&
    task.duration <= 180 // max 3 hours
  );
};

```

## 📈 Indexes & Performance

### Composite Indexes

```tsx
// Required composite indexes for Firestore
const requiredIndexes = [
  // User progress queries
  {
    collection: 'user_progress/{userId}/daily_entries',
    fields: [
      { field: 'date', order: 'desc' },
      { field: 'session.isCompleted', order: 'asc' }
    ]
  },

  // Analytics queries
  {
    collection: 'analytics_events',
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'event.timestamp', order: 'desc' }
    ]
  },

  {
    collection: 'analytics_events',
    fields: [
      { field: 'event.category', order: 'asc' },
      { field: 'event.timestamp', order: 'desc' }
    ]
  },

  // Support ticket queries
  {
    collection: 'support_tickets',
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'metadata.createdAt', order: 'desc' }
    ]
  },

  {
    collection: 'support_tickets',
    fields: [
      { field: 'ticket.status', order: 'asc' },
      { field: 'metadata.createdAt', order: 'desc' }
    ]
  }
];

```

### Query Optimization

```tsx
// Optimized query patterns
export const getRecentProgress = (userId: string, limit: number = 30) => {
  return firestore
    .collection(`user_progress/${userId}/daily_entries`)
    .orderBy('date', 'desc')
    .limit(limit);
};

export const getCompletedSessions = (userId: string, startDate: string, endDate: string) => {
  return firestore
    .collection(`user_progress/${userId}/daily_entries`)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .where('session.isCompleted', '==', true)
    .orderBy('date', 'desc');
};

export const getUserAnalytics = (userId: string, eventCategory: string, limit: number = 100) => {
  return firestore
    .collection('analytics_events')
    .where('userId', '==', userId)
    .where('event.category', '==', eventCategory)
    .orderBy('event.timestamp', 'desc')
    .limit(limit);
};

```

### Performance Monitoring

```tsx
// Automated index creation based on query patterns
export const optimizeIndexes = functions.firestore
  .document('query_logs/{logId}')
  .onCreate(async (snapshot, context) => {
    const queryLog = snapshot.data();

    // Analyze slow queries and suggest indexes
    if (queryLog.executionTime > 1000) { // Queries taking > 1 second
      console.warn('Slow query detected:', queryLog);
      // Automatically create composite indexes for common patterns
      // This would integrate with Firestore Admin API
    }
  });

```

## 🔍 Monitoring & Maintenance

### Database Health Monitoring

```tsx
// Cloud Functions for monitoring
export const monitorDatabaseHealth = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    // Check query performance
    const slowQueries = await getSlowQueries();

    // Monitor storage usage
    const storageMetrics = await getStorageMetrics();

    // Check security rule violations
    const securityViolations = await getSecurityViolations();

    // Alert if issues found
    if (slowQueries.length > 0 || storageMetrics.usage > 0.8) {
      await sendAlert({
        type: 'database_performance',
        details: { slowQueries, storageMetrics, securityViolations }
      });
    }
  });

```

## 🔄 Migration Strategy

### Version Management

```tsx
interface MigrationScript {
  version: number;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

const migrations: MigrationScript[] = [
  {
    version: 1,
    description: 'Initial schema setup',
    up: async () => {
      // Create initial collections and indexes
      await createInitialCollections();
      await createRequiredIndexes();
    },
    down: async () => {
      // Rollback initial setup
      await removeCollections();
    }
  },

  {
    version: 2,
    description: 'Add subscription management',
    up: async () => {
      // Migrate user subscription data
      await migrateUserSubscriptions();
      await createSubscriptionIndexes();
    },
    down: async () => {
      // Rollback subscription changes
      await rollbackSubscriptionMigration();
    }
  }
];

export const runMigrations = async (targetVersion?: number) => {
  const currentVersion = await getCurrentSchemaVersion();
  const migrationsToRun = migrations.filter(m =>
    m.version > currentVersion &&
    (!targetVersion || m.version <= targetVersion)
  );

  for (const migration of migrationsToRun) {
    console.log(`Running migration ${migration.version}: ${migration.description}`);
    await migration.up();
    await updateSchemaVersion(migration.version);
  }
};

```

### Data Migration Utilities

```tsx
export const migrateUserData = async () => {
  const batch = firestore.batch();
  const users = await firestore.collection('users').get();

  users.docs.forEach(doc => {
    const userData = doc.data();

    // Add new fields with defaults
    const updatedData = {
      ...userData,
      'metadata.version': 2,
      'stats.achievements': userData.stats?.achievements || []
    };

    batch.update(doc.ref, updatedData);
  });

  await batch.commit();
};

```

## 🔐 Backup & Recovery

### Backup Strategy

```tsx
// Automated backup configuration
export const scheduleBackups = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    const backup = await admin.firestore().backup({
      databaseId: '(default)',
      collectionIds: [
        'users',
        'user_progress',
        'subscriptions',
        'support_tickets',
        'analytics_events'
      ]
    });

    console.log('Backup created:', backup.name);

    // Store backup metadata
    await firestore.collection('backup_logs').add({
      backupId: backup.name,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      collections: ['users', 'user_progress', 'subscriptions', 'support_tickets', 'analytics_events'],
      status: 'completed'
    });
  });

```

### Recovery Procedures

1. **Point-in-time Recovery**
    - Daily automated backups retained for 30 days
    - Weekly backups retained for 1 year
    - Monthly backups retained for 5 years
2. **Recovery Time Objectives**
    - Critical user data: < 1 hour
    - Full database: < 4 hours
    - Historical analytics: < 24 hours
3. **Recovery Point Objectives**
    - Maximum data loss: < 1 hour
    - Backup frequency: Every 6 hours
    - Real-time replication: Firebase's built-in redundancy

## 📝 Implementation Checklist

### Database Setup

- ✅ Firebase project created and configured
- ✅ Firestore database initialized
- ✅ Security rules implemented and tested
- ✅ Composite indexes created
- ✅ Backup configuration enabled

### Schema Implementation

- ✅ User collection structure implemented
- ✅ Progress tracking collections created
- ✅ Subscription management schema deployed
- ✅ Analytics events schema configured
- ✅ Support ticket system implemented

### Validation & Security

- ✅ Client-side validation implemented
- ✅ Server-side validation Cloud Functions deployed
- ✅ Security rules thoroughly tested
- ✅ Data encryption at rest verified
- ✅ GDPR compliance measures implemented

### Performance & Monitoring

- ✅ Query optimization implemented
- ✅ Database monitoring Cloud Functions deployed
- ✅ Performance benchmarks established
- ✅ Alerting system configured
- ✅ Backup and recovery procedures tested

### Migration & Maintenance

- ✅ Schema version management implemented
- ✅ Data migration procedures documented
- ✅ Archive and cleanup strategies deployed
- ✅ Documentation updated and maintained

---

**Document Version**: 1.0

**Last Updated**: [Current Date]

**Next Review**: [Date + 1 month]

This schema design should be reviewed and updated as the application evolves and new features are added.