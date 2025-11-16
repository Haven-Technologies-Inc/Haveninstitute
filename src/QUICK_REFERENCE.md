# 🚀 NurseHaven Admin - Quick Reference Guide

## **Getting Started**

### **Access Admin Dashboard:**
```typescript
// User must be authenticated with admin role
// Navigate to admin route and the system auto-routes based on role
<AdminDashboard onBack={() => navigate('/')} />
```

### **Change Routes:**
```typescript
// From any component with access to onTabChange
onTabChange('content')      // Go to Content Management
onTabChange('website')      // Go to Website CMS
onTabChange('users')        // Go to User Management
```

---

## **Quick API Usage Examples**

### **Content Management API:**

```typescript
import {
  createContent,
  getAllContent,
  updateContent,
  deleteContent,
  duplicateContent
} from './services/contentManagementApi';

// Create new content
const newContent = await createContent({
  type: 'quiz',
  title: 'NCLEX Practice Quiz',
  category: 'management-of-care',
  content: { /* quiz data */ },
  status: 'draft',
  author: { id: 'user-123', name: 'Admin' },
  // ... other fields
});

// Get all content with filters
const content = await getAllContent({
  type: 'quiz',
  status: 'published',
  category: 'pharmacology',
  limit: 20,
  offset: 0
});

// Update content
await updateContent('content-id', {
  title: 'Updated Title',
  status: 'published'
});

// Duplicate content
const duplicate = await duplicateContent('content-id', 'New Title');

// Delete content
await deleteContent('content-id', false); // soft delete (archive)
await deleteContent('content-id', true);  // permanent delete
```

### **Website Content API:**

```typescript
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllPricingPlans,
  updatePricingPlan
} from './services/websiteContentApi';

// Create testimonial
const testimonial = await createTestimonial({
  name: 'Sarah Johnson',
  role: 'RN, Passed NCLEX',
  avatar: 'https://example.com/avatar.jpg',
  content: 'NurseHaven helped me pass on my first try!',
  rating: 5,
  verified: true,
  enabled: true,
  order: 1
});

// Update pricing plan
await updatePricingPlan('plan-id', {
  price: 39.99,
  features: ['Feature 1', 'Feature 2', 'Feature 3']
});

// Get all FAQs
const faqs = await getAllFAQs();

// Update hero section
await updateHeroSection({
  title: 'New Hero Title',
  subtitle: 'New Subtitle',
  ctaText: 'Get Started',
  ctaLink: '/signup'
});
```

### **User Management API:**

```typescript
import {
  getAllUsers,
  createUser,
  updateUser,
  changeUserRole,
  uploadAvatar
} from './services/userManagementApi';

// Get users with filters
const users = await getAllUsers({
  role: 'user',
  status: 'active',
  search: 'john',
  limit: 20,
  page: 1
});

// Create new user
const user = await createUser({
  email: 'user@example.com',
  fullName: 'John Doe',
  role: 'user',
  status: 'active'
});

// Change user role
await changeUserRole('user-id', 'admin');

// Upload avatar
await uploadAvatar('user-id', avatarFile);
```

---

## **Component Usage Examples**

### **Navigate to Specific Tab:**

```typescript
// From AdminOverview or any component with onTabChange
<Card onClick={() => onTabChange('content')}>
  <CardTitle>Content Management</CardTitle>
</Card>

// Or using button
<Button onClick={() => onTabChange('website')}>
  Go to Website CMS
</Button>
```

### **Toast Notifications:**

```typescript
import { toast } from 'sonner@2.0.3';

// Success
toast.success('Content created successfully');

// Error
toast.error('Failed to update content');

// Info
toast.info('Processing your request...');

// Warning
toast.warning('This action cannot be undone');
```

### **Dark Mode Toggle:**

```typescript
// In any component
const toggleDarkMode = () => {
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};
```

---

## **Common Patterns**

### **CRUD Pattern:**

```typescript
// 1. State for data
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);

// 2. Load data
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await getAllItems();
    setItems(data);
  } catch (error) {
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};

// 3. Create
const handleCreate = async (formData) => {
  try {
    await createItem(formData);
    toast.success('Item created');
    loadData(); // Reload
  } catch (error) {
    toast.error('Failed to create');
  }
};

// 4. Update
const handleUpdate = async (id, formData) => {
  try {
    await updateItem(id, formData);
    toast.success('Item updated');
    loadData();
  } catch (error) {
    toast.error('Failed to update');
  }
};

// 5. Delete
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  try {
    await deleteItem(id);
    toast.success('Item deleted');
    loadData();
  } catch (error) {
    toast.error('Failed to delete');
  }
};

// 6. Duplicate
const handleDuplicate = async (id) => {
  try {
    await duplicateItem(id);
    toast.success('Item duplicated');
    loadData();
  } catch (error) {
    toast.error('Failed to duplicate');
  }
};
```

### **Form Pattern:**

```typescript
// 1. Form state
const [formData, setFormData] = useState({
  title: '',
  description: '',
  category: '',
  // ... other fields
});

// 2. Update field
const updateField = (field, value) => {
  setFormData({ ...formData, [field]: value });
};

// 3. Submit
const handleSubmit = async () => {
  try {
    await saveData(formData);
    toast.success('Saved successfully');
    onClose(); // Close dialog
  } catch (error) {
    toast.error('Failed to save');
  }
};

// 4. JSX
<Input
  value={formData.title}
  onChange={(e) => updateField('title', e.target.value)}
  placeholder="Enter title"
/>
```

### **Filtering Pattern:**

```typescript
// 1. Filter state
const [filters, setFilters] = useState({
  search: '',
  category: '',
  status: '',
  page: 1
});

// 2. Update filter
const updateFilter = (key, value) => {
  setFilters({ ...filters, [key]: value, page: 1 });
};

// 3. Apply filters
useEffect(() => {
  loadData(filters);
}, [filters]);

// 4. JSX
<Input
  value={filters.search}
  onChange={(e) => updateFilter('search', e.target.value)}
  placeholder="Search..."
/>

<select
  value={filters.category}
  onChange={(e) => updateFilter('category', e.target.value)}
>
  <option value="">All Categories</option>
  {/* ... options */}
</select>
```

---

## **Styling Guidelines**

### **Dark Mode Classes:**

```typescript
// Always include dark mode classes
className="bg-white dark:bg-gray-800"
className="text-gray-900 dark:text-white"
className="border-gray-200 dark:border-gray-700"
className="hover:bg-gray-100 dark:hover:bg-gray-700"
```

### **Common Color Schemes:**

```typescript
// Primary (Purple/Blue gradient)
className="bg-gradient-to-r from-purple-600 to-blue-600"

// Success (Green)
className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"

// Error (Red)
className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"

// Warning (Yellow)
className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"

// Info (Blue)
className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
```

### **Responsive Utilities:**

```typescript
// Hide on mobile, show on desktop
className="hidden md:block"

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Flex responsive
className="flex flex-col md:flex-row"

// Text size responsive
className="text-sm md:text-base lg:text-lg"
```

---

## **File Structure**

```
/components/
  /admin/
    AdminDashboard.tsx          // Main router
    AdminLayout.tsx             // Layout wrapper
    ContentManagement.tsx       // Content hub
    WebsiteContentManagement.tsx // Website CMS
    RoleBasedUserManagement.tsx // User admin
    QuestionUpload.tsx          // Question upload
    QuestionManager.tsx         // Question editor
    AdminAnalyticsEnhanced.tsx  // Analytics
    BillingRevenue.tsx          // Revenue
    AdminSettings.tsx           // Settings
    BookManagement.tsx          // Books
    AdminOverview.tsx           // Dashboard home

/services/
  contentManagementApi.ts       // 65+ endpoints
  websiteContentApi.ts          // 50+ endpoints
  userManagementApi.ts          // User management
  authApi.ts                    // Authentication
  paymentApi.ts                 // Payments
  index.ts                      // Central export hub

/types/
  (Defined in each service file with export)
```

---

## **Route Reference**

| Tab ID | Component | Description |
|--------|-----------|-------------|
| `overview` | AdminOverview | Dashboard home |
| `upload` | QuestionUpload | Bulk upload |
| `manage` | QuestionManager | Question editor |
| `content` | ContentManagement | Content hub |
| `books` | BookManagement | Book library |
| `website` | WebsiteContentManagement | Landing CMS |
| `analytics` | AdminAnalyticsEnhanced | Analytics |
| `users` | RoleBasedUserManagement | User admin |
| `revenue` | BillingRevenue | Revenue |
| `settings` | AdminSettings | Settings |

---

## **Keyboard Shortcuts**

(Ready to implement)

```typescript
// Navigation
Ctrl/Cmd + 1-9: Navigate to route 1-9
Ctrl/Cmd + K: Open search
Ctrl/Cmd + N: Create new
Ctrl/Cmd + S: Save
Esc: Close dialog

// Selection
Ctrl/Cmd + A: Select all
Shift + Click: Select range
```

---

## **LocalStorage Keys**

```typescript
// Content
'content_items'               // All content items
'content_history'             // Content activity log

// Website
'nursehaven_website_content'  // Landing page content

// Users
'users'                       // User list
'user_activity'               // User activity
'audit_logs'                  // Audit trail

// Settings
'theme'                       // 'light' or 'dark'
'auth_token'                  // Auth token
'user_session'                // Current session
```

---

## **Error Handling**

```typescript
// Always wrap API calls
try {
  const result = await apiCall();
  toast.success('Success!');
  return result;
} catch (error: any) {
  console.error('Error:', error);
  toast.error(error.message || 'An error occurred');
  throw error;
}

// For user-facing errors
catch (error: any) {
  if (error.statusCode === 404) {
    toast.error('Item not found');
  } else if (error.statusCode === 403) {
    toast.error('Permission denied');
  } else {
    toast.error('Something went wrong');
  }
}
```

---

## **TypeScript Tips**

```typescript
// Import types
import type {
  ContentItem,
  ContentFilters,
  ContentStatus
} from './services/contentManagementApi';

// Type component props
interface MyComponentProps {
  items: ContentItem[];
  onSelect: (id: string) => void;
}

// Type state
const [items, setItems] = useState<ContentItem[]>([]);

// Type async functions
const loadData = async (): Promise<ContentItem[]> => {
  const data = await getAllContent();
  return data;
};
```

---

## **Performance Tips**

```typescript
// 1. Debounce search
import { debounce } from './services';

const debouncedSearch = debounce((query: string) => {
  searchContent(query);
}, 300);

// 2. Memoize expensive calculations
const stats = useMemo(() => calculateStats(data), [data]);

// 3. Lazy load components
const AdminSettings = lazy(() => import('./AdminSettings'));

// 4. Paginate large lists
const paginatedItems = items.slice(
  (page - 1) * limit,
  page * limit
);

// 5. Virtual scrolling for very large lists
// (Use react-window or similar)
```

---

## **Testing Checklist**

```typescript
// For each new feature:
☐ Create operation works
☐ Read/List operation works
☐ Update operation works
☐ Delete operation works
☐ Duplicate works (if applicable)
☐ Filters work correctly
☐ Search functions properly
☐ Pagination works
☐ Dark mode looks good
☐ Mobile view works
☐ Errors handled gracefully
☐ Success messages show
☐ Data persists on reload
```

---

## **Common Issues & Solutions**

### **Issue: Dark mode not persisting**
```typescript
// Solution: Check localStorage
useEffect(() => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}, []);
```

### **Issue: Data not refreshing**
```typescript
// Solution: Call loadData() after mutations
const handleUpdate = async () => {
  await updateItem(id, data);
  await loadData(); // <-- Don't forget this
};
```

### **Issue: TypeScript errors**
```typescript
// Solution: Import types properly
import type { ContentItem } from './services/contentManagementApi';

// Not: import { ContentItem } from './services/contentManagementApi';
```

### **Issue: Routing not working**
```typescript
// Solution: Check activeTab value
console.log('Active tab:', activeTab);

// Ensure tab ID matches exactly
{activeTab === 'content' && <ContentManagement />}
```

---

## **Useful Commands**

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Type checking
npm run type-check   # Check TypeScript

# Linting
npm run lint         # Run linter
npm run lint:fix     # Fix linting issues
```

---

## **Support & Resources**

- **Full Documentation:** `/ROUTING_DOCUMENTATION.md`
- **Implementation Details:** `/IMPLEMENTATION_COMPLETE.md`
- **API Reference:** Check individual service files
- **Component Examples:** Look at existing admin components

---

## **🎉 Quick Start Summary**

1. **Navigate to route:** `onTabChange('content')`
2. **Use API:** `import { createContent } from './services'`
3. **Show toast:** `toast.success('Done!')`
4. **Handle errors:** `try/catch` with toast
5. **Style with dark mode:** Add `dark:` classes
6. **Test responsively:** Check mobile, tablet, desktop
7. **Commit changes:** Follow git workflow

**Happy coding! 🚀**
