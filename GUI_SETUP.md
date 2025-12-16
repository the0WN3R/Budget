# GUI Setup Guide

This guide will help you set up and run the frontend GUI for your budget app.

## Prerequisites

Before running the GUI, make sure you've completed:
1. ✅ Environment variables set up (`.env.local` file)
2. ✅ Database migrations applied
3. ✅ Backend API endpoints working

## Installation Steps

### 1. Install Tailwind CSS

The UI uses Tailwind CSS for styling. Install it:

```bash
npm install -D tailwindcss postcss autoprefixer
```

### 2. Initialize Tailwind (if needed)

The `tailwind.config.js` file is already created, but you can verify:

```bash
npx tailwindcss init -p
```

This creates/updates `tailwind.config.js` and `postcss.config.js`.

### 3. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

## Running the Application

### Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Build for Production

```bash
npm run build
npm start
```

## Pages & Routes

The GUI includes the following pages:

### 1. **Home Page** (`/`)
- Redirects to `/login` if not authenticated
- Redirects to `/dashboard` if authenticated

### 2. **Login Page** (`/login`)
- Email and password login form
- Links to signup page
- Validates credentials
- Stores session tokens

### 3. **Signup Page** (`/signup`)
- Registration form with:
  - Email
  - Password and confirmation
  - Full name (optional)
  - Display name (optional)
- Validates input
- Creates account and profile
- Auto-redirects to dashboard

### 4. **Dashboard Page** (`/dashboard`)
- Protected route (requires authentication)
- Shows user profile information
- Displays budget overview (placeholder)
- Navigation bar with logout

## Features

### ✅ Authentication Flow
- Sign up → Creates account and profile automatically
- Log in → Authenticates and saves session
- Log out → Clears session and redirects

### ✅ Session Management
- Tokens stored in localStorage
- Auto-redirect if not authenticated
- Protected routes

### ✅ UI Components
- **Button** - Multiple variants (primary, secondary, danger, success)
- **Input** - Form inputs with labels and error handling
- **Card** - Content containers
- **Layout** - Page wrapper with navigation

### ✅ Responsive Design
- Mobile-friendly
- Tailwind CSS utility classes
- Modern, clean design

## File Structure

```
pages/
  ├── _app.js          # Root app component (loads global styles)
  ├── index.js         # Home page (redirects)
  ├── login.js         # Login page
  ├── signup.js        # Signup page
  └── dashboard.js     # Dashboard (protected)

components/
  ├── Button.js        # Reusable button component
  ├── Input.js         # Reusable input component
  ├── Card.js          # Card container component
  └── Layout.js        # Layout wrapper with navigation

lib/
  ├── api.js           # API client utilities
  └── supabase.js      # Supabase client

styles/
  └── globals.css      # Global styles + Tailwind directives
```

## Testing the GUI

### 1. Test Signup Flow

1. Go to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click "Sign up" link
4. Fill in the form:
   - Email: `test@example.com`
   - Password: `test123456`
   - Name (optional)
5. Click "Sign Up"
6. Should redirect to dashboard

### 2. Test Login Flow

1. Go to `/login`
2. Enter email and password
3. Click "Log In"
4. Should redirect to dashboard

### 3. Test Dashboard

1. After logging in, you should see:
   - Welcome message with your name
   - Profile information
   - Budget overview (placeholder)
   - Navigation bar with logout button

### 4. Test Logout

1. Click "Logout" in navigation bar
2. Should redirect to `/login`
3. Session should be cleared

## Troubleshooting

### Issue: Styles not loading
**Solution:** Make sure Tailwind CSS is installed and PostCSS config exists:
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Issue: API requests failing
**Solution:** 
1. Check that your backend server is running
2. Verify `.env.local` has correct Supabase credentials
3. Check browser console for errors

### Issue: Redirect loop
**Solution:**
- Clear localStorage: `localStorage.clear()` in browser console
- Make sure API endpoints are working

### Issue: "Module not found" errors
**Solution:**
```bash
npm install
```

## Next Steps

Now that the GUI is working, you can:

1. **Create Budget API endpoints** - Build the backend for budget CRUD operations
2. **Add Budget UI** - Create pages/components for managing budgets
3. **Add Budget Tabs UI** - Create interface for adding/editing budget categories
4. **Add Expense Tracking** - Build expense entry and tracking features

## Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

### Adding Pages

Create new files in `pages/` directory - Next.js will automatically create routes.

### Modifying Components

All reusable components are in `components/` directory and can be customized.

---

Enjoy your budget app GUI! 🎉

