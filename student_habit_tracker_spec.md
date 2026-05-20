# Student Habit Tracker Dashboard Design Specification

## Overview
A dark mode habit tracking dashboard designed specifically for students with clear visual hierarchy, motivational elements, and intuitive controls to encourage consistent habit formation.

## Color Palette
- Primary Background: #121212 (dark charcoal)
- Secondary Background: #1E1E1E (slightly lighter dark gray)
- Card Background: #252525 (surface for UI elements)
- Text Primary: #FFFFFF (white)
- Text Secondary: #B3B3B3 (light gray)
- Accent Colors:
  - Neon Green (Completed): #32CD32
  - Soft Red (Missed): #FF6B6B
  - Neutral Gray (Pending): #6C757D
- Fire Icon: #FF4500 (orange-red for 🔥 streak visualization)

## Typography
- Font Family: "Roboto", "Inter", or "Open Sans" (sans-serif)
- Headings:
  - H1: 32px, Semi-bold, 1.2 line-height
  - H2: 24px, Medium, 1.3 line-height
  - H3: 18px, Regular, 1.4 line-height
- Body Text:
  - Primary: 16px, Regular, 1.5 line-height
  - Secondary: 14px, Light, 1.4 line-height
- Labels & Captions: 12px, Light, 1.3 line-height

## Layout Structure

### Header Section (Top)
Height: 80px
Elements:
- App Logo/Name (left aligned)
- User Profile Avatar (right aligned)
- Daily Motivational Message (centered below app name)
  - Example: "Great job yesterday! Keep building momentum!"

### Main Dashboard Area

#### Progress Overview Panel
Position: Top-left
Dimensions: 400px width × 200px height
Contents:
- Daily Completion Percentage (Large display: 48px font)
- Progress Bar: Full-width beneath percentage
  - Height: 12px
  - Border-radius: 6px
  - Gradient fill from left (green) to right (red)
- Motivational Subtext: "You've completed X of Y habits today!"

#### Fire Streak Visualization
Position: Top-right
Dimensions: 200px width × 200px height
Contents:
- Large 🔥 Emoji (64px)
- Days Counter: "X Days" (36px bold)
- Subtext: "Current streak" (14px)

### Habits Grid Section
Position: Center
Layout: Responsive grid (minimum 300px per card)
Spacing: 20px gap between cards

#### Individual Habit Card
Dimensions: 300px width × 150px height
Padding: 20px
Border-radius: 12px
Background: #252525
Box-shadow: 0 4px 12px rgba(0,0,0,0.15)

Components:
1. Habit Name (H3, white)
2. Category Tag (Small badge, e.g., "Study", "Health")
3. Large Toggle Control:
   - Dimensions: 80px width × 40px height
   - Thumb size: 36px diameter
   - Active State: Neon Green (#32CD32) background
   - Inactive State: Soft Red (#FF6B6B) background
   - Smooth transition animation (0.3s)
4. Time Stamp: Last completed (small text bottom right)

### Weekly Completion Grid
Position: Bottom
Height: 120px
Layout: Horizontal row of 7 cells
Cell Dimensions: Equal width squares (responsive)
Colors:
- Completed Day: Neon Green (#32CD32)
- Missed Day: Soft Red (#FF6B6B)
- Current Day: Highlighted border
- Future Days: Neutral Gray (#6C757D)

### Action Controls

#### Add New Habit Button
Position: Floating bottom-right
Dimensions: 64px diameter
Style:
- Background: Primary blue or gradient
- "+" Icon centered (24px)
- Shadow effect for depth
- Hover/focus states with scale animation

#### Undo Functionality
Position: Floating bottom-left
Visibility: Appears after habit toggle action
Dimensions: 48px height × 120px width
Style:
- Text: "Undo" (White)
- Icon: ↺ Symbol
- Background: Transparent with border
- Disappears after 5 seconds or manual dismissal

## Spacing System
- Base Unit: 8px
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px
- XXL: 48px
- XXXL: 64px

## Interaction Specifications

### Habit Toggle Interaction
- Target Size: Minimum 48px × 48px (Fitts's Law)
- Feedback:
  - Visual state change (colors)
  - Micro-animation (thumb slide)
  - Haptic feedback if supported
  - Audio confirmation (optional setting)
  
### Progress Animations
- Progress bar fills smoothly with easing
- Number counters animate when changing
- Fire icon pulses gently when streak increases

### Accessibility Features
- Keyboard navigation support
- High contrast mode option
- Screen reader labels for all interactive elements
- Focus indicators for keyboard navigation
- Reduced motion option for animations

## Responsive Behavior
- Mobile (320px-768px): Single column layout
- Tablet (769px-1024px): Two column layout
- Desktop (1025px+): Three column layout
- All elements scale proportionally
- Touch targets increase on mobile

## Edge Cases & Error States
- Empty state for no habits added
- Loading states for data fetching
- Offline indicator
- Error messages with recovery options
- Confirmation for deleting habits