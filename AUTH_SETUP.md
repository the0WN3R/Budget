# Authentication Backend Setup

This document explains the authentication backend system for the budget app.

## Files Created

### 1. **`lib/supabase.js`** - Supabase Client Utility
   - **Purpose**: Centralized Supabase client configuration
   - **Features**:
     - Creates a reusable Supabase client instance
     - Handles environment variable validation
     - Provides both client-side and server-side client creation
     - Supports service role key for admin operations

### 2. **`api/auth/signup.js`** - Signup Endpoint
   - **Purpose**: Handle new user registration
   - **Endpoint**: `POST /api/auth/signup`
   - **What it does**:
     1. Validates email and password
     2. Creates user account in Supabase Auth
     3. Database trigger automatically creates `user_profiles` row
     4. Optionally accepts `full_name` and `display_name` for profile
   - **Request Body**:
     ```json
     {
       "email": "user@example.com",
       "password": "securepassword123",
       "full_name": "John Doe",  // optional
       "display_name": "John"     // optional
     }
     ```
   - **Response** (201 Created):
     ```json
     {
       "success": true,
       "message": "Account created successfully",
       "user": {
         "id": "uuid",
         "email": "user@example.com",
         "email_confirmed": false
       },
       "session": { ... },
       "profile": { ... }
     }
     ```

### 3. **`api/auth/login.js`** - Login Endpoint
   - **Purpose**: Authenticate existing users
   - **Endpoint**: `POST /api/auth/login`
   - **What it does**:
     1. Validates credentials
     2. Authenticates with Supabase Auth
     3. Returns session token and user profile
   - **Request Body**:
     ```json
     {
       "email": "user@example.com",
       "password": "securepassword123"
     }
     ```
   - **Response** (200 OK):
     ```json
     {
       "success": true,
       "message": "Login successful",
       "user": {
         "id": "uuid",
         "email": "user@example.com",
         "email_confirmed": true
       },
       "profile": { ... },
       "session": {
         "access_token": "...",
         "refresh_token": "...",
         "expires_at": 1234567890
       }
     }
     ```

### 4. **`api/auth/logout.js`** - Logout Endpoint
   - **Purpose**: Sign out users and invalidate session
   - **Endpoint**: `POST /api/auth/logout` or `GET /api/auth/logout`
   - **What it does**:
     1. Signs out user from Supabase Auth
     2. Invalidates current session
   - **Response** (200 OK):
     ```json
     {
       "success": true,
       "message": "Logout successful"
     }
     ```

## Environment Setup

1. **Copy the example environment file**:
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your Supabase credentials** in `.env.local`:
   - Get `NEXT_PUBLIC_SUPABASE_URL` from: Supabase Dashboard > Settings > API > Project URL
   - Get `NEXT_PUBLIC_SUPABASE_ANON_KEY` from: Supabase Dashboard > Settings > API > Project API keys > anon/public

## How It Works

### User Profile Creation
When a user signs up:
1. Supabase Auth creates the user in `auth.users` table
2. The database trigger `handle_new_user()` automatically fires
3. A new row is created in `user_profiles` table with:
   - User's ID (foreign key to auth.users)
   - Email address
   - Full name (from signup metadata, if provided)
   - Display name (from signup metadata, or email username as fallback)

### Security Features
- **Row Level Security (RLS)**: Users can only access their own profile data
- **Password Validation**: Minimum 6 characters (configurable in Supabase)
- **Email Validation**: Format checking before signup
- **Session Management**: Secure token-based authentication

## Testing the Endpoints

### Using cURL

**Signup**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "full_name": "Test User",
    "display_name": "Test"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**Logout**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

1. **Apply database migrations**:
   ```bash
   npx supabase db push
   ```

2. **Set up your frontend** to call these API endpoints

3. **Configure email settings** in Supabase Dashboard if you want email confirmation

4. **Test the endpoints** with the provided cURL commands

## Notes

- These endpoints work with Next.js API routes (for Vercel deployment)
- The user profile is automatically created via database trigger
- All endpoints include error handling and validation
- Session tokens are returned for client-side authentication

