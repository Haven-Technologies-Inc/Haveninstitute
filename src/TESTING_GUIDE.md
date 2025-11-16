# 🔐 NurseHaven Authentication Testing Guide

## Quick Start - Test the Auth System

### ✅ Test 1: Admin Login
**Goal:** Verify admin role-based access

1. **Login Page:** Look for the demo credentials box
2. **Enter:**
   - Email: `admin@nursehaven.com`
   - Password: `admin123`
3. **Click:** "Sign In"
4. **Expected Result:**
   - ✅ Redirects to **Admin Dashboard**
   - ✅ See purple/blue gradient header
   - ✅ Title: "NurseHaven Admin"
   - ✅ Subtitle: "Content Management System"
   - ✅ Left sidebar has admin menu items:
     - Overview
     - Upload Questions
     - Manage Questions
     - Analytics
     - User Management
     - Revenue & Billing
     - Book Management
     - Settings
   - ✅ "Exit Admin" button in top right
   - ✅ NO user portal features visible

---

### ✅ Test 2: Student Login (Pre-configured)
**Goal:** Verify student role-based access

1. **Logout** from admin (click "Logout" in sidebar)
2. **Login Page:** Enter demo student credentials
3. **Enter:**
   - Email: `student@demo.com`
   - Password: `student123`
4. **Click:** "Sign In"
5. **Expected Result:**
   - ✅ Redirects to **User Dashboard**
   - ✅ See blue/purple gradient header
   - ✅ Title: "NurseHaven"
   - ✅ Tagline: "Your Safe Haven for NCLEX Success"
   - ✅ Subscription badge shows "⭐ Pro"
   - ✅ Left sidebar has student menu items:
     - Dashboard
     - CAT Test
     - Practice Quiz
     - Flashcards
     - My Books
     - Progress
     - AI Analytics
     - Study Planner
     - Forum
     - Group Study
     - Subscription
   - ✅ NO admin features visible
   - ✅ Dashboard shows analytics, charts, and study progress

---

### ✅ Test 3: New Student Signup
**Goal:** Test account creation with onboarding

1. **Logout** from current account
2. **Login Page:** Click "Sign up for free"
3. **Signup Form:**
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
   - Check "I agree to Terms..."
4. **Click:** "Create Account"
5. **Expected Result:**
   - ✅ Redirects to **Onboarding Flow**

6. **Onboarding Step 1 - User Type:**
   - Select: "NCLEX Preparation"
   - Click "Next"

7. **Onboarding Step 2 - Study Level:**
   - Select: "Intermediate"
   - Click "Next"

8. **Onboarding Step 3 - Goals:**
   - Check: "Pass NCLEX on first attempt"
   - Check: "Build test-taking confidence"
   - Click "Next"

9. **Onboarding Step 4 - Target Date:**
   - Select: Future date
   - Weekly hours: 10
   - Click "Complete Setup"

10. **Expected Result:**
    - ✅ Redirects to **User Dashboard**
    - ✅ Shows welcome message with name: "Welcome back, Test!"
    - ✅ Subscription badge shows "Free"
    - ✅ Full access to student portal
    - ✅ NO admin features

---

### ✅ Test 4: Role Separation
**Goal:** Verify roles cannot cross-access

#### 4A: Admin Cannot Access User Features
1. **Login as Admin:**
   - Email: `admin@nursehaven.com`
   - Password: `admin123`
2. **Verify:**
   - ✅ Only sees Admin Dashboard
   - ✅ Cannot navigate to CAT Test
   - ✅ Cannot navigate to Practice Quiz
   - ✅ No student menu visible

#### 4B: Student Cannot Access Admin Features
1. **Login as Student:**
   - Email: `student@demo.com`
   - Password: `student123`
2. **Verify:**
   - ✅ Only sees User Portal
   - ✅ Cannot access Question Upload
   - ✅ Cannot access User Management
   - ✅ No admin menu visible

---

### ✅ Test 5: Session Persistence
**Goal:** Verify login state survives page refresh

1. **Login as any user**
2. **Press F5** or refresh page
3. **Expected Result:**
   - ✅ Stays logged in
   - ✅ Still on correct dashboard (admin/user)
   - ✅ All data preserved

---

### ✅ Test 6: Multiple Demo Accounts
**Goal:** Test all pre-configured accounts

#### Premium Student
- Email: `demo@nursehaven.com`
- Password: `demo123`
- Expected: User Portal with "👑 Premium" badge

#### Free Student
- Email: `test@nursehaven.com`
- Password: `test123`
- Expected: User Portal with "Free" badge

#### Super Admin
- Email: `superadmin@nursehaven.com`
- Password: `super123`
- Expected: Admin Dashboard

---

### ✅ Test 7: Error Handling
**Goal:** Verify proper error messages

#### Invalid Credentials
1. Enter: `wrong@email.com` / `wrongpass`
2. Click "Sign In"
3. **Expected:** ❌ "Invalid email or password"

#### Existing Email Signup
1. Try to signup with: `admin@nursehaven.com`
2. **Expected:** ❌ "This email is reserved for administrators"

#### Password Mismatch
1. Signup form
2. Password: `Test1234!`
3. Confirm: `Different1234!`
4. **Expected:** ❌ "Passwords do not match"

---

## 📊 What Each Role Sees

### Admin Dashboard Features:
```
Header:
  - NurseHaven Admin logo
  - Search bar
  - Notifications bell
  - Admin profile
  - Exit Admin button

Left Sidebar:
  ✓ Overview
  ✓ Upload Questions (PDF, Word, Excel)
  ✓ Manage Questions
  ✓ Analytics
  ✓ User Management
  ✓ Revenue & Billing
  ✓ Book Management
  ✓ Settings
  ✓ Logout

Main Content:
  - Admin-specific dashboards
  - Question management tools
  - User analytics
  - Revenue charts
  - System settings
```

### User Portal Features:
```
Header:
  - NurseHaven logo
  - Search bar
  - Notifications bell
  - Settings icon
  - User profile with subscription badge

Left Sidebar:
  ✓ Dashboard (Overview & insights)
  ✓ CAT Test (Adaptive testing)
  ✓ Practice Quiz (Topic-based)
  ✓ Flashcards (Study cards)
  ✓ My Books (NCLEX ebooks)
  ✓ Progress (Track improvement)
  ✓ AI Analytics (Performance)
  ✓ Study Planner (Schedule)
  ✓ Forum (Community)
  ✓ Group Study (Peers)
  ✓ Subscription (Manage plan)
  ✓ Logout

Main Content:
  - Analytics dashboard
  - Study tools
  - Progress tracking
  - Community features
  - Subscription management
```

---

## 🐛 Common Issues & Solutions

### Issue: Can't see menu
**Solution:** Menu is visible on desktop (≥1024px). On mobile, click hamburger icon (☰)

### Issue: Stuck on login
**Solution:** Check browser console for errors. Clear localStorage and try again.

### Issue: Wrong dashboard after login
**Solution:** Verify credentials match expected role:
- Admin emails end with `@nursehaven.com` (for demo admins)
- Student emails use demo accounts or custom signups

### Issue: Onboarding won't complete
**Solution:** 
1. Fill all required fields
2. Select options in each step
3. Click "Complete Setup" on final step

### Issue: Session cleared on refresh
**Solution:** 
1. Ensure localStorage is enabled in browser
2. Check browser privacy settings
3. Disable extensions that block localStorage

---

## 📱 Mobile vs Desktop

### Desktop (≥1024px):
- Left sidebar always visible
- Full menu with descriptions
- Search bar in header
- All features accessible

### Mobile (<1024px):
- Hamburger menu (☰) in top right
- Tap to open right-side drawer
- User profile in drawer header
- Simplified navigation
- Tap outside to close

---

## ✅ Success Checklist

After testing, verify:
- [ ] Admin login shows admin dashboard only
- [ ] Student login shows user portal only  
- [ ] New signup triggers onboarding flow
- [ ] Onboarding saves preferences
- [ ] Session persists after refresh
- [ ] Logout clears session
- [ ] Can't access wrong role's features
- [ ] Demo accounts work correctly
- [ ] Error messages display properly
- [ ] Mobile menu works on small screens

---

## 🎯 Next Steps

Once auth is verified:
1. Test CAT Testing system
2. Try Practice Quizzes
3. Explore Flashcards
4. Check Analytics dashboard
5. Test subscription management
6. Try booking/reading ebooks
7. Post in Forum
8. Join Group Study sessions

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Clear localStorage: `localStorage.clear()`
3. Try incognito/private mode
4. Verify credentials from demo box
5. Check network tab for API errors

**All demo accounts are pre-configured and should work immediately!**

🎉 Happy Testing!
