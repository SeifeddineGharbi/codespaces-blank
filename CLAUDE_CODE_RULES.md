# CRITICAL RULES FOR CLAUDE CODE - HIGHEST PRIORITY

## 🏷️ APP IDENTITY
**APP NAME: "Productivity Morning Routine"**
- This is the ONLY correct name. Ignore any other names mentioned in documents.
- Use this exact name in all code, comments, and configurations
- Do NOT use "Productivity Dawn", "Morning Mastery" or any other variations

## 🚨 PLATFORM RULES
1. **MOBILE ONLY**: This is a React Native app for iOS/Android. NEVER suggest web React solutions.
2. **Use ONLY React Native compatible libraries** (react-native-*, @react-native-community/*, expo-*)
3. **NativeWind for ALL styling** - No StyleSheet.create(), only Tailwind classes

## 🛠️ DEVELOPMENT APPROACH
1. **UI Components**: Use Gluestack UI v2 copy-paste components with NativeWind styling - Never build UI components from scratch
2. **ALWAYS use existing libraries** - Never build custom solutions when reliable libraries exist
3. **Expo Managed Workflow** - Use expo-compatible packages only
4. **Test with Expo Go** during development
5. **Firebase for ALL backend needs** (Auth, Firestore, Analytics, Push Notifications)

## 📱 KEY TECHNICAL CONSTRAINTS
1. **Navigation**: React Navigation v6 with bottom tabs (3 tabs: Analytics, Tasks, Settings)
2. **State Management**: React Context API (no Redux unless absolutely necessary)
3. **Form Validation**: react-hook-form with yup
4. **Time Picker**: @react-native-community/datetimepicker
5. **Animations**: react-native-reanimated v3
6. **UI Components**: Gluestack UI v2 (copy-paste approach with NativeWind)
7. **Component Installation**: npx gluestack-ui@latest add [component-name]
8. **Icons**: @expo/vector-icons ONLY

## 🎯 APP FLOW (NEVER DEVIATE)
1. App Launch → Auth Check → Route to appropriate screen
2. First-time user: Welcome → Register/Login → Onboarding (14 questions) → Paywall → Main App
3. Returning user: Splash → Main App (Tasks tab)
4. Daily flow: Wake up → 90min later notification → Complete 8 tasks → Submit → See score

## 💰 BUSINESS LOGIC (CRITICAL - NO EXCEPTIONS)
1. **HARD PAYWALL** after onboarding - No free tier
2. **Subscription Plans**:
   - Weekly: $3.99/week WITH 7-day free trial
   - Annual: $24.99/year with NO FREE TRIAL (immediate payment)
3. **Weekday notifications only** - Never on weekends
4. **90 minutes after wake time** - Fixed, not configurable

## 🎨 DESIGN RULES
1. **Light mode only** - No dark mode
2. **Clean, minimalist** - Productivity-focused
3. **Animation Strategy**: 
   - UI interactions: Gluestack UI v2 + NativeWind utility classes
   - Celebration effects: Lottie animations for task completion
   - Complex animations: React Native Reanimated v3
4. **Progress tracking** with charts and streaks
5. **Never hard code status bar** when given a screenshot of another app tp copy its design

## ⚠️ COMMON PITFALLS TO AVOID
1. Don't use web-only libraries
2. Don't create custom components when Expo/RN provides them
3. Don't forget time validation (work time > wake time)
4. Don't allow weekend notifications
5. Don't implement complex state management early
6. Don't give free trial for annual plan
7. Don't use any app name other than "Productivity Morning Routine"
8. Don't build custom UI components - use Gluestack UI v2 copy-paste approach whenever possible

## 🏗️ BUILD ORDER (FRONTEND-FIRST APPROACH)

### Phase 1: Complete Frontend with Mock Data
1. **Project Setup & Navigation Structure**
   - Set up React Navigation v6 with tab navigator
   - Create all screen components (empty for now)
   - Implement navigation flow with mock auth state

2. **Welcome & Authentication UI**
   - Welcome screen with animations
   - Login screen with form validation (local only)
   - Registration screen with password requirements UI
   - Google Sign-in button (non-functional)

3. **Onboarding Flow (14 screens)**
   - All question screens with proper validation
   - Time picker implementation
   - Progress indicator
   - Skip functionality
   - Local state management for responses

4. **Paywall Screen**
   - Subscription plan UI (Weekly with trial, Annual without)
   - Plan selection interaction
   - Terms and restore purchase buttons (non-functional)

5. **Main App UI**
   - Tasks screen with 4 morning routine items (The app in its final state will have 8 habit but for the sake of simplicity we'll have 4 habits for the MVP version)
   - Checkbox interactions and animations
   - Score calculation and motivational messages
   - Analytics screen with mock charts
   - Settings screen with all options

6. **Polish & Animations**
   - Celebration animations for task completion
   - Screen transitions
   - Loading states
   - Error states UI

### Phase 2: Backend Integration
7. **Firebase Setup & Authentication**
   - Firebase project configuration
   - Email/password authentication
   - Google Sign-in integration
   - Auth state persistence

8. **Database Integration**
   - Firestore setup
   - User profile creation
   - Onboarding responses storage
   - Daily progress tracking

9. **Subscription System**
   - RevenueCat or native IAP integration
   - Subscription validation
   - Trial period logic (weekly only)

10. **Push Notifications**
    - Firebase Cloud Messaging setup
    - 90-minute delay logic
    - Weekday-only scheduling

### Phase 3: Production Ready
11. **Analytics & Monitoring**
    - Firebase Analytics events
    - Crash reporting
    - Performance monitoring

12. **Final Testing & Polish**
    - End-to-end testing
    - App store assets
    - Privacy policy & terms


13. **Logo Usage**
- Logo file: `/assets/logo.png` (golden sun design)
- React Native: Use Image component to display


## 🌍 FUTURE-PROOFING
- Structure for easy internationalization (i18n ready)
- Modular components for easy updates
- Clean separation of concerns
- Comprehensive error handling