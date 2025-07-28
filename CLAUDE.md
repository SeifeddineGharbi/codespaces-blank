# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**App Name:** "Productivity Morning Routine" (CRITICAL: Use this exact name only)

This is a React Native mobile app (iOS/Android ONLY) built with Expo that helps users implement science-backed morning routines. The app uses a hard paywall model with 4 core habits in the MVP: drink water, no phone usage, sunlight exposure, and identify elephant task.

## Development Commands

```bash
# Start development server
npm start
# or
expo start

# CODESPACES USERS: Use tunnel mode for device testing
npx expo start --tunnel

# Run on Android
npm run android
# or
DARK_MODE=media expo start --android

# Run on iOS
npm run ios
# or
DARK_MODE=media expo start --ios

# Install Expo-compatible dependencies
npx expo install [package-name]

# Add Gluestack UI components
npx gluestack-ui@latest add [component-name]
```

## Technology Stack & Architecture

### Core Technologies
- **Platform:** React Native via Expo (Managed Workflow) - MOBILE ONLY
- **Styling:** NativeWind (Tailwind CSS for React Native) - NO StyleSheet.create()
- **UI Components:** Gluestack UI v2 (copy-paste approach with NativeWind styling)
- **Navigation:** React Navigation v6 with bottom tabs (Analytics, Tasks, Settings)
- **State Management:** React Context API preferred
- **Form Handling:** react-hook-form with yup validation
- **Time Picker:** @react-native-community/datetimepicker
- **Animations:** React Native Reanimated v3 + Lottie for celebrations
- **Icons:** @expo/vector-icons ONLY
- **Backend:** Firebase (Auth, Firestore, Analytics, Push Notifications)

### Key Configuration Files
- `babel.config.js`: Configured for NativeWind with module resolver
- `tailwind.config.js`: Gluestack UI plugin integration with comprehensive color system
- `metro.config.js`: NativeWind integration with global.css input
- `global.css`: Contains base NativeWind styles

### Project Structure
```
/
├── App.js (main entry point)
├── components/ui/gluestack-ui-provider/ (UI provider setup)
├── docs/ (comprehensive project documentation)
├── assets/ (includes logo.png - golden sun design)
├── babel.config.js, tailwind.config.js, metro.config.js
├── CLAUDE_CODE_RULES.md (critical development rules - READ THIS FIRST)
└── package.json
```

## Critical Development Rules (from CLAUDE_CODE_RULES.md)

1. **MOBILE ONLY:** React Native app for iOS/Android - NEVER suggest web React solutions
2. **LIGHT MODE ONLY:** No dark mode implementation whatsoever
3. **NativeWind for ALL Styling:** Use only Tailwind classes, never StyleSheet.create()
4. **Gluestack UI v2:** Use copy-paste components, don't build UI from scratch
5. **Expo Compatibility:** Only use expo-compatible packages (react-native-*, @react-native-community/*, expo-*)
6. **Firebase Backend:** Use Firebase for all backend needs
7. **IMPORT PATHS:** ALWAYS use configured aliases - NEVER use relative paths like `../../../`

## Import Path Rules (CRITICAL)

**ALWAYS use these configured aliases from babel.config.js:**
- UI Components: `@/components/ui/button` (NOT `../../../../components/ui/button`)
- Services: `@/services/firebase` (NOT `../../services/firebase`)  
- Types: `@/types` (NOT `../../types/index`)
- Constants: `@/constants` (NOT `../../constants/index`)
- Screens: `@/screens/auth/LoginScreen` (NOT `../auth/LoginScreen`)
- Utils: `@/utils` (NOT `../../utils/index`)
- Hooks: `@/hooks/useAuth` (NOT `../../hooks/useAuth`)

**Example Correct Imports:**
```typescript
// ✅ CORRECT - Use aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS } from '@/constants';

// ❌ WRONG - Never use relative paths
import { Button } from '../../../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
```

## App Flow & Business Logic

### Core User Journey
1. **First-time:** Welcome → Register/Login → Onboarding (14 questions) → Paywall → Main App
2. **Daily:** Wake up → 90min notification → Complete 4 tasks → Submit → View score
3. **Navigation:** 3 tabs - Analytics (left), Tasks (middle, default), Settings (right)

### Business Rules (NO EXCEPTIONS)
- **Hard Paywall:** After onboarding completion, no free tier
- **Subscription Plans:** 
  - Weekly: $3.99/week WITH 7-day free trial
  - Annual: $24.99/year with NO FREE TRIAL
- **Notifications:** 90 minutes after wake time, weekdays only (no weekends)
- **Daily Reset:** Tasks reset at 3:00 AM
- **Time Validation:** Work start time must be later than wake time

### MVP Habits (4 Core Tasks)
1. 💧 Drink Water (Blue) - 25% weight
2. ⛔ No Phone Usage (Red) - 25% weight  
3. ☀️ Sunlight Exposure (Yellow) - 25% weight
4. 🐘 Elephant Task (Green) - 25% weight

## Development Approach

### Build Order (Frontend-First)
1. **Phase 1:** Complete frontend with mock data
   - Navigation structure with React Navigation v6
   - Authentication UI (non-functional initially)
   - Onboarding flow (14 screens with validation)
   - Paywall screen with subscription plans
   - Main app UI (Tasks, Analytics, Settings)
   - Polish & animations

2. **Phase 2:** Backend integration
   - Firebase setup & authentication
   - Database integration with Firestore
   - Subscription system (RevenueCat recommended)
   - Push notifications (Firebase Cloud Messaging)

3. **Phase 3:** Production ready
   - Analytics & monitoring
   - Testing & polish

### Form Validation & Time Handling
- Use react-hook-form with yup for schema validation
- Time validation: work time > wake time (handle edge cases like 11 PM wake, 1 AM work)
- Interactive time pickers using @react-native-community/datetimepicker
- Clear error messages with skip functionality for optional fields

### Animation Strategy (Hybrid Approach)
- **UI Interactions:** Gluestack UI v2 built-in animations + NativeWind utility classes
- **Celebration Effects:** Lottie animations (lottie-react-native) for task completion
- **Micro-interactions:** scale-105, opacity-75 utility classes
- **Complex Animations:** React Native Reanimated v3 integration

## Firebase Integration
- **Authentication:** @react-native-firebase/auth (email/password + Google Sign-in)
- **Database:** @react-native-firebase/firestore for user profiles, onboarding responses, daily progress
- **Analytics:** @react-native-firebase/analytics for user behavior tracking
- **Push Notifications:** Firebase Cloud Messaging via Expo

## Testing Strategy
- **Primary:** Android device via Expo Go (continuous testing)
- **Codespaces Users:** Use `npx expo start --tunnel` for device testing
- **Production:** EAS Build for app store submission
- Use @testing-library/react-native with jest for unit tests

## Logo Usage
- Logo file: `/assets/logo.png` (golden sun design)
- Use React Native Image component to display

## Documentation
Comprehensive project documentation available in `/docs/`:
- `project_requirements.md`: Detailed functional requirements
- `structured_app_idea.md`: App concept and flow
- `Detailed_app_flow.md`: Complete user journey
- `database_schema_design.md`: Data architecture
- `sample_content_data.md`: Sample content structure

## Task Completion & Testing Protocol

**CRITICAL RULE:** After completing each task (major prompt from user), Claude Code MUST:

1. **Test Build First:** Always run `npx expo start --tunnel` and fix ALL errors before asking user to test
2. **Ensure Clean Build:** No bundling errors, import errors, or compilation failures allowed
3. **Only Then Provide:** Testing instructions, expected results, and commit message after confirming app builds successfully

**NEVER ask user to test if `npx expo start --tunnel` shows any errors - fix them first!**