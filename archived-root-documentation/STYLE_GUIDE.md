# UI/UX Style Guide - Quick Reference

## 🎨 Color Palette

### Primary Colors (Purple Gradient Theme)
```css
Primary:   #8b5cf6  →  #a78bfa  (gradient)
Hover:     #7c3aed  →  #9333ea  (gradient)
```

### Semantic Colors
```css
Success:   #22c55e  (Green)
Warning:   #f59e0b  (Orange)
Danger:    #ef4444  (Red)
Info:      #3b82f6  (Blue)
```

### Dark Theme
```css
Background:  #0a0a0f  →  #141420  (gradient)
Surface:     #1a1a28
Border:      rgba(139, 92, 246, 0.15)
Text:        #f8fafc (primary), #cbd5e1 (secondary)
```

### Light Theme
```css
Background:  #ffffff  →  #f1f5f9  (gradient)
Surface:     #ffffff
Border:      #e5e7eb
Text:        #0f172a (primary), #475569 (secondary)
```

---

## 📏 Typography

### Font Families
```css
Sans:    'Inter', 'Segoe UI', system-ui, sans-serif
Mono:    'JetBrains Mono', 'Fira Code', monospace
Display: 'Plus Jakarta Sans', 'Inter', sans-serif
```

### Font Sizes
```css
xs:    0.75rem   (12px)
sm:    0.875rem  (14px)
base:  1rem      (16px)
lg:    1.125rem  (18px)
xl:    1.25rem   (20px)
2xl:   1.5rem    (24px)
3xl:   1.875rem  (30px)
```

### Font Weights
```css
normal:    400
medium:    500
semibold:  600
bold:      700
```

---

## 📐 Spacing (4px Grid System)

```css
1:   0.25rem  (4px)
2:   0.5rem   (8px)
3:   0.75rem  (12px)
4:   1rem     (16px)
6:   1.5rem   (24px)
8:   2rem     (32px)
12:  3rem     (48px)
```

### Common Use Cases
```css
Component Padding:  p-6      (24px)
Card Padding:       p-6      (24px)
Gap Between Items:  gap-4    (16px)
Section Spacing:    space-y-6 (24px)
```

---

## 🔲 Border Radius

```css
sm:    0.375rem  (6px)   - Small elements
base:  0.5rem    (8px)   - Input fields
md:    0.75rem   (12px)  - Badges, pills
lg:    1rem      (16px)  - Buttons
xl:    1.25rem   (20px)  - Cards (use rounded-2xl)
2xl:   1.5rem    (24px)  - Large cards
full:  9999px            - Circular elements
```

### Usage
```jsx
<button className="rounded-lg">   {/* Buttons */}
<div className="rounded-2xl">     {/* Cards */}
<span className="rounded-full">   {/* Badges */}
```

---

## 🌟 Shadows & Elevation

### Shadow Scale
```css
xs:    0 1px 2px rgba(0,0,0,0.05)      - Subtle
sm:    0 2px 4px rgba(0,0,0,0.08)      - Input fields
base:  0 4px 8px rgba(0,0,0,0.12)      - Default cards
md:    0 8px 16px rgba(0,0,0,0.15)     - Elevated cards
lg:    0 12px 24px rgba(0,0,0,0.18)    - Modals
xl:    0 16px 32px rgba(0,0,0,0.20)    - Dropdowns
```

### Glow Effects
```css
Primary:   0 0 20px rgba(139, 92, 246, 0.4)
Success:   0 0 20px rgba(34, 197, 94, 0.4)
Danger:    0 0 20px rgba(239, 68, 68, 0.4)
```

---

## ⏱️ Transitions & Animations

### Duration
```css
fast:    150ms  - Small UI changes
base:    200ms  - Standard interactions
medium:  300ms  - Larger movements
slow:    500ms  - Major state changes
```

### Timing Functions
```css
ease-out:    cubic-bezier(0, 0, 0.2, 1)        - Entrances
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)      - State changes
bounce:      cubic-bezier(0.68, -0.55, 0.265, 1.55)  - Playful
```

### Common Animations
```jsx
className="transition-all duration-300"        // Smooth transitions
className="hover:-translate-y-1"              // Lift on hover
className="hover:scale-110"                   // Scale on hover
className="animate-pulse"                     // Pulsing effect
```

---

## 📱 Breakpoints

```css
xs:   475px   - Small phones
sm:   640px   - Large phones
md:   768px   - Tablets
lg:   1024px  - Small desktops
xl:   1280px  - Large desktops
2xl:  1536px  - Extra large screens
```

### Responsive Classes
```jsx
// Mobile first approach
<div className="w-full lg:w-1/2">  // Full width on mobile, half on desktop
<div className="grid grid-cols-1 lg:grid-cols-4">  // 1 col mobile, 4 desktop
```

---

## 🎯 Component Patterns

### Card Component
```jsx
<div 
  className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
  style={{
    background: isDark
      ? 'linear-gradient(135deg, rgba(26, 26, 40, 0.95) 0%, rgba(31, 31, 46, 0.95) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 251, 255, 0.95) 100%)',
    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)'}`,
    boxShadow: isDark
      ? '0 4px 16px rgba(0, 0, 0, 0.3)'
      : '0 4px 16px rgba(0, 0, 0, 0.08)',
  }}
>
  {/* Card content */}
</div>
```

### Primary Button
```jsx
<button
  className="rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105"
  style={{
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
  }}
>
  Click Me
</button>
```

### Icon Container
```jsx
<div
  className="flex h-12 w-12 items-center justify-center rounded-xl"
  style={{
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
  }}
>
  <Icon className="h-6 w-6 text-white" />
</div>
```

### Stat Card with Trend
```jsx
<div className="rounded-2xl p-6 hover:-translate-y-1 transition-all">
  <p className="text-sm text-slate-400">Label</p>
  <p className="mt-2 text-3xl font-bold text-white">$123,456</p>
  <div className="mt-2 flex items-center gap-1">
    <ArrowUpRight className="h-4 w-4 text-green-500" />
    <span className="text-sm font-semibold text-green-500">+2.34%</span>
  </div>
</div>
```

---

## ♿ Accessibility Guidelines

### Minimum Touch Target
```css
min-height: 44px;
min-width: 44px;
```

### Color Contrast
- **Normal text**: 4.5:1 ratio minimum
- **Large text**: 3:1 ratio minimum
- **Interactive elements**: 3:1 ratio minimum

### ARIA Attributes
```jsx
<button aria-label="Close menu">      {/* For icon-only buttons */}
<nav role="navigation">                {/* Landmark roles */}
<div aria-live="polite">               {/* Live regions */}
<button aria-expanded={isOpen}>        {/* Collapsible states */}
```

### Keyboard Navigation
- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Escape**: Close modals/overlays
- Focus states must be visible

---

## 🎭 Animation Best Practices

### Use GPU-Accelerated Properties
```css
✅ transform, opacity
❌ width, height, top, left
```

### Timing
```css
Micro-interactions:  150ms
Button clicks:       200ms
Modal opens:         300ms
Page transitions:    500ms
```

### Example
```jsx
<div className="transition-transform duration-300 hover:scale-105">
  {/* Smooth scale on hover */}
</div>
```

---

## 🔧 Utility Classes Reference

### Flexbox Layouts
```jsx
className="flex items-center justify-between"     // Horizontal spread
className="flex flex-col gap-4"                   // Vertical stack
className="flex flex-wrap gap-2"                  // Wrapping items
```

### Grid Layouts
```jsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
```

### Text Styling
```jsx
className="text-sm font-medium text-slate-400"    // Secondary text
className="text-3xl font-bold text-white"         // Large heading
className="truncate"                              // Ellipsis overflow
```

### Common Combinations
```jsx
// Card hover effect
className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"

// Active state
className="bg-purple-500 text-white shadow-lg"

// Glassmorphism
className="backdrop-blur-xl bg-white/80"
```

---

## 📊 Z-Index Scale

```css
base:          0     - Normal flow
dropdown:      1000  - Dropdowns
sticky:        1020  - Sticky headers
fixed:         1030  - Fixed elements
modalBackdrop: 1040  - Modal overlays
modal:         1050  - Modal content
popover:       1060  - Popovers
tooltip:       1070  - Tooltips
```

---

## 💡 Quick Tips

### Do's ✅
- Use consistent spacing (4px grid)
- Apply smooth transitions (200-300ms)
- Ensure sufficient contrast
- Provide visual feedback
- Use semantic colors
- Test on mobile devices
- Add loading states
- Handle errors gracefully

### Don'ts ❌
- Don't use random spacing values
- Don't make animations too fast (< 150ms) or slow (> 600ms)
- Don't rely on color alone for meaning
- Don't forget hover/focus states
- Don't use too many colors
- Don't ignore mobile experience
- Don't skip loading states
- Don't hide errors

---

## 📚 Resources

### Design Tools
- **Figma**: UI design
- **Coolors**: Color palette generator
- **Type Scale**: Typography calculator

### Development
- **Tailwind Docs**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **React Docs**: https://react.dev

### Accessibility
- **WAVE**: Web accessibility evaluation tool
- **axe DevTools**: Accessibility testing
- **WebAIM**: Contrast checker

---

*Quick reference for maintaining consistent UI/UX*
*Version: 2.0.0 | December 3, 2025*

