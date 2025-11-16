# NurseHaven Authentication System

## Overview
NurseHaven uses a role-based authentication system with two distinct user types: **Students** and **Admins**. Each role has separate access levels and features.

---

## User Roles

### 1. Student Role (`role: 'student'`)
**Access Level:** User Portal
**Features:**
- Dashboard with analytics
- CAT Testing
- Practice Quizzes
- Flashcards
- My Books
- Progress Tracking
- AI Analytics
- Study Planner
- Forum
- Group Study
- Subscription Management

**Subscription Tiers:**
- Free: Basic access
- Pro ($29.99/mo): Enhanced features
- Premium ($49.99/mo): Full access

### 2. Admin Role (`role: 'admin'`)
**Access Level:** Admin Portal
**Features:**
- Content Management System
- Question Upload (PDF, Word, Excel)
- Question Management
- User Management
- Analytics Dashboard
- Revenue & Billing
- Book Management
- System Settings

---

## Demo Accounts

### Admin Accounts
1. **Primary Admin**
   - Email: `admin@nursehaven.com`
   - Password: `admin123`
   - Name: Admin User

2. **Super Admin**
   - Email: `superadmin@nursehaven.com`
   - Password: `super123`
   - Name: Super Admin

### Student Accounts
1. **Pro Student**
   - Email: `student@demo.com`
   - Password: `student123`
   - Name: Sarah Johnson
   - Subscription: Pro

2. **Premium Student**
   - Email: `demo@nursehaven.com`
   - Password: `demo123`
   - Name: John Smith
   - Subscription: Premium

3. **Free Student**
   - Email: `test@nursehaven.com`
   - Password: `test123`
   - Name: Emma Davis
   - Subscription: Free

---

## Authentication Flow

### Login Process
```
1. User enters email and password
2. System checks if credentials match admin accounts
   → If admin: Route to Admin Dashboard
   → If not admin: Check student accounts
3. System checks demo student accounts
   → If found: Route to User Portal
4. System checks registered users database
   → If found: Route to User Portal
5. If no match: Show error "Invalid email or password"
```

### Signup Process
```
1. User enters full name, email, and password
2. System validates:
   - Email not already in use
   - Email not reserved for admins
   - Password minimum 8 characters
3. Create new student account
   - Role: 'student'
   - Subscription: 'Free'
   - hasCompletedOnboarding: false
4. Store in local database
5. Show onboarding flow
```

### Onboarding (Students Only)
```
1. Welcome screen
2. User type selection:
   - Nursing Student
   - NCLEX Prep
   - Both
3. Study level selection:
   - Beginner
   - Intermediate
   - Advanced
4. Goal selection (multi-select):
   - Pass NCLEX-RN
   - Pass NCLEX-PN
   - Improve test scores
   - etc.
5. Target exam date
6. Set hasCompletedOnboarding: true
7. Route to Dashboard
```

---

## Role-Based Routing

### App.tsx Logic
```typescript
// After authentication and onboarding:

if (user.role === 'admin') {
  return <AdminDashboard onBack={() => logout()} />;
}

// Otherwise show user portal:
return (
  <UserLayout currentView={currentView} onNavigate={setCurrentView}>
    {renderContent()}
  </UserLayout>
);
```

### Protected Routes
- **Admin Portal:** Only accessible with `role: 'admin'`
- **User Portal:** Only accessible with `role: 'student'`
- **No cross-access:** Admins cannot access user portal, students cannot access admin portal

---

## Data Storage

### LocalStorage Keys
1. **`nursehaven_user`**
   - Current authenticated user
   - Cleared on logout

2. **`nursehaven_users`**
   - Array of registered users
   - Contains hashed passwords (demo only - never in production!)
   - Used for signup/login validation

### User Object Structure
```typescript
interface User {
  id: string;                    // Unique identifier
  email: string;                 // Login email
  name: string;                  // Display name
  fullName?: string;             // Full name
  role: 'student' | 'admin';     // User role
  subscription?: 'Free' | 'Pro' | 'Premium';  // Student only
  userType?: string;             // Onboarding data
  goals?: string[];              // Onboarding data
  studyLevel?: string;           // Onboarding data
  targetExamDate?: string;       // Onboarding data
  hasCompletedOnboarding: boolean;
  createdAt: string;             // ISO timestamp
  avatar?: string;               // Profile picture URL
}
```

---

## Security Features

### Demo Implementation
✅ Role-based access control
✅ Admin email reservation
✅ Password validation (min 8 chars)
✅ Separate login flows
✅ Protected routes
✅ Session persistence

### Production Considerations
⚠️ **DO NOT USE IN PRODUCTION WITHOUT:**
- Proper backend authentication (Supabase, Auth0, etc.)
- Password hashing (bcrypt, argon2)
- JWT tokens or secure sessions
- HTTPS encryption
- Rate limiting
- Email verification
- 2FA for admins
- CSRF protection
- XSS sanitization

---

## UI Components

### Login Screen
**Location:** `/components/auth/Login.tsx`
**Features:**
- Email/password inputs
- Remember me checkbox
- Forgot password link
- Demo credentials display
- Sign up link
- Loading states
- Error handling

### Signup Screen
**Location:** `/components/auth/Signup.tsx`
**Features:**
- Full name, email, password, confirm password
- Password strength indicator
- Terms of service checkbox
- Feature list preview
- Sign in link
- Validation
- Error handling

### Onboarding Flow
**Location:** `/components/auth/Onboarding.tsx`
**Features:**
- Multi-step wizard
- User type selection
- Study level selection
- Goal selection (checkboxes)
- Date picker for exam
- Progress indicators
- Skip option

---

## Testing Instructions

### Test Admin Access
1. Go to login page
2. Enter: `admin@nursehaven.com` / `admin123`
3. Click "Sign In"
4. Should see: **Admin Dashboard** with purple gradient
5. Left sidebar shows: Overview, Upload Questions, Manage Questions, etc.
6. Click "Exit Admin" to logout

### Test Student Access
1. Go to login page
2. Enter: `student@demo.com` / `student123`
3. Click "Sign In"
4. Should see: **User Dashboard** with blue gradient
5. Left sidebar shows: Dashboard, CAT Test, Practice Quiz, etc.
6. Check subscription badge shows "Pro"

### Test New Student Signup
1. Go to login page
2. Click "Sign up for free"
3. Enter name, email, password
4. Submit form
5. Should see: **Onboarding flow**
6. Complete all steps
7. Should see: **User Dashboard**
8. Subscription should be "Free"

### Test Role Separation
1. Login as admin
2. Try to access user features → **Blocked** (only admin dashboard visible)
3. Logout
4. Login as student
5. Try to access admin features → **Blocked** (only user portal visible)

---

## API Integration Points

### For Supabase Integration
```typescript
// Replace AuthContext.tsx functions:

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  setUser({
    id: data.user.id,
    email: data.user.email,
    role: profile.role,
    ...profile
  });
};

const signup = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  
  if (error) throw error;
  
  // Create profile with role
  await supabase.from('profiles').insert({
    id: data.user.id,
    full_name: fullName,
    role: 'student',
    subscription: 'Free',
    has_completed_onboarding: false
  });
};
```

### Database Schema (Supabase)
```sql
-- profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  subscription TEXT CHECK (subscription IN ('Free', 'Pro', 'Premium')),
  user_type TEXT,
  study_level TEXT,
  target_exam_date DATE,
  has_completed_onboarding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Troubleshooting

### Issue: "User stays on login after entering credentials"
**Solution:** Check browser console for errors, ensure localStorage is enabled

### Issue: "Admin sees user portal instead of admin dashboard"
**Solution:** Verify user.role === 'admin' in App.tsx routing logic

### Issue: "Cannot create new account"
**Solution:** Clear localStorage, ensure email isn't already registered

### Issue: "Onboarding doesn't complete"
**Solution:** Check hasCompletedOnboarding is being set to true

### Issue: "Session lost on refresh"
**Solution:** Ensure localStorage.getItem('nursehaven_user') in useEffect

---

## Future Enhancements

### Planned Features
- [ ] Email verification
- [ ] Password reset flow
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication
- [ ] Role hierarchy (Super Admin, Moderator)
- [ ] Session timeout
- [ ] Activity logging
- [ ] IP-based security
- [ ] Device management
- [ ] Security questions

### Migration to Production
1. Replace localStorage with Supabase/Backend
2. Implement proper password hashing
3. Add JWT token management
4. Set up secure HTTP-only cookies
5. Configure CORS properly
6. Add rate limiting
7. Implement audit logging
8. Set up monitoring/alerts
9. Add backup/recovery
10. Security audit & penetration testing

---

## Summary

✅ **Role-Based Access Control** - Students and Admins have separate portals
✅ **Demo Accounts** - Pre-configured accounts for testing
✅ **Onboarding Flow** - Personalized setup for new students
✅ **Session Persistence** - Users stay logged in across refreshes
✅ **Protected Routes** - No cross-access between roles
✅ **Clear Separation** - Different layouts, features, and navigation per role
✅ **Production-Ready Architecture** - Easy to migrate to real backend

**Current Status:** ✅ Fully functional with localStorage
**Next Step:** Integrate with Supabase for production deployment
