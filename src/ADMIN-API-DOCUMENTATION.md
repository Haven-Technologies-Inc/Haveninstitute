# 🛡️ NurseHaven Admin API Documentation

Complete admin-level API endpoints for managing the entire NurseHaven platform.

**File:** `/lib/admin-api-endpoints.ts`

---

## 📋 Table of Contents

1. [Admin User Management](#admin-user-management)
2. [Content Management](#content-management)
3. [Admin Analytics](#admin-analytics)

---

## 🔐 Authentication

**All admin endpoints require admin role authentication.**

Make sure the authenticated user has `role: 'admin'` before accessing these endpoints.

```typescript
import { adminApi } from './lib/admin-api-endpoints';

// Check if user is admin
if (user.role !== 'admin') {
  throw new Error('Unauthorized: Admin access required');
}
```

---

## 👥 Admin User Management

### Get All Users
```typescript
adminApi.users.getAllUsers(filters?: {
  role?: 'user' | 'admin';
  subscriptionTier?: string;
  searchQuery?: string;
}): Promise<AdminUser[]>
```

**Description:** Retrieves all platform users with optional filtering.

**Parameters:**
- `role` (optional) - Filter by user role
- `subscriptionTier` (optional) - Filter by subscription tier (free/pro/premium)
- `searchQuery` (optional) - Search by email or name

**Returns:**
```typescript
interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  createdAt: Date;
  lastActive: Date;
  totalStudyTime: number;
  quizzesCompleted: number;
  catTestsTaken: number;
}
```

**Example:**
```typescript
// Get all users
const allUsers = await adminApi.users.getAllUsers();

// Get only pro users
const proUsers = await adminApi.users.getAllUsers({
  subscriptionTier: 'pro'
});

// Search for user
const searchResults = await adminApi.users.getAllUsers({
  searchQuery: 'john@example.com'
});
```

---

### Get User By ID
```typescript
adminApi.users.getUserById(userId: string): Promise<AdminUser | null>
```

**Description:** Retrieves detailed information about a specific user.

**Example:**
```typescript
const user = await adminApi.users.getUserById('user-id-123');
if (user) {
  console.log(`User: ${user.fullName}, Email: ${user.email}`);
}
```

---

### Update User Subscription
```typescript
adminApi.users.updateUserSubscription(
  userId: string,
  subscriptionData: {
    tier: 'free' | 'pro' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
  }
): Promise<void>
```

**Description:** Updates a user's subscription tier and status.

**Example:**
```typescript
// Upgrade user to Pro
await adminApi.users.updateUserSubscription('user-id-123', {
  tier: 'pro',
  status: 'active'
});

// Cancel subscription
await adminApi.users.updateUserSubscription('user-id-123', {
  tier: 'free',
  status: 'cancelled'
});
```

---

### Update User Role
```typescript
adminApi.users.updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<void>
```

**Description:** Changes a user's role (promote to admin or demote to user).

**Example:**
```typescript
// Promote to admin
await adminApi.users.updateUserRole('user-id-123', 'admin');

// Demote to regular user
await adminApi.users.updateUserRole('user-id-123', 'user');
```

---

### Toggle User Suspension
```typescript
adminApi.users.toggleUserSuspension(
  userId: string,
  suspended: boolean
): Promise<void>
```

**Description:** Suspends or unsuspends a user account.

**Example:**
```typescript
// Suspend user
await adminApi.users.toggleUserSuspension('user-id-123', true);

// Unsuspend user
await adminApi.users.toggleUserSuspension('user-id-123', false);
```

---

### Delete User
```typescript
adminApi.users.deleteUser(userId: string): Promise<void>
```

**Description:** Permanently deletes a user and all associated data.

**⚠️ Warning:** This action is irreversible!

**Example:**
```typescript
await adminApi.users.deleteUser('user-id-123');
```

---

### Get Platform Statistics
```typescript
adminApi.users.getPlatformStatistics(): Promise<{
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  proUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
}>
```

**Description:** Retrieves comprehensive platform-wide statistics.

**Example:**
```typescript
const stats = await adminApi.users.getPlatformStatistics();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Monthly Revenue: $${stats.totalRevenue}`);
console.log(`Active Subscriptions: ${stats.activeSubscriptions}`);
```

---

## 📚 Content Management

### Get All Study Groups
```typescript
adminApi.content.getAllStudyGroups(): Promise<any[]>
```

**Description:** Retrieves all study groups across the platform.

**Example:**
```typescript
const groups = await adminApi.content.getAllStudyGroups();
groups.forEach(group => {
  console.log(`${group.name} - ${group.member_count} members`);
});
```

---

### Delete Study Group
```typescript
adminApi.content.deleteStudyGroup(groupId: string): Promise<void>
```

**Description:** Deletes a study group.

**Example:**
```typescript
await adminApi.content.deleteStudyGroup('group-id-123');
```

---

### Get All Flashcard Sets
```typescript
adminApi.content.getAllFlashcardSets(): Promise<any[]>
```

**Description:** Retrieves all flashcard sets on the platform.

**Example:**
```typescript
const sets = await adminApi.content.getAllFlashcardSets();
console.log(`Total flashcard sets: ${sets.length}`);
```

---

### Delete Flashcard Set
```typescript
adminApi.content.deleteFlashcardSet(setId: string): Promise<void>
```

**Description:** Deletes a flashcard set and all its cards.

**Example:**
```typescript
await adminApi.content.deleteFlashcardSet('set-id-123');
```

---

### Get All Quizzes
```typescript
adminApi.content.getAllQuizzes(): Promise<any[]>
```

**Description:** Retrieves all quizzes on the platform.

**Example:**
```typescript
const quizzes = await adminApi.content.getAllQuizzes();
quizzes.forEach(quiz => {
  console.log(`${quiz.title} - ${quiz.question_count} questions`);
});
```

---

### Delete Quiz
```typescript
adminApi.content.deleteQuiz(quizId: string): Promise<void>
```

**Description:** Deletes a quiz, its questions, and all attempts.

**Example:**
```typescript
await adminApi.content.deleteQuiz('quiz-id-123');
```

---

### Get All Books
```typescript
adminApi.content.getAllBooks(): Promise<any[]>
```

**Description:** Retrieves all books in the library.

**Example:**
```typescript
const books = await adminApi.content.getAllBooks();
console.log(`Total books: ${books.length}`);
```

---

### Create/Update Book
```typescript
adminApi.content.upsertBook(bookData: {
  id?: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  chapters: any[];
}): Promise<any>
```

**Description:** Creates a new book or updates an existing one.

**Example:**
```typescript
const book = await adminApi.content.upsertBook({
  title: 'NCLEX-RN Mastery',
  author: 'Dr. Sarah Johnson',
  description: 'Complete NCLEX-RN preparation guide',
  coverImage: 'https://example.com/cover.jpg',
  category: 'NCLEX Preparation',
  chapters: [
    {
      id: 'ch1',
      title: 'Introduction',
      content: 'Chapter content here...'
    }
  ]
});
```

---

### Delete Book
```typescript
adminApi.content.deleteBook(bookId: string): Promise<void>
```

**Description:** Deletes a book from the library.

**Example:**
```typescript
await adminApi.content.deleteBook('book-id-123');
```

---

## 📊 Admin Analytics

### Get Quiz Statistics
```typescript
adminApi.analytics.getQuizStatistics(): Promise<{
  totalAttempts: number;
  averageScore: number;
  categoryBreakdown: Record<string, { attempts: number; avgScore: number }>;
  recentAttempts: any[];
}>
```

**Description:** Retrieves platform-wide quiz statistics.

**Example:**
```typescript
const quizStats = await adminApi.analytics.getQuizStatistics();
console.log(`Total Attempts: ${quizStats.totalAttempts}`);
console.log(`Average Score: ${quizStats.averageScore}%`);

// Category performance
Object.entries(quizStats.categoryBreakdown).forEach(([category, data]) => {
  console.log(`${category}: ${data.attempts} attempts, ${data.avgScore}% avg`);
});
```

---

### Get Flashcard Statistics
```typescript
adminApi.analytics.getFlashcardStatistics(): Promise<{
  totalCards: number;
  totalReviews: number;
  averageRetention: number;
  topSets: any[];
}>
```

**Description:** Retrieves flashcard usage and retention statistics.

**Example:**
```typescript
const flashcardStats = await adminApi.analytics.getFlashcardStatistics();
console.log(`Total Cards: ${flashcardStats.totalCards}`);
console.log(`Total Reviews: ${flashcardStats.totalReviews}`);
console.log(`Average Retention: ${flashcardStats.averageRetention}%`);
```

---

### Get Study Planner Statistics
```typescript
adminApi.analytics.getStudyPlannerStatistics(): Promise<{
  totalSessions: number;
  completedSessions: number;
  totalStudyTime: number;
  totalGoals: number;
  completedGoals: number;
  totalTasks: number;
  completedTasks: number;
}>
```

**Description:** Retrieves study planner usage statistics.

**Example:**
```typescript
const plannerStats = await adminApi.analytics.getStudyPlannerStatistics();
console.log(`Total Study Time: ${Math.round(plannerStats.totalStudyTime / 60)} hours`);
console.log(`Goal Completion Rate: ${(plannerStats.completedGoals / plannerStats.totalGoals * 100).toFixed(1)}%`);
```

---

### Get Revenue Analytics
```typescript
adminApi.analytics.getRevenueAnalytics(): Promise<{
  totalRevenue: number;
  monthlyRevenue: number;
  revenueByTier: Record<string, number>;
  recentTransactions: any[];
  projectedRevenue: number;
}>
```

**Description:** Retrieves revenue and billing analytics.

**Example:**
```typescript
const revenue = await adminApi.analytics.getRevenueAnalytics();
console.log(`Monthly Revenue: $${revenue.monthlyRevenue.toFixed(2)}`);
console.log(`Projected Annual: $${revenue.projectedRevenue.toFixed(2)}`);
console.log(`Pro Tier Revenue: $${revenue.revenueByTier.pro.toFixed(2)}`);
console.log(`Premium Tier Revenue: $${revenue.revenueByTier.premium.toFixed(2)}`);
```

---

### Get User Activity Timeline
```typescript
adminApi.analytics.getUserActivityTimeline(limit?: number): Promise<any[]>
```

**Description:** Retrieves recent user activity across the platform.

**Parameters:**
- `limit` (optional) - Number of activities to return (default: 50)

**Example:**
```typescript
const activities = await adminApi.analytics.getUserActivityTimeline(20);
activities.forEach(activity => {
  console.log(`${activity.user}: ${activity.action} - ${activity.timestamp}`);
});
```

---

## 🎯 Complete Usage Example

```typescript
import { adminApi } from './lib/admin-api-endpoints';
import { useAuth } from './components/auth/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();

  // Verify admin access
  if (user.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Get platform statistics
      const stats = await adminApi.users.getPlatformStatistics();
      console.log('Platform Stats:', stats);

      // Get all users
      const users = await adminApi.users.getAllUsers();
      console.log(`Total Users: ${users.length}`);

      // Get quiz analytics
      const quizStats = await adminApi.analytics.getQuizStatistics();
      console.log(`Quiz Average: ${quizStats.averageScore}%`);

      // Get revenue data
      const revenue = await adminApi.analytics.getRevenueAnalytics();
      console.log(`Monthly Revenue: $${revenue.monthlyRevenue}`);

      // Get recent activity
      const activity = await adminApi.analytics.getUserActivityTimeline(10);
      console.log('Recent Activity:', activity);

      // Get all content
      const [groups, flashcards, quizzes, books] = await Promise.all([
        adminApi.content.getAllStudyGroups(),
        adminApi.content.getAllFlashcardSets(),
        adminApi.content.getAllQuizzes(),
        adminApi.content.getAllBooks()
      ]);

      console.log('Content Summary:', {
        groups: groups.length,
        flashcards: flashcards.length,
        quizzes: quizzes.length,
        books: books.length
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // Update user subscription
  const upgradeUser = async (userId: string) => {
    await adminApi.users.updateUserSubscription(userId, {
      tier: 'pro',
      status: 'active'
    });
    console.log('User upgraded to Pro!');
  };

  // Promote user to admin
  const promoteToAdmin = async (userId: string) => {
    await adminApi.users.updateUserRole(userId, 'admin');
    console.log('User promoted to admin!');
  };

  // Delete content
  const deleteContent = async (type: string, id: string) => {
    switch (type) {
      case 'group':
        await adminApi.content.deleteStudyGroup(id);
        break;
      case 'flashcard':
        await adminApi.content.deleteFlashcardSet(id);
        break;
      case 'quiz':
        await adminApi.content.deleteQuiz(id);
        break;
      case 'book':
        await adminApi.content.deleteBook(id);
        break;
    }
    console.log(`${type} deleted successfully!`);
  };

  return <div>Admin Dashboard</div>;
}
```

---

## 📈 Admin Dashboard Features

### User Management
- ✅ View all users with filtering
- ✅ Search users by name/email
- ✅ Update subscriptions
- ✅ Change user roles
- ✅ Suspend/unsuspend accounts
- ✅ Delete users
- ✅ View user statistics

### Content Management
- ✅ Manage study groups
- ✅ Manage flashcard sets
- ✅ Manage quizzes
- ✅ Manage books
- ✅ Delete any content
- ✅ View content statistics

### Analytics & Reporting
- ✅ Platform-wide statistics
- ✅ Quiz performance metrics
- ✅ Flashcard retention rates
- ✅ Study planner usage
- ✅ Revenue analytics
- ✅ User activity timeline
- ✅ Category breakdowns

---

## 🔒 Security Notes

1. **All admin endpoints are protected** and require admin role authentication
2. **Deletion operations are permanent** - implement confirmation dialogs
3. **User data is sensitive** - follow privacy regulations
4. **Activity logging** - Track all admin actions for audit trails
5. **Rate limiting** - Implement rate limits on sensitive operations

---

## 🚀 Performance Tips

1. **Use filters** when fetching large datasets
2. **Implement pagination** for user lists
3. **Cache statistics** when appropriate
4. **Load data on-demand** rather than all at once
5. **Use parallel requests** with `Promise.all()` for multiple data sources

---

**Last Updated:** 2024  
**Version:** 1.0  
**Total Endpoints:** 25+  
**API Status:** ✅ Production Ready
