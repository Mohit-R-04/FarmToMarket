# Clerk Authentication with Role Selection

This document explains how Clerk authentication is integrated with role-based onboarding.

## Overview

The application uses **Clerk** for authentication (login/signup) and adds a **custom role selection flow** that appears after first-time signup. Users must select their role (Farmer, Seller, or Transporter) and provide role-specific information before accessing their dashboard.

## Authentication Flow

### 1. Signup Flow
1. User visits `/signup`
2. Clerk handles the signup process (email/phone + password)
3. After successful Clerk signup, user is redirected to `/onboarding`
4. User selects their role (Farmer, Seller, or Transporter)
5. User fills in role-specific fields
6. Role data is saved to localStorage
7. User is redirected to their role-specific dashboard

### 2. Login Flow
1. User visits `/login`
2. Clerk handles the login process
3. If user has a role → redirected to `/dashboard`
4. If user doesn't have a role → redirected to `/onboarding`
5. Dashboard automatically shows based on user's role

## Key Components

### `RoleOnboarding.tsx`
- Two-step process: Role selection → Role details
- Validates role-specific fields
- Saves role data to localStorage via `roleService`

### `roleService.ts`
- Manages role data storage in localStorage
- Stores: `user_role` and `role_data`
- Provides methods: `saveRoleData()`, `getRoleData()`, `hasRole()`

### `AuthContext.tsx`
- Integrates Clerk's `useUser()` hook
- Syncs Clerk user data with our User format
- Provides `hasRole` flag to check if onboarding is complete
- Exposes `saveRole()` method to save role data

### Route Protection
- **PublicRoute**: Redirects authenticated users to dashboard/onboarding
- **ProtectedRoute**: 
  - Checks if user is signed in (Clerk)
  - Checks if user has completed role selection
  - Redirects to `/onboarding` if role not selected
  - Shows dashboard if role is selected

## Role Data Structure

### Farmer
```typescript
{
  farmName: string;
  location: string;
  crops: string;
}
```

### Seller
```typescript
{
  shopName: string;
  address: string;
}
```

### Transporter
```typescript
{
  vehicleType: string;
  vehicleNumber: string;
  license: string;
}
```

## Storage

Role data is stored in `localStorage`:
- `user_role`: The selected role (FARMER, SELLER, TRANSPORTER)
- `role_data`: JSON string of role-specific data

**Note**: You can optionally sync this data with Clerk's user metadata or your backend API.

## Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Get your Clerk publishable key from the [Clerk Dashboard](https://dashboard.clerk.com).

## File Structure

```
src/
├── services/
│   └── roleService.ts          # Role data storage
├── contexts/
│   └── AuthContext.tsx         # Clerk + role integration
├── components/
│   ├── auth/
│   │   ├── ClerkLogin.tsx      # Clerk login component
│   │   ├── ClerkSignup.tsx     # Clerk signup component
│   │   ├── RoleOnboarding.tsx   # Role selection flow
│   │   ├── ProtectedRoute.tsx  # Route protection
│   │   └── PublicRoute.tsx      # Public route wrapper
│   └── dashboards/
│       ├── FarmerDashboard.tsx
│       ├── SellerDashboard.tsx
│       ├── TransporterDashboard.tsx
│       └── DashboardRouter.tsx  # Routes to correct dashboard
└── App.tsx                      # Main app with routing
```

## Usage

### First Time User
1. Go to `/signup`
2. Complete Clerk signup
3. Automatically redirected to `/onboarding`
4. Select role and fill details
5. Redirected to role-specific dashboard

### Returning User
1. Go to `/login`
2. Complete Clerk login
3. Automatically redirected to role-specific dashboard

### Logout
- Uses Clerk's `signOut()` method
- Clears role data from localStorage
- Redirects to login

## Benefits

✅ **Clerk handles authentication** - Secure, managed auth service
✅ **Custom role system** - Full control over role selection and data
✅ **Seamless integration** - Role selection appears only on first signup
✅ **Persistent roles** - Role data persists across sessions
✅ **Role-based routing** - Automatic dashboard routing based on role

## Future Enhancements

- Sync role data with Clerk user metadata
- Store role data in backend database
- Allow role changes (with admin approval)
- Add role-based permissions

