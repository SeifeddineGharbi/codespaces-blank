# Productivity Morning Routine - Architecture Documentation

## Project Overview

**App Name:** Productivity Morning Routine  
**Platform:** React Native (iOS & Android)  
**Framework:** Expo Managed Workflow  
**Styling:** NativeWind (Tailwind CSS for React Native)  
**UI Components:** Gluestack UI v2 (copy-paste approach)  
**Backend:** Firebase (Auth, Firestore, Analytics, Push Notifications)  
**Navigation:** React Navigation v6  

## Architecture Setup by Project Architect

This foundational architecture has been established following the CLAUDE_CODE_RULES.md requirements:

### ✅ Completed Foundation
1. **Project Structure** - Organized folder hierarchy
2. **TypeScript Configuration** - Full type safety setup
3. **Navigation Structure** - React Navigation v6 with bottom tabs
4. **Firebase Integration** - Service layer architecture
5. **Styling System** - NativeWind configuration
6. **Type Definitions** - Comprehensive interfaces
7. **Constants & Configuration** - Centralized app settings
8. **Utility Functions** - Helper functions for common operations

## Folder Structure

```
/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── auth/            # Authentication-specific components
│   │   ├── tasks/           # Task-related components
│   │   ├── analytics/       # Analytics components
│   │   └── settings/        # Settings components
│   ├── screens/             # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── onboarding/      # Onboarding flow screens
│   │   ├── main/            # Main app screens (tabs)
│   │   └── paywall/         # Subscription screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # Backend services (Firebase)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── constants/           # App constants and configuration
│   └── types/               # TypeScript type definitions
├── components/ui/           # Gluestack UI provider
├── assets/                  # Images, fonts, etc.
├── docs/                    # Project documentation
└── App.js                   # Main app entry point
```

## Key Configuration Files

### Navigation Structure
- **Root Navigation:** Stack navigator with Splash, Auth, Onboarding, Paywall, Main
- **Main Navigation:** Bottom tabs (Analytics, Tasks, Settings)
- **Auth Navigation:** Stack for Welcome, Login, Register, ForgotPassword
- **Onboarding Navigation:** Stack for Welcome, TaskIntro, Questions, Animation, PlanDisplay

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (@/src, @/components, etc.)
- Comprehensive type definitions in `/src/types/index.ts`

### Styling System
- **NativeWind:** Tailwind CSS classes for React Native
- **Design Tokens:** Consistent color scheme, typography, spacing
- **Theme:** Light mode only (no dark mode in MVP)
- **Components:** Gluestack UI v2 with custom NativeWind styling

### Firebase Services
- **Authentication:** Email/password, Google Sign-In
- **Database:** Firestore with structured collections
- **Configuration:** Service layer in `/src/services/firebase.ts`

## Critical Implementation Rules

### 🚨 MUST FOLLOW - From CLAUDE_CODE_RULES.md

1. **App Name:** ONLY use "Productivity Morning Routine"
2. **Mobile Only:** React Native for iOS/Android (no web solutions)
3. **Styling:** NativeWind ONLY (no StyleSheet.create())
4. **UI Components:** Gluestack UI v2 copy-paste approach
5. **Navigation:** Bottom tabs: Analytics, Tasks, Settings (Tasks is default)
6. **Business Logic:** Hard paywall after onboarding, no free tier
7. **MVP Tasks:** 4 core habits only (Water, No Phone, Sunlight, Elephant Task)
8. **Subscription Plans:** Weekly ($3.99 with 7-day trial), Annual ($24.99 no trial)
9. **Notifications:** 90 minutes after wake time, weekdays only
10. **Build Order:** Frontend-first approach with mock data

## Agent Responsibilities

### 🔧 Authentication Agent
- **Screens:** LoginScreen, RegisterScreen, ForgotPasswordScreen
- **Components:** LoginForm, RegisterForm, SocialSignIn
- **Services:** Firebase Auth integration
- **Validation:** Form validation with react-hook-form + yup

### 📋 Onboarding Agent  
- **Screens:** All onboarding flow screens (14 questions)
- **Components:** Question components, progress indicators
- **Logic:** Data collection, validation, personalization
- **Animation:** Personalization loading sequence

### 💰 Subscription Agent
- **Screens:** PaywallScreen
- **Components:** PricingPlans, SubscriptionButtons
- **Integration:** RevenueCat or native IAP
- **Logic:** Hard paywall enforcement

### ✅ Tasks Agent
- **Screens:** TasksScreen (main app screen)
- **Components:** TaskItem, TaskList, SubmissionButton
- **Logic:** Daily task completion, scoring system
- **Features:** 4 MVP tasks, binary completion, motivational messages

### 📊 Analytics Agent
- **Screens:** AnalyticsScreen
- **Components:** WeeklyView, ProgressCharts, StreakCounter
- **Logic:** Progress visualization, streak calculation
- **Features:** Dot-based calendar view, completion statistics

### ⚙️ Settings Agent
- **Screens:** SettingsScreen
- **Components:** SettingsItem, TimePicker, ToggleSwitch
- **Features:** Profile management, notification settings, time configuration
- **Validation:** Wake time vs work time validation

## State Management Architecture

### Context API Structure
```typescript
// Auth Context - User authentication state
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Task Context - Daily progress and task management
interface TaskContextType {
  dailyProgress: DailyProgress | null;
  tasks: Task[];
  loading: boolean;
  submitDay: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
}
```

## Data Flow Architecture

1. **App Launch:** Splash → Auth Check → Route to appropriate flow
2. **First-time User:** Auth → Onboarding → Paywall → Main App
3. **Returning User:** Auth Check → Main App (Tasks tab)
4. **Daily Flow:** Tasks completion → Scoring → Analytics update

## Firebase Database Schema

### Collections Structure
- `/users/{userId}` - User profiles and settings
- `/user_progress/{userId}/daily_entries/{date}` - Daily progress tracking
- `/subscriptions/{userId}` - Subscription management
- `/analytics_events/{eventId}` - Analytics and tracking
- `/support_tickets/{ticketId}` - Customer support

### Security Rules
- Users can only access their own data
- Read/write permissions based on authentication
- Subscription validation for premium features

## Development Guidelines

### Code Standards
- **TypeScript:** Strict mode, proper typing
- **Styling:** NativeWind classes only
- **Components:** Functional components with hooks
- **Error Handling:** Comprehensive error states
- **Testing:** Component testing with @testing-library/react-native

### Performance Considerations
- **Navigation:** Lazy loading for screens
- **Images:** Optimized assets with proper sizing
- **Firebase:** Efficient queries with proper indexing
- **Animations:** Performant animations with Reanimated v3

### Accessibility
- **Screen Readers:** VoiceOver/TalkBack support
- **Touch Targets:** Minimum 44x44pt tap targets
- **Color Contrast:** WCAG 2.1 AA compliance
- **Focus Management:** Proper focus indicators

## Integration Points

### Between Agents
1. **Auth → Onboarding:** User profile creation
2. **Onboarding → Paywall:** Completion triggers paywall
3. **Paywall → Tasks:** Subscription enables main app
4. **Tasks → Analytics:** Progress data feeding analytics
5. **Settings → All:** User preferences affecting all features

### External Services
1. **Firebase Auth:** User authentication
2. **Firestore:** Data persistence
3. **Firebase Analytics:** Usage tracking
4. **Push Notifications:** Daily reminders
5. **RevenueCat/IAP:** Subscription management

## Testing Strategy

### Unit Testing
- Utility functions
- Business logic
- Form validation

### Integration Testing
- Firebase services
- Navigation flows
- Context providers

### Component Testing
- Screen components
- UI interactions
- Error states

### End-to-End Testing
- Complete user flows
- Subscription process
- Daily usage cycle

## Deployment Configuration

### Expo Configuration
- **Bundle ID:** com.seifeddinegarbi.productivitymorningroutine
- **App Name:** Productivity Morning Routine
- **Orientation:** Portrait only
- **Target:** iOS 13+, Android 8.0+

### Environment Variables
- Firebase configuration
- RevenueCat API keys
- Analytics tracking IDs

## Ready for Agent Implementation

The foundational architecture is now complete. Each agent can begin implementing their specific features using:

1. **Existing Type Definitions** - Comprehensive interfaces
2. **Service Layer** - Firebase integration ready
3. **Navigation Structure** - Routes configured
4. **Styling System** - NativeWind + Gluestack UI
5. **Utilities** - Helper functions available
6. **Constants** - Configuration centralized

### Next Steps for Agents
1. Implement screens using placeholder components as starting points
2. Add business logic following the established patterns
3. Integrate with Firebase services using the service layer
4. Follow the styling guidelines with NativeWind
5. Maintain TypeScript compliance with existing interfaces

---

**Last Updated:** Project Architect setup complete
**Status:** Ready for agent implementation
**Priority:** Authentication Agent → Onboarding Agent → Tasks Agent → Analytics Agent → Settings Agent → Subscription Agent