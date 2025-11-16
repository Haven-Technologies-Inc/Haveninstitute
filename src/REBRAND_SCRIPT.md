# Haven Institute Rebranding - Complete Guide

## Global Search & Replace Required

The following replacements need to be made across ALL files in the project:

### Primary Name Changes:
```
"NurseHaven" → "Haven Institute"
"nursehaven" → "haven-institute"  
"NURSEHAVEN" → "HAVEN_INSTITUTE"
```

### Tagline Changes:
```
"Your Safe Haven for NCLEX Success" → "Excellence in NCLEX Preparation"
```

### Email Domain Changes:
```
"@nursehaven.com" → "@haveninstitute.com"
"noreply@nursehaven.com" → "noreply@haveninstitute.com"
"admin@nursehaven.com" → "admin@haveninstitute.com"
"support@nursehaven.com" → "support@haveninstitute.com"
"demo@nursehaven.com" → "demo@haveninstitute.com"
"test@nursehaven.com" → "test@haveninstitute.com"
"superadmin@nursehaven.com" → "superadmin@haveninstitute.com"
```

### LocalStorage Keys:
```
"nursehaven_user" → "haven_institute_user"
"nursehaven_users" → "haven_institute_users"
"nursehaven_ai_integrations" → "haven_institute_ai_integrations"
"nursehaven_ai_usage_stats" → "haven_institute_ai_usage_stats"
```

### URL References:
```
"nursehaven.com" → "haveninstitute.com"
"meet.nursehaven.com" → "meet.haveninstitute.com"
"docs.nursehaven.com" → "docs.haveninstitute.com"
"support.nursehaven.com" → "support.haveninstitute.com"
```

### File Download Names:
```
"nursehaven-content" → "haven-institute-content"
"nursehaven-ai-config" → "haven-institute-ai-config"
"nursehaven-data" → "haven-institute-data"
```

## Files Requiring Manual Updates

### Component Files:
- `/App.tsx` - Line 78
- `/components/HeroEnhanced.tsx` - Multiple locations ✅ (DONE)
- `/components/Hero.tsx` - Multiple locations
- `/components/auth/Login.tsx` - Title and demo credentials
- `/components/auth/Signup.tsx` - Title
- `/components/auth/Onboarding.tsx` - Welcome message
- `/components/auth/AuthContext.tsx` - LocalStorage keys and demo accounts
- `/components/UserLayout.tsx` - Header
- `/components/admin/AdminLayout.tsx` - Title
- `/components/admin/AdminSettings.tsx` - Platform name, SMTP settings
- `/components/admin/AdminSettingsEnhanced.tsx` - SMTP, export filenames
- `/components/admin/WebsiteContentManagement.tsx` - Export filename
- `/components/Bookstore.tsx` - Badge text
- `/components/Settings.tsx` - Appearance description
- `/components/UserProfile.tsx` - Export filename
- `/components/Forum.tsx` - Community title
- `/components/StudyPlanner.tsx` - Description
- `/components/NCLEXGuide.tsx` - CAT testing reference
- `/components/GroupStudyComplete.tsx` - Meeting link
- `/components/payments/SubscriptionPlans.tsx` - Trust badge, description
- `/components/admin/ContentManagement.tsx` - Default author

### Service Files:
- `/services/zohoMailApi.ts` - Email templates
- `/services/websiteContentApi.ts` - Default content
- `/services/aiIntegrationApi.ts` - Export filenames (if exists)

### Documentation Files:
- `/ADMIN_GUIDE.md`
- `/ADMIN_REDESIGN.md`
- `/ADMIN_USER_SEPARATION.md`
- `/AUTH_SYSTEM.md`
- `/TESTING_GUIDE.md`
- `/ROLE_BASED_AUTH_SUMMARY.md`
- `/AI_INTEGRATION_COMPLETE.md`

## Implementation Steps:

### Step 1: Update Component Files (Priority 1)
1. Update HeroEnhanced.tsx ✅ (DONE)
2. Update Hero.tsx
3. Update Auth components (Login, Signup, AuthContext)
4. Update Admin components
5. Update User Layout

### Step 2: Update Service Files (Priority 2)
1. Update zohoMailApi.ts
2. Update websiteContentApi.ts
3. Update aiIntegrationApi.ts
4. Update other API services

### Step 3: Update Documentation (Priority 3)
1. Update all MD files with new branding
2. Update testing credentials
3. Update installation instructions

### Step 4: Testing Checklist
- [ ] Login page shows "Haven Institute"
- [ ] Admin header shows "Haven Institute Admin"
- [ ] User dashboard shows "Haven Institute"
- [ ] Email templates reference Haven Institute
- [ ] LocalStorage keys use haven_institute prefix
- [ ] Export files use haven-institute prefix
- [ ] All demo accounts use @haveninstitute.com
- [ ] Tagline updated to "Excellence in NCLEX Preparation"

## Quick Reference

### New Brand Identity:
**Name:** Haven Institute
**Tagline:** Excellence in NCLEX Preparation
**Domain:** haveninstitute.com
**Logo:** Graduation Cap (unchanged)
**Colors:** Blue-Purple Gradient (unchanged)
**Theme:** Professional Academic Institution

### Demo Accounts (Updated):
- **Super Admin:** superadmin@haveninstitute.com / super123
- **Admin:** admin@haveninstitute.com / admin123  
- **Premium Student:** demo@haveninstitute.com / demo123
- **Free Student:** test@haveninstitute.com / test123
- **Pro Student:** student@demo.com / student123

---

## Automated Script (For IDE Find & Replace)

```bash
# Find & Replace All Occurrences
NurseHaven → Haven Institute
nursehaven → haven-institute
NURSEHAVEN → HAVEN_INSTITUTE
"Your Safe Haven for NCLEX Success" → "Excellence in NCLEX Preparation"
@nursehaven.com → @haveninstitute.com
```

---

**Status:** In Progress
**Last Updated:** 2024-01-16
**Next Step:** Complete component file updates
