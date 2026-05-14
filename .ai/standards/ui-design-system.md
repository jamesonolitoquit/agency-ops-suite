# ui-design-system.md

Design token usage, consistency, responsive design.

## Design Tokens

All styling through Tailwind tokens:

```typescript
// ✓ CORRECT
<div className="text-blue-600 rounded-lg shadow-md">

// ✗ INCORRECT
<div style={{ color: '#0066cc', borderRadius: '8px' }}>
```

## Colors

- Primary: `blue-600`
- Success: `green-600`
- Warning: `amber-600`
- Error: `red-600`
- Neutral: `gray-*`

All colors support dark mode.

## Spacing Scale

- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

```typescript
// ✓ Consistent
<div className="p-4 gap-2 mb-8">

// ✗ Inconsistent
<div style={{ padding: '14px', gap: '7px', marginBottom: '28px' }}>
```

## Typography

- Text: `text-base` (16px)
- Small: `text-sm` (14px)
- Large: `text-lg` (18px)
- H1: `text-4xl font-bold` (36px)
- H2: `text-2xl font-bold` (24px)

## Responsive Breakpoints

- Mobile: default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

```typescript
<div className="w-full md:w-1/2 lg:w-1/3">
```

## Dark Mode

All colors must work in dark mode:

```typescript
// ✓ CORRECT
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"

// ✗ INCORRECT
className="bg-white"  // Breaks in dark mode
```

## Components

- Buttons: sm, md, lg sizes
- Forms: consistent inputs, labels
- Cards: consistent padding, shadows
- Modals: consistent animation

## Enforcement

- Tailwind lint
- Design review
- Scanner: ux-consistency
