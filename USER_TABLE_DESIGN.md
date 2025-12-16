# User Table Design for Budget App

## Overview

This budget app uses Supabase's built-in authentication system (`auth.users`) and extends it with a `user_profiles` table to store additional user-specific information needed for the budget application.

## Schema Design

### `user_profiles` Table

The `user_profiles` table extends the `auth.users` table with the following fields:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references `auth.users(id)` |
| `email` | TEXT | User's email address (unique) |
| `full_name` | TEXT | User's full legal name |
| `display_name` | TEXT | Name displayed in the app |
| `avatar_url` | TEXT | URL to user's profile picture |
| `currency_code` | TEXT | ISO 4217 currency code (default: 'USD') |
| `timezone` | TEXT | IANA timezone name (default: 'UTC') |
| `created_at` | TIMESTAMP | When the profile was created |
| `updated_at` | TIMESTAMP | When the profile was last updated |

## Key Features

### 1. **Automatic Profile Creation**
When a user signs up via Supabase Auth, a trigger automatically creates a corresponding profile record with:
- User's email from auth
- Full name from metadata (if provided)
- Display name (falls back to email username if no name provided)

### 2. **Row Level Security (RLS)**
All data is protected by RLS policies:
- Users can only **view** their own profile
- Users can only **update** their own profile
- Users can only **insert** their own profile

### 3. **Automatic Timestamps**
The `updated_at` field is automatically updated whenever a profile is modified.

### 4. **Currency Support**
Built-in support for multiple currencies using ISO 4217 codes (e.g., USD, EUR, GBP, JPY). This allows users to track budgets in their preferred currency.

### 5. **Timezone Support**
Timezone field allows proper date/time handling for users in different regions.

## Usage Examples

### Query User Profile
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseKey)

// Get current user's profile
const { data: profile, error } = await supabase
  .from('user_profiles')
  .select('*')
  .single()
```

### Update User Profile
```typescript
// Update currency preference
const { error } = await supabase
  .from('user_profiles')
  .update({ currency_code: 'EUR' })
  .eq('id', userId)
```

### Access Email from Auth
```typescript
// Get email directly from auth.users (more secure)
const { data: { user } } = await supabase.auth.getUser()
console.log(user.email)
```

## Migration

To apply this migration:

### For Remote Supabase:
```bash
npx supabase db push
```

### For Local Supabase:
```bash
npx supabase migration up
```

Or restart your local Supabase instance:
```bash
npx supabase db reset
```

## Future Enhancements

Consider adding these fields later as your app grows:
- `budget_notification_preferences` (JSONB) - Email/SMS notification settings
- `default_budget_period` (TEXT) - Monthly, weekly, yearly
- `date_format` (TEXT) - User's preferred date format
- `locale` (TEXT) - For internationalization
- `onboarding_completed` (BOOLEAN) - Track if user completed setup
- `premium_features` (BOOLEAN) - If you add a premium tier

## Security Notes

1. **Never expose `auth.users` directly** - Always use `user_profiles` for user data
2. **Email is denormalized** - Consider fetching from `auth.users` for most up-to-date email
3. **RLS is enabled** - Additional API-level security through Supabase policies
4. **Foreign key cascade** - Deleting a user automatically deletes their profile

