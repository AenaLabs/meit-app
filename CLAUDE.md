# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Meit**, a React Native mobile app built with Expo and Expo Router. It's a loyalty and rewards platform that allows users to earn points at merchant stores, complete challenges, manage gift cards, and scan QR codes for transactions.

## Tech Stack

- **Framework**: React Native (v0.81.5) with Expo (v54)
- **Routing**: Expo Router (v6) - file-based routing
- **Styling**: NativeWind (v4) - Tailwind CSS for React Native
- **State Management**: Zustand (v5) - lightweight state management
- **Backend**: Supabase (v2.83) - authentication and database
- **TypeScript**: Strict mode enabled

## Development Commands

```bash
# Start the development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device
npm run ios

# Run on web browser
npm run web
```

## Project Structure

```
src/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation screens (home, stores, scanner, gift-cards, profile)
│   ├── auth/              # Authentication screens (login, otp)
│   ├── store/[id].tsx     # Dynamic merchant detail screen
│   ├── gift-card/[id].tsx # Dynamic gift card detail screen
│   ├── challenge/[id].tsx # Dynamic challenge detail screen
│   └── _layout.tsx        # Root layout with auth routing logic
├── components/
│   └── ui/                # Reusable UI components (Button, Input, Card)
├── store/                 # Zustand state stores
│   ├── authStore.ts       # Session and user state
│   ├── merchantsStore.ts  # Merchant data (currently mock data)
│   ├── pointsStore.ts     # Points tracking (general + merchant-specific)
│   ├── giftCardsStore.ts  # Gift card management
│   └── challengesStore.ts # User challenges and progress
├── services/
│   └── supabase.ts        # Supabase client configuration
└── constants/
    └── Colors.ts          # Theme colors
```

## Architecture Patterns

### Authentication Flow

The app uses Supabase for authentication with an auth guard in `src/app/_layout.tsx`:
- Checks session state on mount using `supabase.auth.getSession()`
- Listens to auth state changes via `supabase.auth.onAuthStateChange()`
- Redirects unauthenticated users to `/auth/login`
- Redirects authenticated users away from auth screens to `/(tabs)`
- **Note**: Currently using mock authentication in login screen - real Supabase OTP auth is commented out

### Secure Storage

Uses Expo SecureStore adapter for Supabase auth tokens:
- Session tokens are stored securely in native keychain/keystore
- Configuration is in `src/services/supabase.ts`

### State Management

Zustand stores are used for all global state:
- Each store is a single file exporting a `create()` hook
- Stores contain both state and actions (setters, getters, async operations)
- Components access state via `const { data, actions } = useStore()`

### Styling

NativeWind provides Tailwind utility classes for React Native:
- Use `className` prop with Tailwind classes (e.g., `className="flex-1 bg-white"`)
- Custom colors defined in `tailwind.config.js`: `primary`, `secondary`, `neutral`, `accent1`, `accent2`
- Global styles imported in root layout: `import "../../global.css"`
- Access theme colors in JS via `Colors.primary` (from `@/constants/Colors.ts`)

### Routing

Expo Router uses file-based routing:
- Files in `src/app/` become routes automatically
- `(tabs)` is a group route for tab navigation
- `[id].tsx` creates dynamic routes (e.g., `/store/1` → `src/app/store/[id].tsx`)
- Navigation: `router.push('/path')`, `router.replace('/path')`
- Route params: `useLocalSearchParams()` from `expo-router`

### Path Aliases

TypeScript path alias `@/*` maps to `src/*`:
- Import as: `import { supabase } from "@/services/supabase"`
- Configured in `tsconfig.json`

## Environment Variables

Required environment variables in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (backend only)

**Note**: Expo requires `EXPO_PUBLIC_` prefix for client-side environment variables.

## UI Components

Reusable UI components in `src/components/ui/`:
- **Button**: Primary action button with loading state
- **Input**: Form input with label
- **Card**: Container with shadow and rounded corners

All components use NativeWind for styling.

## Feature Modules

### Points System
Users have two types of points:
- **General points**: Usable at any merchant
- **Merchant-specific points**: Earned and redeemable only at specific merchants
- Managed in `pointsStore.ts`

### Merchants
Currently using mock data in `merchantsStore.ts`:
- Each merchant has logo (emoji), name, description, category
- Users can favorite merchants
- Merchants have associated rewards and challenges

### Challenges
Users complete challenges to earn rewards:
- Track progress (e.g., "Buy 5 coffees")
- Progress percentage displayed with gradient bars
- Managed in `challengesStore.ts`

### Gift Cards
Users can purchase and manage gift cards:
- Track expiration dates
- Home screen alerts for expiring cards
- Managed in `giftCardsStore.ts`

## Current Development Status

- ✅ Authentication flow implemented (using mock auth temporarily)
- ✅ Tab navigation with 5 main screens
- ✅ State management with Zustand
- ✅ UI component library
- ✅ QR scanner screen (using expo-camera and expo-barcode-scanner)
- ⚠️ Using mock data in stores (merchants, challenges, gift cards, points)
- ⚠️ Real Supabase authentication is commented out in login screen
- ❌ Database schema not yet defined
- ❌ Backend API endpoints not yet implemented

## Development Notes

- React Native New Architecture is enabled (`newArchEnabled: true` in app.json)
- The app ignores "SafeAreaView has been deprecated" warnings (LogBox in _layout.tsx)
- Design uses custom purple gradient theme with decorative circular elements
- Tab bar has custom styling with elevated center scanner button
- All text uses custom font families: `Lato-Light` (body) and `Arial Rounded MT Bold` (headers)
