# UI/UX Design Rules for Productivity Morning Routine App

## CRITICAL SAFE AREA REQUIREMENTS

### 1. ALWAYS Use SafeAreaView
- **MANDATORY:** Every screen MUST wrap content in `SafeAreaView`
- **MANDATORY:** Every screen MUST include `StatusBar` component
- **NO EXCEPTIONS:** Never allow content to overlap status bar or navigation bars

#### Standard Pattern:
```typescript
import { SafeAreaView, StatusBar } from 'react-native';

const MyScreen = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.light} />
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background.light }}>
        {/* Screen content here */}
      </SafeAreaView>
    </>
  );
};
```

### 2. Button Placement Rules
- **Never place buttons at screen edges** without proper safe area padding
- **Always ensure clickable area** is at least 44px (iOS) / 48px (Android)
- **Skip buttons:** Add padding and background for better visibility
- **Bottom buttons:** Include `pb-8` or similar padding above device navigation

## MODERN UI DESIGN PRINCIPLES

### 3. Shadow and Elevation
- **Cards:** Use `shadow-sm elevation-2` for subtle depth
- **Buttons:** Use `shadow-lg elevation-3` for primary actions
- **Interactive elements:** Add shadows on selection/focus states

```typescript
// Good shadow implementation
style={{
  shadowColor: COLORS.primary[500],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
}}
```

### 4. Visual Feedback Requirements
- **Selection states:** Always show clear visual feedback for selected options
- **Radio buttons:** Use circular indicators with inner dots
- **Checkboxes:** Use square indicators with checkmarks
- **Interactive elements:** Change color, shadow, or scale on interaction

### 5. Spacing and Typography
- **Consistent spacing:** Use multiples of 4px (mb-2, mb-4, mb-6, mb-8)
- **Header hierarchy:** 
  - Screen titles: `text-3xl font-bold`
  - Section titles: `text-xl font-semibold`
  - Body text: `text-base font-medium`
- **Line height:** Always specify `leading-6` or similar for readability

### 6. Button Design Standards
- **Primary buttons:** 
  - `py-5 px-6 rounded-xl shadow-lg elevation-3`
  - Bold text with appropriate emoji
  - Background color with matching shadow color
- **Secondary buttons:**
  - `py-3 px-4 rounded-lg border`
  - Medium font weight
  - Subtle background color

### 7. Progress Indicators
- **Always show progress** in multi-step flows  
- **Progress bars:** Minimum 3px height (`h-3`)
- **Step counters:** Include percentage in styled badge
- **Visual consistency:** Use primary colors for active states

### 8. Card Design
- **Consistent styling:** `rounded-2xl p-6 shadow-sm elevation-2`
- **Border treatment:** Subtle borders with `borderColor: COLORS.background.gray`
- **Icon containers:** Circular backgrounds with `backgroundColor: ${color}30`

## ACCESSIBILITY REQUIREMENTS

### 9. Color Contrast
- **Text on backgrounds:** Ensure WCAG AA compliance
- **Interactive elements:** Minimum 3:1 contrast ratio
- **Focus indicators:** Clear visual focus states

### 10. Touch Targets
- **Minimum size:** 44px x 44px for all interactive elements
- **Spacing:** Minimum 8px between adjacent touch targets
- **Visual feedback:** Immediate response to user interactions

## COMPONENT ARCHITECTURE

### 11. Reusable Components
- **Standardize common patterns** (cards, buttons, inputs)
- **Consistent prop interfaces**
- **Built-in accessibility features**

### 12. State Management
- **Loading states:** Always show loading indicators for async operations
- **Error states:** Clear error messages with recovery actions
- **Empty states:** Helpful guidance when no content exists

## TESTING REQUIREMENTS

### 13. Device Testing
- **Always test on real devices** before deployment
- **Multiple screen sizes:** Ensure responsive design
- **Safe area verification:** Test with different status bar configurations

### 14. Build Verification
- **MANDATORY:** Run `npx expo start --tunnel --clear` before claiming completion
- **Zero errors:** No compilation or bundling errors allowed
- **Import verification:** Ensure all import paths resolve correctly

## ENFORCEMENT

**These rules are MANDATORY for all screens and components. Any code that violates these principles must be refactored before deployment.**

**For Claude Code agents: Always implement these patterns when creating or modifying UI components. No exceptions.**