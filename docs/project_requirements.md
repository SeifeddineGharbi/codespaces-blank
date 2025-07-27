# **1. Project Overview**

## **1.1 App Concept**

**Mission:** Science-backed morning routine app that helps users implement 8 science-backed simple for productive mornings and better mood while maintaining accountability without spam.

**Unique Selling Proposition:** "CONQUER your day with THE science-backed morning routine."

**Target Platform:** Cross-platform mobile app (iOS & Android)

## **1.2 Success Metrics**

- Conversion from starting onboarding to first payment (free trials then canceled don't count)
- User retention rate (Day 7, Day 30)
- Percentage of users submitting on weekdays
- App/play store ratings and reviews
- Number of downloads

# **2. Target Audience: Primary User Persona**

**Students:** University and college students

**Employees:** Office, remote, and hybrid workers

**Entrepreneurs:** Business owners and freelancers

**Global Audience:** Worldwide availability with English as primary language at first then integrating the top world languages, the app development should take that into consideration from the beginning to make adding new languages in the next versions super easy.

# **3. Functional Requirements**

## **3.1 Authentication System**

### **3.1.1 User Registration**

**Requirements:**

- Email registration with password
- Google Sign-In integration
- Account verification via email confirmation

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## **3.1.2 User Sign-In**

**Features:**

- Email and password authentication
- Google Sign-In option
- Remember me functionality
- Forgot password flow

## **3.2 Onboarding System**

### **3.2.1 Personalization Questions**

For the question, refer to the Detailed App flow Document

### **3.2.2 Data Validation**

- Time validation: Work start time must be later than wake-up time Required field validation with clear error messages
- Optional field handling with skip functionality
- Progress tracking throughout onboarding

## **3.3 Core App Features**

## **3.3.1 Daily Task System**

**Morning Routine Checklist:**

- Waking up at the same time
- Hydration (drink water)
- No phone before getting out of bed
- Natural light exposure
- Enter your bubble
- Identify the ONE task for the day
- Skip the sugar rush
- Delay caffeine intake

**Scoring System:**

- Each completed task = points
- Completion percentage calculation
- Streak tracking
- Motivational messaging based on performance

### **3.3.2 Progress Analytics**

- Daily completion rates
- Weekly progress charts
- Monthly overview statistics
- Streak milestones and celebrations
- Personal improvement insights

## **3.4 Navigation & User Interface**

### **3.4.1 Tab Navigation**

**3 Primary Tabs (Bottom Navigation):**

1. **Analytics (Left)** - Progress tracking and statistics

2. **Tasks (Middle)** - Daily checklist (Default tab)

3. **Settings (Right)** - User preferences and app settings

## **3.4.2 Settings Features**

**Settings Options:**

- User profile information
- Wake time modification (interactive time picker)
- Work/study start time modification (interactive time picker); must be later than wake up time
- Push notification preferences (enable/disable only)
- Log out functionality
- Contact support (email integration)
- Privacy policy access
- Terms of service access
- App version information

## **3.5 Notification System**

### **3.5.1 Push Notifications**

**Timing:** 90 minutes after user's specified wake time (fixed, not configurable)

**Content:** Friendly reminder to complete morning checklist

**Frequency:** Once daily, just on weekdays!!! (no notifications on the weekend for this version of the app)

**User Control:** Users can enable/disable notifications in settings

**Sample Messages:**

"Ready to CONQUER your day? ✨"

"Your morning routine is waiting!"

"Time to build those winning habits!"

## **4. Technical Requirements**

### **4.1 Technology Stack**

### **4.1.1 Development Philosophy**

**Prioritize Reliable Libraries Over Custom Code:** Always use well-established, maintained libraries for React Native (that work for both Android and iOS apps) instead of building functionality from scratch when reliable solutions exist. This reduces development time, bugs, and maintenance overhead. Prefer libraries with big communities and clear documentations.

**Utility-First Styling:** Use NativeWind (Tailwind for React Native) for consistent, maintainable, and rapid UI development. This approach ensures design consistency across the entire application while speeding up development time.

**Performance-First:** Optimize for smooth 60fps animations, fast app launch times, and efficient memory usage across all supported devices.

UI Component Library Strategy: Use Gluestack UI v2 copy-paste approach for rapid development. Combines pre-built, accessible components with full customization via NativeWind styling. 

### **4.1.2 Frontend & Development Environment**

**Development Platform:** Expo with React Native (Managed Workflow)

**Framework:** React Native via Expo CLI

**Platform Support:** iOS 13+ and Android 8.0+

**Development Environment:** GitHub Codespaces + Claude Code

**Testing:** Expo Go app during development

**Building:** EAS Build for production app store submission

**Core Technologies:**

**Styling:** NativeWind (Tailwind CSS for React Native)

**Navigation:** React Navigation v6

**State Management:** React Context API or Redux Toolkit

Animation Strategy (Hybrid Approach): 

- UI Interactions: Gluestack UI v2 built-in animations + NativeWind utility classes
- Celebration Effects: Lottie animations (lottie-react-native) for achievement moments
- Micro-interactions: Gluestack UI components with scale-105, opacity-75 classes
- Complex Animations: React Native Reanimated v3 integration with Gluestack components"

### **4.1.3 Expo-Compatible Libraries**

**Form & Input Management:**

Time Picker: @react-native-community/datetimepicker (via npx expo install )

Form Validation: react-hook-form with yup for schema validation

Time Validation: Custom validation rules for time comparison logic

UI Component Library: Gluestack UI v2 (copy-paste components with NativeWind)
Input Components: Gluestack UI v2 components + react-native-elements (fallback)
Loading Indicators: Gluestack UI v2 components with custom NativeWind styling
Progress Bars: Gluestack UI v2 components with custom styling

**UI & Styling:**

Styling: nativewind (Tailwind CSS for React Native)

Icons: @expo/vector-icons (preferred over react-native-vector-icons)

Gradients: expo-linear-gradient (instead of react-native-linear-gradient)

SVG Support: react-native-svg (via npx expo install )

Animation Strategy (Hybrid Approach): 

- UI Interactions: Gluestack UI v2 built-in animations + NativeWind utility classes
- Celebration Effects: Lottie animations (lottie-react-native) for achievement moments
- Micro-interactions: Gluestack UI components with scale-105, opacity-75 classes
- Complex Animations: React Native Reanimated v3 integration with Gluestack components"

**Authentication & Security:**

- Biometric Auth: react-native-biometrics (future enhancement)
- Keychain Storage: react-native-keychain for secure token storage
- Password Strength: zxcvbn for password strength validation

**Device & Platform:**

- **Push Notifications:** expo-notifications (simpler than Firebase messaging)
- **Local Storage:** @react-native-async-storage/async-storage
- **Device Info:** expo-device and expo-constants
- **App State:** @react-native-community/netinfo for connectivity
- **Permissions:** expo-permissions

**Development & Testing:**

- **Testing:** @testing-library/react-native with jest
- **Development:** @expo/cli and eas-cli
- **Code Quality:** eslint with prettier
- **Debugging:** Expo development tools

### **4.1.4 Backend Services**

**Backend-as-a-Service:** Firebase

**Authentication:** Firebase Authentication

**Database:** Cloud Firestore

**Cloud Functions:** Firebase Functions (for business logic)

**Analytics:** Firebase Analytics

**Crash Reporting:** Firebase Crashlytics

**Push Notifications:** Firebase Cloud Messaging (FCM) via Expo

**Firebase Integration Libraries:**

- Core: @react-native-firebase/app
- Authentication: @react-native-firebase/auth
- Firestore: @react-native-firebase/firestore
- Analytics: @react-native-firebase/analytics
- Crashlytics: @react-native-firebase/crashlytics

### **4.1.5 Payment Processing**

**iOS:** Apple Pay integration via App Store Connect

**Android:** Google Pay integration via Google Play Billing

**Subscription Management:** RevenueCat (recommended for cross-platform)

**Library:** react-native-purchases (RevenueCat SDK)

**What is RevenueCat?** RevenueCat is a subscription management platform that simplifies in-app purchases:

Cross-platform: Handles both iOS and Android subscriptions with one SDK Analytics: Detailed subscription metrics, churn analysis, revenue tracking

Webhooks: Real-time notifications for subscription events

Receipt validation: Automatic validation and fraud prevention

A/B testing: Built-in paywall experimentation tools

Customer support: Easy subscription management interface

Easier than native: Avoids complex Apple StoreKit and Google Play Billing APIs 4.1.6 Development Workflow & Environment

**Primary Development:** GitHub Codespaces (cloud-based, no local setup required) **AI Assistant:** Claude Code for React Native development

**Real-time Testing:** Expo Go app on Android device

**Command Pattern:** Use npx expo install instead of npm install for React Native dependencies

**Configuration:** Single app.json file instead of platform-specific configurations

**Testing Strategy:**

- **Primary:** Android device via Expo Go (continuous testing)
- **Secondary:** iOS testing at 3 key milestones via flatmate's device
- **Production:** Native builds for app store submission

### **4.2 Data Architecture**

### **4.2.1 User Data Structure**

- User profile information
- Onboarding responses
- Daily task completion records
- Progress analytics data
- Subscription status
- Notification preferences

### **4.2.2 Internationalization Preparation**

- **Text Externalization:** String externalization using i18n libraries
- **Modular Content Structure:** Organized text content with key-value mapping **Date/Time Localization:** Built-in support for different date/time formats
- **Number Formatting:** Localized number and currency formatting
- **RTL Layout Support:** NativeWind classes support right-to-left languages
- **Flexible UI Components:** Utility-first styling adapts to different text lengths **Multi-language Readiness:** Prepare for future Spanish, French, German, Portuguese support

### **4.3 Design Specifications**

### **4.3.1 Visual Design & Styling**

- **Styling Framework:** NativeWind (Tailwind CSS for React Native)
- **Design Approach:** Utility-first CSS with consistent design tokens
- **Theme:** Light mode only (no dark mode in v0)
- **UI Style:** Clean, minimalist, encouraging, productivity-focused
- Component Development Approach: Gluestack UI v2 copy-paste components
as foundation, customized with NativeWind utility classes

**Typography System (NativeWind Classes):**

- Headers: text-3xl font-bold (SF Pro Display, 28pt equivalent)
- Subheaders: text-xl font-semibold (SF Pro Text, 20pt equivalent)
- Body Text: text-base font-normal (SF Pro Text, 16pt equivalent)
- Captions: text-sm font-normal (SF Pro Text, 14pt equivalent)

**Component Styling Examples:**

- Primary Buttons: Gluestack UI Button with custom NativeWind classes
- Task Items: Gluestack UI Card components with flex-row items-center styling
- Cards: Gluestack UI Card with bg-white rounded-2xl customizations
- Time Pickers: Native iOS/Android components with consistent wrapper styling
- Forms: Gluestack UI Input components with consistent wrapper styling

**Animation Integration:**

- Smooth transitions: React Native Animated API with NativeWind classes
- Micro-interactions: scale-105 , opacity-75 utility classes
- Celebration effects: Lottie animations with NativeWind layout classes

### **4.3.2 Accessibility & Responsive Design**

- **Screen Reader Support:** VoiceOver/TalkBack compatibility with semantic HTML-like structure
- **High Contrast Ratios:** WCAG 2.1 AA compliance with NativeWind color system
- **Touch Target Sizes:** Minimum 44x44pt tap targets using p-4 or larger padding classes
- **Keyboard Navigation:** Full keyboard accessibility support
- **Text Scaling:** Dynamic type support with responsive text classes
- **Color Independence:** Information conveyed through more than just color
- **Focus Management:** Clear focus indicators with focus: utility classes
- **Cross-Platform Consistency:** NativeWind ensures consistent accessibility across iOS and Android

## **5. Business Requirements**

### **5.1 Monetization Strategy**

### **5.1.1 Subscription Model**

- **Weekly** 7-day free trial Full access to all features
- **Annual** $24.99/year Full access to all features No trial

### **5.1.2 Paywall Strategy**

- **Timing:** Immediately after onboarding completion
- **Type:** Hard paywall (no free tier)
- **Positioning:** Premium, science-backed solution
- **Value Proposition:** "Cost of one coffee per week for life-changing habits"
- **Payment Options:** Apple Pay, Google Pay, Credit Card

### **5.2 Legal & Compliance**

### **5.2.1 Privacy & Data Protection**

**Global Compliance Requirements:**

- GDPR (European Union)
- CCPA (California)
- PIPEDA (Canada)
- Privacy Act (Australia)

**Required Legal Documents:**

- Privacy Policy (comprehensive, covering global regulations)
- Terms of Service
- Cookie Policy (if applicable)
- Data Processing Agreement

**Data Handling:**

- Minimal data collection principle
- User consent for data processing
- Right to data deletion
- Data portability (future consideration)
- Secure data transmission (HTTPS/TLS)
- Gender Data: Handle sensitively, always include "prefer not to say" option, never required for core functionality
- Optional Data: Marketing attribution data (how they heard about us) stored separately and can be null
- 5.2.2 App Store Compliance

**iOS App Store:**

- Content rating: 4+ (no objectionable content)
- App Privacy labels configuration
- In-App Purchase compliance
- Human Interface Guidelines adherence

**Google Play Store:**

- Content rating: Everyone
- Data safety section completion
- Google Play Billing compliance
- Material Design Guidelines adherence

## **6. User Experience Requirements**

### **6.1 User Journey Flows**

### **6.1.1 First-Time User Flow**

1. App Download → App Store installation

2. Account Creation → Email/Google sign-up

3. Email Verification → Account activation

4. Onboarding Questions → 14 personalization questions (first one optional)

5. Personalization Animation → Custom plan generation

6. Paywall → Subscription selection

7. Setup Completion → Final wake time confirmation

8. First Daily Use → Initial checklist completion

### **6.1.2 Daily User Flow**

1. Wake Up → Natural routine (no immediate app interaction)

2. 90 Minutes Later → Push notification reminder (fixed timing)

3. Open App → Daily checklist display

4. Complete Tasks → Check off completed habits

5. Submit → View score and motivational message

6. Optional → Check analytics and progress

### **6.1.3 Returning User Flow**

1. App Launch → Direct to Tasks tab

2. Authentication Check → Auto-login if session valid

3. Daily Tasks → Continue where left off

4. Progress Review → Optional analytics viewing

## **7. Quality Assurance & Testing**

### **7.1 Testing Strategy**

### **7.1.1 Testing Types**

- **Unit Testing:** Core business logic functions and utility helpers
- **Integration Testing:** Firebase service integrations and API connections
- **Component Testing:** UI component behavior with NativeWind styling
- **Visual Testing:** Style consistency across different screen sizes
- **Performance Testing:** App launch time, memory usage, animation smoothness **Security Testing:** Authentication flows and data protection
- **Accessibility Testing:** Screen reader navigation and touch target sizes
- **Device Testing:** Multiple iOS and Android devices with different screen sizes

### **7.1.2 Test Scenarios**

**Critical Paths:**

- Complete user registration and onboarding (including optional skip functionality) Interactive time picker functionality (wake time and work start time selection)
- Time validation: Test work start time cannot be earlier than wake up time Daily task completion and submission
- Subscription purchase and management
- Push notification delivery and handling (fixed 90-minute timing)
- Offline/online state transitions
- Data synchronization across sessions
- Gender data privacy and optional field handling
- Settings modification for both time fields with validation
- Edge case testing: Time validation across midnight (11 PM wake up, 1 AM work start)

## **7.2 Performance Requirements**

### **7.2.1 Performance Benchmarks**

- **App launch time:** Under 3 seconds on average devices
- **Screen transition time:** Under 500ms
- **API response time:** Under 2 seconds for all requests
- **Memory usage:** Under 100MB during normal operation
- **Battery impact:** Minimal background processing

### **7.2.2 Scalability Considerations**

- **User capacity:** Support for 100,000+ concurrent users
- **Database performance:** Optimized Firestore queries
- **CDN usage:** Static asset delivery optimization
- **Caching strategy:** Local storage for frequently accessed data

8. Support & Maintenance

8.1 Customer Support Channels

- **In-app support:** Contact form with categorized issues
- **Email support:** Dedicated support email address
- **App store reviews:** Monitor and respond to user feedback 9.1.2 Support Categories
- **Technical Issues:** App crashes, login problems, sync issues
- **Billing Questions:** Subscription management, refunds
- **Feature Requests:** User suggestions and improvements
- **General Inquiries:** General questions about the app

## **9. Analytics & Monitoring**

### **9.1 Key Performance Indicators**

- **User Acquisition:** Daily/monthly active users
- **Engagement:** Daily task completion rates
- **Retention:** Day 1, Day 7, Day 30 retention rates
- **Conversion:** Onboarding to subscription conversion rate
- **Performance:** App crash rates, API response times
- **Business:** Monthly recurring revenue, churn rate

### **9.2 Monitoring Tools**

- **Firebase Analytics:** User behavior and engagement tracking
- **Firebase Crashlytics:** Crash reporting and error monitoring
- **Custom Events:** Task completion, subscription events
- **Performance Monitoring:** App startup time, network requests

## **10. Risk Assessment & Mitigation**

### **10.1 Technical Risks**

**High Priority:**

Firebase service outages → Multi-region deployment

App store rejection → Compliance review process

Payment processing issues → Multiple payment provider backup

**Medium Priority:**

Performance issues on older devices → Device-specific optimization Third-party dependency failures → Alternative library research

### **10.2 Business Risks**

**High Priority:**

Low subscription conversion → A/B testing different paywall strategies High user churn → Enhanced onboarding and engagement features Competitive pressure → Unique feature differentiation

**Medium Priority:**

Seasonal usage patterns → Retention campaigns

Negative app store reviews → Proactive customer support

### **10.3 Legal & Compliance Risks**

**High Priority:**

Privacy regulation violations → Legal review and compliance audit

App store policy changes → Regular policy monitoring

Payment processing compliance → Regular security audits

## **11. Future Considerations (Post-V0)**

### **11.1 Planned Features**

- **Multi-language support:** Spanish, French, German, Portuguese
- **Advanced analytics:** Detailed habit correlation insights
- **Social features:** Friend challenges and leaderboards
- **Customizable routines:** User-defined habit modifications
- **Integration:** Apple Health, Google Fit connectivity

## **11.2 Platform Expansion**

**Web app:** Progressive Web App (PWA) for desktop users

**Wearable integration:** Apple Watch and Android Wear support

**Voice assistants:** Alexa and Google Assistant integration

# **Conclusion**

This document serves as the comprehensive foundation for developing Productivity Morning routine App

**Document Version:** 1.1

**Last Updated:** [Current Date]

**Next Review Date:** [Date + 2 weeks]

*This document is confidential and proprietary. Distribution is restricted to authorized project stakeholders only.*