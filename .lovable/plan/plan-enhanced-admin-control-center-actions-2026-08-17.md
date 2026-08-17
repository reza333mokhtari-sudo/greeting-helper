# Plan - Enhanced Admin Control Center Actions

Extend the admin unverified users tab with actions to resend verification, mark users as verified, and perform user management actions including deletion and map usage reporting.

## User Interface Changes

### 1. Admin Console Enhancements (`src/routes/admin/index.tsx`)
- Implement a dropdown menu for row actions in the "Unverified Users" tab.
- Add "Resend Verification", "Verify Account", and "Delete User" actions.
- Show map count for the user in the "About this account" detail view.

### 2. Admin Data Table Extensions (`src/components/admin/AdminDataTable.tsx`)
- Enhance the table to support custom row actions and specific renderers for unverified users.

## Backend Changes

### 1. New Admin Server Functions (`src/lib/admin.functions.ts`)
- `adminResendVerification`: Trigger a Supabase auth verification email.
- `adminVerifyUser`: Manually mark a user's email as confirmed in auth.users.
- `adminGetUserStats`: Fetch detailed stats for a user (e.g., number of maps created).
- `adminDeleteUser`: Securely delete a user from both auth and public schemas.

### 2. Email Notifications
- Send a confirmation email to the user when an admin manually verifies their account.

## Technical Details

- **Auth Management**: Use `supabaseAdmin` (service role) to interact with `auth.users` for verification and deletion.
- **Safety**: Ensure all functions are protected by `checkAdminAccess`.
- **User Experience**: Use toasts and confirmation dialogs for destructive or impactful actions.

## Deployment & Verification

- Verify that the admin can see unverified users.
- Test the "Resend Verification" flow.
- Confirm that manual verification updates the UI and sends an email.
- Ensure user deletion correctly cleans up associated maps and profiles.
